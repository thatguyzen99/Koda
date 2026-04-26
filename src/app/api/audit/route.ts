/**
 * Audit API — schema compliance audit endpoint.
 *
 * Data flow: client form (auditor page) → client validation → POST /api/audit
 * → server validation (this file) → Claude (runStructured) or mock fallback
 * → Supabase persist (koda_audits + koda_audit_findings via service role)
 * → JSON response → client maps server findings into UI Finding shape → render.
 * Persistence failures are logged but never break the response.
 */

import { NextRequest, NextResponse } from 'next/server';
import { isClaudeEnabled, runStructured } from '@/lib/claude';
import { getServiceSupabase } from '@/lib/supabase-server';

interface AuditRequestBody {
  schema_input?: unknown;
  schema_type?: unknown;
  jurisdictions?: unknown;
}

interface AuditFinding {
  severity: 'critical' | 'warning' | 'info';
  category: string;
  description: string;
  recommendation: string;
}

interface AuditResult {
  schema_id: string;
  status: 'passed' | 'failed' | 'review_required';
  total_findings: number;
  findings: AuditFinding[];
  compliance_score: number;
  last_audited: string;
}

const MAX_PAYLOAD_BYTES = 100 * 1024; // 100 KB
const MAX_JURISDICTION_LEN = 32;
const SCHEMA_TYPES = new Set(['sql', 'prisma', 'json', 'typescript']);

const SYSTEM_PROMPT = `You are Koda's compliance auditor for fintech systems operating in West Africa. You analyze database schemas, API specs, and other technical artifacts against regulatory frameworks.

You are an expert on:
- Central Bank of Liberia Mobile Financial Services Regulations (CBL-MFS-2023)
- ECOWAS Payment System Integration Framework (ECOWAS-PSIF-2024)
- Liberia Data Protection Act (LDPA-2023)
- WAEMU Directives on cross-border payments
- Bank of Ghana Payment Systems Regulation
- CBN Guidelines for Payment Service Providers (Nigeria)
- General KYC/AML / FATF best practice

For each schema you receive, identify concrete compliance gaps. Each finding must reference a specific regulatory clause, name the affected schema element, and provide an actionable recommendation. Prefer precision over volume — only flag findings you can defend.

You MUST return your analysis via the submit_audit tool. Do not respond with prose.`;

const auditTool = {
  type: 'object' as const,
  properties: {
    findings: {
      type: 'array' as const,
      description: 'List of compliance findings, ordered by severity (critical first).',
      items: {
        type: 'object' as const,
        properties: {
          severity: {
            type: 'string' as const,
            enum: ['critical', 'warning', 'info'],
            description: 'critical: must fix to ship; warning: should fix; info: nice to have.',
          },
          category: {
            type: 'string' as const,
            description: 'Short category (e.g. "KYC/AML", "Data Retention", "Encryption").',
          },
          description: {
            type: 'string' as const,
            description: 'What the issue is, naming the affected field/table where possible.',
          },
          recommendation: {
            type: 'string' as const,
            description: 'Concrete remediation action.',
          },
        },
        required: ['severity', 'category', 'description', 'recommendation'],
      },
    },
    overall_status: {
      type: 'string' as const,
      enum: ['passed', 'failed', 'review_required'],
    },
  },
  required: ['findings', 'overall_status'],
};

function performMockAudit(jurisdictions: string[], schemaType: string): AuditResult {
  const findings: AuditFinding[] = [];
  if (jurisdictions.some((j) => ['liberia', 'ghana', 'cbl-mfs'].includes(j.toLowerCase()))) {
    findings.push({
      severity: 'critical',
      category: 'KYC/AML',
      description: 'Customer verification fields not encrypted at rest',
      recommendation: 'Implement tiered KYC with AES-256 encryption for PII columns',
    });
  }
  if (schemaType === 'transaction' || schemaType === 'sql') {
    findings.push({
      severity: 'warning',
      category: 'Data Retention',
      description: 'Transaction records must be retained for minimum 5 years',
      recommendation: 'Add immutable audit log table and retention policy',
    });
    findings.push({
      severity: 'info',
      category: 'Monitoring',
      description: 'No real-time transaction monitoring detected',
      recommendation: 'Integrate fraud detection signals into transaction pipeline',
    });
  }
  if (jurisdictions.some((j) => j.toLowerCase() === 'ecowas')) {
    findings.push({
      severity: 'warning',
      category: 'Regional Compliance',
      description: 'ECOWAS cross-border transfer reporting obligations apply',
      recommendation: 'Capture ECOWAS-required corridor metadata on every transaction',
    });
  }
  const critical = findings.filter((f) => f.severity === 'critical').length;
  return {
    schema_id: `audit_${Date.now()}`,
    status: critical > 0 ? 'review_required' : 'passed',
    total_findings: findings.length,
    findings,
    compliance_score: Math.max(
      40,
      100 - critical * 25 - findings.filter((f) => f.severity === 'warning').length * 8
    ),
    last_audited: new Date().toISOString(),
  };
}

function scoreFromFindings(findings: AuditFinding[]) {
  const c = findings.filter((f) => f.severity === 'critical').length;
  const w = findings.filter((f) => f.severity === 'warning').length;
  return Math.max(20, 100 - c * 20 - w * 6);
}

function invalid(message: string, field: string) {
  return NextResponse.json(
    { error: { code: 'INVALID_INPUT', message, field } },
    { status: 400 }
  );
}

