import { NextRequest, NextResponse } from 'next/server';
import { isClaudeEnabled, runStructured } from '@/lib/claude';

interface PRDGenerateRequest {
  description: string;
  jurisdictions: string[];
}

interface GeneratedPRD {
  executiveSummary: string;
  regulatoryRequirements: string[];
  dataModel: { entities: string[]; relationships: string[] };
  apiSpecs: { endpoints: Array<{ method: string; path: string; description: string }> };
  securityRequirements: string[];
}

const SYSTEM_PROMPT = `You are Koda's compliance PRD generator. From a casual product idea, you produce a Product Requirements Document that bakes regulatory requirements into the spec from day one.

You are an expert in:
- Central Bank of Liberia Mobile Financial Services Regulations (CBL-MFS-2023)
- ECOWAS Payment System Integration Framework (ECOWAS-PSIF-2024)
- Liberia Data Protection Act (LDPA-2023)
- WAEMU Directives, Bank of Ghana Payment Systems Regulation, CBN Guidelines (Nigeria)
- Sierra Leone Money Services Regulation
- General KYC/AML / FATF / PCI DSS / GDPR-equivalent privacy

Your output must be specific to the jurisdictions selected — do not generalize.

You MUST submit the PRD via the submit_prd tool. Do not respond with prose.`;

