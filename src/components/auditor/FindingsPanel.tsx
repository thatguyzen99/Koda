'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, ShieldCheck, AlertTriangle, ChevronDown, FileSearch } from 'lucide-react';
import { cn } from '@/lib/utils';

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

interface FindingsPanelProps {
  findings: Finding[];
  isLoading: boolean;
}

const riskMeta: Record<
  Finding['riskLevel'],
  { label: string; icon: typeof ShieldAlert; pill: string; ring: string; accent: string }
> = {
  CRITICAL: {
    label: 'Critical',
    icon: ShieldAlert,
    pill: 'bg-red-50 text-red-700 ring-1 ring-red-200',
    ring: 'border-red-200',
    accent: 'bg-red-500',
  },
  WARNING: {
    label: 'Warning',
    icon: AlertTriangle,
    pill: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
    ring: 'border-amber-200',
    accent: 'bg-amber-500',
  },
  PASS: {
    label: 'Pass',
    icon: ShieldCheck,
    pill: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
    ring: 'border-emerald-200',
    accent: 'bg-emerald-500',
  },
};

export default function FindingsPanel({ findings, isLoading }: FindingsPanelProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const safeFindings = Array.isArray(findings) ? findings : [];

  const criticalCount = safeFindings.filter((f) => f.riskLevel === 'CRITICAL').length;
  const warningCount = safeFindings.filter((f) => f.riskLevel === 'WARNING').length;
  const passCount = safeFindings.filter((f) => f.riskLevel === 'PASS').length;

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white px-4 py-3">
        <div>
          <p className="text-sm font-semibold text-[#0A2540]">Compliance Report</p>
          <p className="text-[11px] text-slate-500">
            {safeFindings.length > 0
              ? `${safeFindings.length} findings analyzed`
              : 'Awaiting audit'}
          </p>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="space-y-3 p-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="shimmer h-24 rounded-xl" />
            ))}
          </div>
        ) : safeFindings.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center px-6 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-accent-500/10 to-magenta-500/10 ring-1 ring-accent-200">
              <FileSearch className="h-6 w-6 text-accent-600" />
            </div>
            <p className="text-sm font-semibold text-[#0A2540]">No audit run yet</p>
            <p className="mt-1 max-w-xs text-xs text-slate-500">
              Click <span className="font-semibold">Run Audit</span> to analyze your schema against the selected jurisdictions.
            </p>
          </div>
        ) : (
          <div className="space-y-3 p-4">
            {/* Summary tiles */}
            <div className="grid grid-cols-3 gap-2 pb-3">
              {(
                [
                  { count: criticalCount, label: 'Critical', tone: 'bg-red-500/10 text-red-700' },
                  { count: warningCount, label: 'Warning', tone: 'bg-amber-500/10 text-amber-700' },
                  { count: passCount, label: 'Pass', tone: 'bg-emerald-500/10 text-emerald-700' },
                ] as const
              ).map((s) => (
                <div
                  key={s.label}
                  className={cn(
                    'rounded-xl p-3 text-center font-semibold',
                    s.tone
                  )}
                >
                  <p className="tabular font-heading text-2xl font-bold leading-none">{s.count}</p>
                  <p className="mt-1 text-[10px] uppercase tracking-wider opacity-80">
                    {s.label}
                  </p>
                </div>
              ))}
            </div>

            <div className="hairline" />

            {/* Findings */}
            <AnimatePresence mode="popLayout">
              {safeFindings.map((finding) => {
                const meta = riskMeta[finding.riskLevel];
                const Icon = meta.icon;
                const expanded = expandedId === finding.id;
                return (
                  <motion.div
                    key={finding.id}
                    layout
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    className={cn(
                      'overflow-hidden rounded-xl border bg-white transition-shadow hover:shadow-card',
                      meta.ring
                    )}
                  >
                    <button
                      onClick={() => setExpandedId(expanded ? null : finding.id)}
                      className="flex w-full items-start gap-3 px-3.5 py-3 text-left transition-colors hover:bg-slate-50/60"
                    >
                      <div className={cn('relative mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg', meta.pill)}>
                        <Icon className="h-3.5 w-3.5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-mono text-[10px] uppercase tracking-wider text-slate-500">
                          {finding.regulation}
                        </p>
                        <p className="truncate font-mono text-sm font-semibold text-[#0A2540]">
                          {finding.fieldAffected}
                        </p>
                      </div>
                      <ChevronDown
                        className={cn(
                          'mt-1.5 h-4 w-4 flex-shrink-0 text-slate-400 transition-transform',
                          expanded && 'rotate-180'
                        )}
                      />
                    </button>
                    <AnimatePresence>
                      {expanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="border-t border-slate-100 bg-slate-50/40 px-3.5 py-3 space-y-3"
                        >
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                              Current
                            </p>
                            <p className="mt-1 text-xs leading-relaxed text-slate-700">
                              {finding.currentState}
                            </p>
                          </div>
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">
                              Required
                            </p>
                            <p className="mt-1 text-xs leading-relaxed text-slate-700">
                              {finding.requiredState}
                            </p>
                          </div>
                          <p className="text-[11px] font-semibold text-accent-600">
                            ↓ Fix suggestion available below
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