interface ValidatedInput {
  schemaText: string;
  schemaType: 'sql' | 'prisma' | 'json' | 'typescript';
  jurisdictions: string[];
}

function validate(body: AuditRequestBody): ValidatedInput | NextResponse {
  // schema_type
  if (typeof body.schema_type !== 'string' || !SCHEMA_TYPES.has(body.schema_type)) {
    return invalid(
      'schema_type must be one of: sql, prisma, json, typescript',
      'schema_type'
    );
  }
  const schemaType = body.schema_type as ValidatedInput['schemaType'];

  // jurisdictions
  if (!Array.isArray(body.jurisdictions) || body.jurisdictions.length === 0) {
    return invalid('jurisdictions must be a non-empty array of strings', 'jurisdictions');
  }
  const jurisdictions: string[] = [];
  for (const j of body.jurisdictions) {
    if (typeof j !== 'string' || j.trim().length === 0) {
      return invalid('every jurisdiction must be a non-empty string', 'jurisdictions');
    }
    if (j.length > MAX_JURISDICTION_LEN) {
      return invalid(
        `jurisdiction values must be ≤ ${MAX_JURISDICTION_LEN} characters`,
        'jurisdictions'
      );
    }
    jurisdictions.push(j);
  }

  // schema_input
  let schemaText: string;
  if (typeof body.schema_input === 'string') {
    schemaText = body.schema_input;
  } else if (
    body.schema_input !== null &&
    typeof body.schema_input === 'object'
  ) {
    try {
      schemaText = JSON.stringify(body.schema_input, null, 2);
    } catch {
      return invalid('schema_input could not be serialized to JSON', 'schema_input');
    }
  } else {
    return invalid(
      'schema_input must be a non-empty string or object',
      'schema_input'
    );
  }
  if (!schemaText || schemaText.trim().length === 0) {
    return invalid('schema_input must not be empty', 'schema_input');
  }

  // payload size budget — use the serialized schema as the dominant factor
  const totalBytes = Buffer.byteLength(
    schemaText + JSON.stringify({ schemaType, jurisdictions }),
    'utf8'
  );
  if (totalBytes > MAX_PAYLOAD_BYTES) {
    return invalid('payload exceeds 100 KB limit', 'schema_input');
  }

  return { schemaText, schemaType, jurisdictions };
}

async function persistAudit(
  audit: AuditResult,
  input: ValidatedInput,
  source: 'claude' | 'mock'
): Promise<string | null> {
  const supabase = getServiceSupabase();
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from('koda_audits')
      .insert({
        status: audit.status,
        compliance_score: audit.compliance_score,
        schema_type: input.schemaType,
        jurisdictions: input.jurisdictions,
        source,
        findings_count: audit.total_findings,
        schema_input: input.schemaText,
      })
      .select('id')
      .single();

    if (error || !data) {
      console.warn('Audit persist failed:', error?.message);
      return null;
    }

    if (audit.findings.length > 0) {
      const rows = audit.findings.map((f, i) => ({
        audit_id: data.id,
        severity: f.severity,
        category: f.category,
        description: f.description,
        recommendation: f.recommendation,
        position: i,
      }));
      const { error: findingsError } = await supabase
        .from('koda_audit_findings')
        .insert(rows);
      if (findingsError) {
        console.warn('Audit findings persist failed:', findingsError.message);
      }
    }

    return data.id as string;
  } catch (e) {
    console.warn('Audit persist threw:', e);
    return null;
  }
}

export async function POST(request: NextRequest) {
  let body: AuditRequestBody;
  try {
    body = (await request.json()) as AuditRequestBody;
  } catch {
    return invalid('request body must be valid JSON', 'body');
  }

  const validated = validate(body);
  if (validated instanceof NextResponse) return validated;

  try {
    let audit: AuditResult;
    let source: 'claude' | 'mock';

    if (!isClaudeEnabled()) {
      audit = performMockAudit(validated.jurisdictions, validated.schemaType);
      source = 'mock';
    } else {
      const userPrompt = `Audit this ${validated.schemaType} schema against the following jurisdictions: ${validated.jurisdictions.join(', ')}.

\`\`\`${validated.schemaType}
${validated.schemaText}
\`\`\`

Identify all compliance gaps. Submit the audit via the submit_audit tool.`;

      const result = await runStructured<{
        findings: AuditFinding[];
        overall_status: 'passed' | 'failed' | 'review_required';
      }>({
        systemPrompt: SYSTEM_PROMPT,
        userPrompt,
        toolName: 'submit_audit',
        toolDescription: 'Submit the structured compliance audit findings.',
        inputSchema: auditTool,
        maxTokens: 4096,
      });

      audit = {
        schema_id: `audit_${Date.now()}`,
        status: result.overall_status,
        total_findings: result.findings.length,
        findings: result.findings,
        compliance_score: scoreFromFindings(result.findings),
        last_audited: new Date().toISOString(),
      };
      source = 'claude';
    }

    const persistedId = await persistAudit(audit, validated, source);
    if (persistedId) {
      audit = { ...audit, schema_id: persistedId };
    }

    return NextResponse.json(
      {
        success: true,
        audit,
        source,
        ...(persistedId ? { id: persistedId } : {}),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Audit failed:', error);
    return NextResponse.json(
      { error: { code: 'AUDIT_FAILED', message: 'Failed to perform audit' } },
      { status: 500 }
    );
  }
}