const prdTool = {
  type: 'object' as const,
  properties: {
    executiveSummary: {
      type: 'string' as const,
      description: '2-4 sentences summarizing what the product does and which jurisdictions it operates in.',
    },
    regulatoryRequirements: {
      type: 'array' as const,
      description: 'List of jurisdiction-specific compliance requirements that this product must meet. Be concrete and reference frameworks by name.',
      items: { type: 'string' as const },
    },
    dataModel: {
      type: 'object' as const,
      properties: {
        entities: {
          type: 'array' as const,
          description: 'Core data entities the product needs (e.g. "User (with KYC tier and verification documents)").',
          items: { type: 'string' as const },
        },
        relationships: {
          type: 'array' as const,
          description: 'How entities relate (e.g. "User has many Wallets (1:N)").',
          items: { type: 'string' as const },
        },
      },
      required: ['entities', 'relationships'],
    },
    apiSpecs: {
      type: 'object' as const,
      properties: {
        endpoints: {
          type: 'array' as const,
          items: {
            type: 'object' as const,
            properties: {
              method: { type: 'string' as const, enum: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'] },
              path: { type: 'string' as const },
              description: { type: 'string' as const },
            },
            required: ['method', 'path', 'description'],
          },
        },
      },
      required: ['endpoints'],
    },
    securityRequirements: {
      type: 'array' as const,
      description: 'Security controls the product must implement (encryption, access control, audit logging, incident response, etc).',
      items: { type: 'string' as const },
    },
  },
  required: ['executiveSummary', 'regulatoryRequirements', 'dataModel', 'apiSpecs', 'securityRequirements'],
};

function generateMockPRD(description: string, jurisdictions: string[]): GeneratedPRD {
  const map: Record<string, string> = {
    liberia: 'Liberia',
    ghana: 'Ghana',
    nigeria: 'Nigeria',
    'sierra-leone': 'Sierra Leone',
    ecowas: 'ECOWAS Regional',
  };
  const names = jurisdictions.map((j) => map[j] || j);
  return {
    executiveSummary: `Compliance-aware PRD for a fintech product operating across ${names.join(', ')}. The product addresses ${description.slice(0, 80)}... while meeting cross-border KYC/AML, data protection, and settlement requirements.`,
    regulatoryRequirements: [
      'Obtain Money Transmitter / Payment Service Provider license in each operational jurisdiction',
      'Implement tiered KYC per Central Bank requirements with EDD for high-risk customers',
      'File Suspicious Activity Reports (SARs) and meet AML transaction monitoring requirements',
      'Retain transaction records for minimum 5 years with immutable audit trail',
      'Comply with applicable data protection regimes (LDPA, Ghana DPA, equivalents)',
      'Establish BCDR plans and conduct regular compliance audits',
    ],
    dataModel: {
      entities: [
        'User (with KYC verification tier and document refs)',
        'Wallet (with balance, currency, and transaction limits)',
        'Transaction (with compliance flags and audit trail)',
        'RegulatoryReport (SARs, CTRs)',
        'MobileMoneyProvider (with API credentials)',
        'Jurisdiction (regulatory rules and limits)',
      ],
      relationships: [
        'User has many Wallets (1:N)',
        'Wallet has many Transactions (1:N)',
        'Transaction links two Wallets (N:N via TransactionLeg)',
        'User belongs to one Jurisdiction (N:1)',
        'Transaction triggers RegulatoryReports (1:N)',
      ],
    },
    apiSpecs: {
      endpoints: [
        { method: 'POST', path: '/api/auth/register', description: 'Register user and trigger tiered KYC' },
        { method: 'POST', path: '/api/wallets', description: 'Create wallet for verified user' },
        { method: 'POST', path: '/api/transactions/initiate', description: 'Initiate cross-border transaction with compliance checks' },
        { method: 'GET', path: '/api/transactions/:id/status', description: 'Check transaction status and compliance flags' },
        { method: 'POST', path: '/api/momo/transfer', description: 'Execute mobile money transfer' },
        { method: 'POST', path: '/api/compliance/kyc/verify', description: 'Verify KYC documents and update tier' },
        { method: 'GET', path: '/api/compliance/reports', description: 'Retrieve regulatory compliance reports' },
      ],
    },
    securityRequirements: [
      'TLS 1.3+ for all data in transit',
      'AES-256 encryption at rest for PII fields',
      'PCI DSS Level 1 if processing card data',
      'Multi-factor authentication for user and admin accounts',
      'Role-based access control with least-privilege defaults',
      'Immutable audit logging for all access and transactions',
      'Regular penetration testing and vulnerability assessments',
      'Incident response plan with regulator notification SLAs',
    ],
  };
}

const MAX_DESCRIPTION_LEN = 10_000;
const MAX_JURISDICTIONS = 16;
const MAX_JURISDICTION_LEN = 32;

function invalid(message: string, field: string) {
  return NextResponse.json(
    { error: { code: 'INVALID_INPUT', message, field } },
    { status: 400 }
  );
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Partial<PRDGenerateRequest>;

    if (typeof body.description !== 'string' || body.description.trim().length === 0) {
      return invalid('description is required', 'description');
    }
    if (body.description.length > MAX_DESCRIPTION_LEN) {
      return invalid(
        `description must be ≤ ${MAX_DESCRIPTION_LEN} characters`,
        'description'
      );
    }
    if (!Array.isArray(body.jurisdictions) || body.jurisdictions.length === 0) {
      return invalid('jurisdictions must be a non-empty array', 'jurisdictions');
    }
    if (body.jurisdictions.length > MAX_JURISDICTIONS) {
      return invalid(
        `at most ${MAX_JURISDICTIONS} jurisdictions allowed`,
        'jurisdictions'
      );
    }
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
    }

    if (!isClaudeEnabled()) {
      const prd = generateMockPRD(body.description, body.jurisdictions);
      return NextResponse.json({ success: true, prd, source: 'mock' }, { status: 200 });
    }

    const userPrompt = `Generate a compliance-first PRD for the following idea, operating in: ${body.jurisdictions.join(', ')}.

Idea:
${body.description}

Submit the PRD via the submit_prd tool.`;

    const prd = await runStructured<GeneratedPRD>({
      systemPrompt: SYSTEM_PROMPT,
      userPrompt,
      toolName: 'submit_prd',
      toolDescription: 'Submit the structured compliance-aware PRD.',
      inputSchema: prdTool,
      maxTokens: 6000,
    });

    return NextResponse.json({ success: true, prd, source: 'claude' }, { status: 200 });
  } catch (error) {
    console.error('PRD generation failed:', error);
    return NextResponse.json(
      { error: 'Failed to generate PRD' },
      { status: 500 }
    );
  }
}
