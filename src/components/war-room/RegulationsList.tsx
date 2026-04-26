'use client';

import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

interface RegulationFramework {
  id: string;
  name: string;
  jurisdiction: string;
  clauseCount: number;
  lastUpdated: Date;
  status: 'active' | 'pending' | 'archived';
}

const mockRegulations: RegulationFramework[] = [
  {
    id: '1',
    name: 'CBL MFS Regulations',
    jurisdiction: 'Liberia',
    clauseCount: 8,
    lastUpdated: new Date('2026-04-15'),
    status: 'active',
  },
  {
    id: '2',
    name: 'ECOWAS Payment Framework',
    jurisdiction: 'Regional',
    clauseCount: 5,
    lastUpdated: new Date('2026-04-10'),
    status: 'active',
  },
  {
    id: '3',
    name: 'Liberia Data Protection Act',
    jurisdiction: 'Liberia',
    clauseCount: 5,
    lastUpdated: new Date('2026-04-08'),
    status: 'active',
  },
];

const formatDate = (date: Date | null | undefined) => {
  if (!date || Number.isNaN(date.getTime())) return '—';
  const diffMs = Date.now() - date.getTime();
  if (diffMs < 0) {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
  const days = Math.floor(diffMs / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export default function RegulationsList() {
  return (
    <motion.div
      className="space-y-2"
      variants={{
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.07 } },
      }}
      initial="hidden"
      animate="visible"
    >
      {mockRegulations.map((reg) => (
        <motion.div
          key={reg.id}
          variants={{
            hidden: { opacity: 0, x: -8 },
            visible: { opacity: 1, x: 0 },
          }}
          className="group relative cursor-pointer overflow-hidden rounded-xl border border-slate-200 bg-white p-4 transition-all hover:border-accent-200 hover:shadow-card-hover"
        >
          <div
            aria-hidden
            className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-accent-500/0 blur-2xl transition-all group-hover:bg-accent-500/10"
          />
          <div className="relative flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="font-heading font-bold text-[#0A2540] transition-colors group-hover:text-accent-700">
                {reg.name}
              </p>
              <div className="mt-1.5 flex flex-wrap items-center gap-2">
                <Badge
                  variant={reg.jurisdiction === 'Regional' ? 'warning' : 'info'}
                >
                  {reg.jurisdiction}
                </Badge>
                <span className="text-xs text-slate-500">
                  {reg.clauseCount} clauses · {formatDate(reg.lastUpdated)}
                </span>
              </div>
            </div>
            <div className="flex flex-shrink-0 items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Active
              </span>
              <ArrowUpRight className="h-4 w-4 text-slate-400 transition-all group-hover:text-accent-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}
