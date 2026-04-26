'use client';

/**
 * Auditor page — paste a schema, pick jurisdictions, click Run Audit.
 *
 * Data flow: client form (this file) → client validation (empty schema /
 * missing jurisdictions surface inline) → POST /api/audit → server validation
 * → Claude or mock → Supabase persist → JSON response → mapApiFinding maps
 * server findings into the UI Finding shape → FindingsPanel + FixSuggestion render.
 * On mount we also GET /api/audit/history to populate the Recent Audits strip.
 */

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Loader2,
  ChevronDown,
  Sparkles,
  AlertCircle,
  RefreshCw,
  History,
  Wand2,
} from 'lucide-react';
import sampleViolations from '@/data/sample-violations.json';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { PageShell } from '@/components/layout/PageShell';
import CodeEditor from '@/components/auditor/CodeEditor';
import FindingsPanel from '@/components/auditor/FindingsPanel';
import FixSuggestion from '@/components/auditor/FixSuggestion';
import { cn } from '@/lib/utils';
import { useRotatingMessage } from '@/lib/use-rotating-message';

const AUDIT_PROGRESS = [
  'Parsing schema…',
  'Mapping fields to regulations…',
  'Cross-referencing CBL-MFS, ECOWAS, and DPA…',
  'Identifying compliance gaps…',
  'Drafting remediations…',
] as const;

interface Finding {
  id: string;
  riskLevel: 'CRITICAL' | 'WARNING' | 'PASS';
  regulation: string;
  fieldAffected: string;
  currentState: string;
  requiredState: string;
  fixSuggestion: string;
  language: string;
}

interface ApiFinding {
  severity: 'critical' | 'warning' | 'info';
  category: string;
  description: string;
  recommendation: string;
}

interface ApiAudit {
  schema_id: string;
  status: 'passed' | 'failed' | 'review_required';
  total_findings: number;
  findings: ApiFinding[];
  compliance_score: number;
  last_audited: string;
}

interface ApiResponse {
  success: boolean;
  audit?: ApiAudit;
  source?: 'claude' | 'mock';
  id?: string;
  error?: { code: string; message: string; field?: string };
}

interface RecentAudit {
  id: string;
  status: 'passed' | 'failed' | 'review_required';
  compliance_score: number;
  total_findings: number;
  schema_type: string;
  jurisdictions: string[];
  created_at: string;
  source: 'claude' | 'mock';
}

const SAMPLE_SCHEMA = `-- Non-compliant SQL Schema
CREATE TABLE customers (
  id INT PRIMARY KEY,
  name VARCHAR(255),
  phone_number VARCHAR(20),
  national_id VARCHAR(50),
  created_at TIMESTAMP
);

CREATE TABLE transactions (
  id INT PRIMARY KEY,
  customer_id INT,
  amount DECIMAL(10, 2),
  description TEXT,
  created_at TIMESTAMP
);`;

const SCHEMA_TYPES = ['SQL', 'Prisma', 'JSON', 'TypeScript'] as const;
const JURISDICTIONS = [
  { id: 'CBL-MFS', label: 'CBL-MFS', sub: 'Liberia' },
  { id: 'WAEMU', label: 'WAEMU', sub: 'Regional' },
  { id: 'FCA', label: 'FCA', sub: 'UK' },
  { id: 'GDPR', label: 'GDPR', sub: 'EU' },
];

type SchemaType = (typeof SCHEMA_TYPES)[number];

function severityToRisk(severity: ApiFinding['severity']): Finding['riskLevel'] {
  if (severity === 'critical') return 'CRITICAL';
  if (severity === 'warning') return 'WARNING';
  return 'PASS';
}

function mapApiFinding(
  f: ApiFinding,
  index: number,
  language: string
): Finding {
  // Server findings have category/description/recommendation; UI needs
  // regulation/fieldAffected/currentState/requiredState/fixSuggestion.
  // Synthesize sensible values from what we have.
  return {
    id: `f-${index}`,
    riskLevel: severityToRisk(f.severity),
    regulation: f.category || 'Compliance',
    fieldAffected: f.description.split(/[—.:]/)[0]?.trim() || f.category,
    currentState: f.description,
    requiredState:
      f.recommendation || 'Bring schema in line with the cited regulation.',
    fixSuggestion: f.recommendation || f.description,
    language,
  };
}

