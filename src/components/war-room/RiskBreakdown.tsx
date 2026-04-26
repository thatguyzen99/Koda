'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface RiskBreakdownProps {
  critical: number;
  warning: number;
  passing: number;
}

export default function RiskBreakdown({ critical, warning, passing }: RiskBreakdownProps) {
  const [animated, setAnimated] = useState(false);
  useEffect(() => setAnimated(true), []);

  const total = (critical ?? 0) + (warning ?? 0) + (passing ?? 0);
  const safeTotal = total > 0 ? total : 1;
  const cPct = ((critical ?? 0) / safeTotal) * 100;
  const wPct = ((warning ?? 0) / safeTotal) * 100;
  const pPct = ((passing ?? 0) / safeTotal) * 100;

  const segments = [
    { pct: cPct, gradient: 'from-red-500 to-red-400', label: 'Critical' },
    { pct: wPct, gradient: 'from-amber-500 to-amber-400', label: 'Warning' },
    { pct: pPct, gradient: 'from-emerald-500 to-emerald-400', label: 'Passing' },
  ];

  return (
    <div className="space-y-6">
      {/* Stacked bar */}
      <div>
        <div className="flex h-3 gap-0.5 overflow-hidden rounded-full bg-slate-100">
          {segments.map((seg, i) => (
            <motion.div
              key={seg.label}
              className={`bg-gradient-to-r ${seg.gradient}`}
              initial={{ width: '0%' }}
              animate={animated ? { width: `${seg.pct}%` } : { width: '0%' }}
              transition={{ duration: 0.9, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
            />
          ))}
        </div>
      </div>

      {/* Tiles */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { count: critical, pct: cPct, label: 'Critical', color: 'text-red-600', dot: 'bg-red-500', tile: 'bg-red-50/60 ring-red-200' },
          { count: warning, pct: wPct, label: 'Warning', color: 'text-amber-600', dot: 'bg-amber-500', tile: 'bg-amber-50/60 ring-amber-200' },
          { count: passing, pct: pPct, label: 'Passing', color: 'text-emerald-600', dot: 'bg-emerald-500', tile: 'bg-emerald-50/60 ring-emerald-200' },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 8 }}
            animate={animated ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.25 + i * 0.08, duration: 0.4 }}
            className={`rounded-xl ring-1 p-4 ${s.tile}`}
          >
            <div className="flex items-center gap-2">
              <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-600">
                {s.label}
              </p>
            </div>
            <p className={`tabular mt-2 font-heading text-3xl font-bold leading-none ${s.color}`}>
              {s.count}
            </p>
            <p className="tabular mt-1 text-xs text-slate-500">{s.pct.toFixed(1)}%</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