function formatRelativeDate(iso: string): string {
  try {
    const d = new Date(iso);
    const diff = Date.now() - d.getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  } catch {
    return iso;
  }
}

export default function AuditorPage() {
  const [schemaType, setSchemaType] = useState<SchemaType>('SQL');
  const [jurisdictions, setJurisdictions] = useState<string[]>(['CBL-MFS']);
  const [schemaCode, setSchemaCode] = useState(SAMPLE_SCHEMA);
  const [findings, setFindings] = useState<Finding[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showFixSuggestions, setShowFixSuggestions] = useState(false);
  const [schemaError, setSchemaError] = useState<string | null>(null);
  const [jurisdictionError, setJurisdictionError] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [recentAudits, setRecentAudits] = useState<RecentAudit[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const progressMessage = useRotatingMessage(isLoading, AUDIT_PROGRESS, 1400);

  const fetchHistory = async () => {
    setHistoryLoading(true);
    try {
      const res = await fetch('/api/audit/history', { cache: 'no-store' });
      const data = (await res.json()) as { audits?: RecentAudit[] };
      setRecentAudits(Array.isArray(data.audits) ? data.audits : []);
    } catch {
      setRecentAudits([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    void fetchHistory();
  }, []);

  const runAudit = async () => {
    // Client-side validation
    let hasError = false;
    if (!schemaCode || schemaCode.trim().length === 0) {
      setSchemaError('Paste a schema before running an audit.');
      hasError = true;
    } else {
      setSchemaError(null);
    }
    if (jurisdictions.length === 0) {
      setJurisdictionError('Select at least one jurisdiction.');
      hasError = true;
    } else {
      setJurisdictionError(null);
    }
    if (hasError) return;

    setIsLoading(true);
    setShowFixSuggestions(false);
    setApiError(null);

    try {
      const res = await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          schema_input: schemaCode,
          schema_type: schemaType.toLowerCase(),
          jurisdictions,
        }),
      });

      const data = (await res.json()) as ApiResponse;

      if (!res.ok || !data.success || !data.audit) {
        const message =
          data.error?.message ||
          `Audit failed (${res.status}). Please try again.`;
        setApiError(message);
        setFindings([]);
        return;
      }

      const language = schemaType.toLowerCase();
      const mapped = data.audit.findings.map((f, i) =>
        mapApiFinding(f, i, language)
      );
      setFindings(mapped);
      // Refresh history in the background; ignore errors.
      void fetchHistory();
    } catch (err) {
      setApiError(
        err instanceof Error
          ? `Network error: ${err.message}`
          : 'Network error contacting /api/audit.'
      );
      setFindings([]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleJurisdiction = (id: string) =>
    setJurisdictions((prev) => {
      const next = prev.includes(id) ? prev.filter((j) => j !== id) : [...prev, id];
      if (next.length > 0) setJurisdictionError(null);
      return next;
    });

  /**
   * Load curated demo findings from `sample-violations.json` directly
   * into the FindingsPanel — no API roundtrip. Used for live demos
   * where we want to show the post-audit UI without waiting on Claude.
   */
  const loadDemoFindings = () => {
    setApiError(null);
    setSchemaError(null);
    const language = schemaType.toLowerCase();
    const mapped: Finding[] = sampleViolations.violations.map((v) => ({
      id: v.id,
      riskLevel: v.severity as Finding['riskLevel'],
      regulation: v.regulation_ref,
      fieldAffected: v.affected_module,
      currentState: v.description,
      requiredState: v.recommended_action,
      fixSuggestion: v.recommended_action,
      language,
    }));
    setFindings(mapped);
  };

  const statusTone = (status: RecentAudit['status']) => {
    if (status === 'passed') return 'bg-emerald-50 text-emerald-700 ring-emerald-200';
    if (status === 'failed') return 'bg-red-50 text-red-700 ring-red-200';
    return 'bg-amber-50 text-amber-700 ring-amber-200';
  };

  return (
    <PageShell
      eyebrow={
        <>
          <Sparkles className="h-3 w-3" />
          Schema Auditor
        </>
      }
      title={
        <>
          Audit a schema in{' '}
          <span className="text-gradient-vibrant">seconds</span>
        </>
      }
      description="Paste a schema, pick the regulatory frameworks, and get back a prioritized list of compliance findings with copy-paste fixes."
      maxWidth="max-w-full"
      actions={
        <>
          <Button
            variant="outline"
            size="md"
            onClick={loadDemoFindings}
            disabled={isLoading}
            title="Load curated sample violations — no API call"
          >
            <Wand2 className="h-4 w-4" />
            Load demo findings
          </Button>
          <Button
            variant="gradient"
            size="md"
            onClick={runAudit}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="tabular-nums">{progressMessage}</span>
              </>
            ) : (
              <>
                <Play className="h-4 w-4" />
                Run Audit
              </>
            )}
          </Button>
        </>
      }
    >
      {/* Toolbar */}
      <div className="mb-6 flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200/60 bg-white/70 p-3 shadow-card backdrop-blur">
        <div className="flex items-center gap-2 rounded-xl bg-slate-100 p-1">
          {SCHEMA_TYPES.map((t) => (
            <button
              key={t}
              onClick={() => setSchemaType(t)}
              className={cn(
                'rounded-lg px-3 py-1.5 text-xs font-semibold transition-all',
                schemaType === t
                  ? 'bg-white text-[#0A2540] shadow-sm'
                  : 'text-slate-500 hover:text-[#0A2540]'
              )}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="ml-2 hidden h-6 w-px bg-slate-200 md:block" />
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="px-1 text-xs font-medium text-slate-500">Jurisdictions:</span>
          {JURISDICTIONS.map((j) => {
            const active = jurisdictions.includes(j.id);
            return (
              <button
                key={j.id}
                onClick={() => toggleJurisdiction(j.id)}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold transition-all',
                  active
                    ? 'border-accent-200 bg-accent-50 text-accent-700 shadow-sm shadow-accent-500/10'
                    : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'
                )}
              >
                <span
                  className={cn(
                    'h-1.5 w-1.5 rounded-full',
                    active ? 'bg-accent-500' : 'bg-slate-300'
                  )}
                />
                {j.label}
                <span className="text-[10px] font-normal opacity-60">{j.sub}</span>
              </button>
            );
          })}
        </div>
        {jurisdictionError && (
          <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-1 text-[11px] font-semibold text-red-700 ring-1 ring-red-200">
            <AlertCircle className="h-3 w-3" />
            {jurisdictionError}
          </span>
        )}
      </div>

      {/* Workspace */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Editor */}
        <motion.div
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="overflow-hidden rounded-2xl border border-slate-200/60 bg-white shadow-card lg:col-span-2"
        >
          <div className="flex items-center justify-between border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white px-4 py-2.5">
            <div className="flex items-center gap-2">
              <span className="flex gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
              </span>
              <span className="ml-2 font-mono text-xs text-slate-500">
                schema.{schemaType.toLowerCase()}
              </span>
            </div>
            <Badge variant="accent">{schemaType}</Badge>
          </div>
          <div className="h-[calc(100vh-360px)] min-h-[420px]">
            <CodeEditor
              value={schemaCode}
              onChange={(v) => {
                setSchemaCode(v);
                if (v && v.trim().length > 0) setSchemaError(null);
              }}
              language={schemaType.toLowerCase()}
            />
          </div>
          {schemaError && (
            <div className="flex items-center gap-2 border-t border-red-100 bg-red-50/70 px-4 py-2 text-xs font-semibold text-red-700">
              <AlertCircle className="h-3.5 w-3.5" />
              {schemaError}
            </div>
          )}
        </motion.div>

        {/* Findings */}
        <motion.div
          initial={{ opacity: 0, x: 8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15 }}
          className="overflow-hidden rounded-2xl border border-slate-200/60 bg-white shadow-card"
        >
          <div className="h-[calc(100vh-360px)] min-h-[420px]">
            {apiError ? (
              <div className="flex h-full flex-col items-center justify-center px-6 text-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 ring-1 ring-red-200">
                  <AlertCircle className="h-6 w-6 text-red-600" />
                </div>
                <p className="text-sm font-semibold text-[#0A2540]">
                  Audit failed
                </p>
                <p className="mt-1 max-w-xs text-xs text-slate-500">
                  {apiError}
                </p>
                <Button
                  variant="gradient"
                  size="sm"
                  className="mt-4"
                  onClick={runAudit}
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Retry
                </Button>
              </div>
            ) : (
              <FindingsPanel findings={findings} isLoading={isLoading} />
            )}
          </div>
        </motion.div>
      </div>

      {/* Fix Suggestions */}
      <AnimatePresence>
        {findings.length > 0 && !apiError && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mt-6 overflow-hidden rounded-2xl border border-slate-200/60 bg-white shadow-card"
          >
            <button
              onClick={() => setShowFixSuggestions((v) => !v)}
              className="flex w-full items-center justify-between px-5 py-4 text-left transition hover:bg-slate-50"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-accent-500 to-magenta-500 text-white shadow-sm shadow-accent-500/30">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#0A2540]">
                    Fix Suggestions
                  </p>
                  <p className="text-xs text-slate-500">
                    {findings.length} ready-to-apply remediations
                  </p>
                </div>
              </div>
              <ChevronDown
                className={cn(
                  'h-5 w-5 text-slate-400 transition-transform',
                  showFixSuggestions && 'rotate-180'
                )}
              />
            </button>
            <AnimatePresence>
              {showFixSuggestions && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="border-t border-slate-200"
                >
                  <div className="max-h-80 space-y-3 overflow-y-auto p-5">
                    {findings.map((finding) => (
                      <FixSuggestion
                        key={finding.id}
                        suggestion={finding.fixSuggestion}
                        language={finding.language}
                        regulation={finding.regulation}
                      />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Recent Audits */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-6 rounded-2xl border border-slate-200/60 bg-white/70 p-4 shadow-card backdrop-blur"
      >
        <div className="mb-3 flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-accent-500/10 to-magenta-500/10 ring-1 ring-accent-200">
            <History className="h-3.5 w-3.5 text-accent-600" />
          </div>
          <p className="text-sm font-semibold text-[#0A2540]">Recent Audits</p>
          <span className="text-xs text-slate-500">
            {historyLoading
              ? 'Loading…'
              : recentAudits.length === 0
                ? 'No audits saved yet'
                : `Last ${recentAudits.length}`}
          </span>
        </div>

        {historyLoading ? (
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="shimmer h-7 w-40 rounded-full"
              />
            ))}
          </div>
        ) : recentAudits.length === 0 ? (
          <p className="text-xs text-slate-500">
            Run your first audit to see it appear here.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            <AnimatePresence>
              {recentAudits.slice(0, 8).map((a) => (
                <motion.div
                  key={a.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={cn(
                    'inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-[11px] font-semibold ring-1 transition-shadow hover:shadow-card',
                    statusTone(a.status)
                  )}
                >
                  <span className="text-slate-500">
                    {formatRelativeDate(a.created_at)}
                  </span>
                  <span className="text-slate-300">·</span>
                  <span className="truncate max-w-[10rem] text-slate-700">
                    {a.jurisdictions.slice(0, 3).join(', ') || '—'}
                  </span>
                  <span className="text-slate-300">·</span>
                  <span className="tabular font-bold">
                    {a.compliance_score}
                  </span>
                  <span className="text-slate-300">·</span>
                  <span className="capitalize">
                    {a.status.replace('_', ' ')}
                  </span>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </motion.div>
    </PageShell>
  );
}
