'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

type StatTone = 'accent' | 'magenta' | 'sky' | 'success' | 'warning' | 'danger';

interface StatCardProps {
  label: string;
  value: React.ReactNode;
  helper?: React.ReactNode;
  icon?: React.ReactNode;
  tone?: StatTone;
  className?: string;
}

const toneStyles: Record<StatTone, { ring: string; glow: string; iconBg: string; valueColor: string }> = {
  accent: {
    ring: 'ring-accent-100',
    glow: 'from-accent-500/15 via-accent-500/5 to-transparent',
    iconBg: 'bg-accent-50 text-accent-600',
    valueColor: 'text-accent-700',
  },
  magenta: {
    ring: 'ring-magenta-400/30',
    glow: 'from-magenta-500/15 via-magenta-500/5 to-transparent',
    iconBg: 'bg-magenta-500/10 text-magenta-600',
    valueColor: 'text-magenta-600',
  },
  sky: {
    ring: 'ring-sky-200',
    glow: 'from-sky-500/15 via-sky-500/5 to-transparent',
    iconBg: 'bg-sky-50 text-sky-600',
    valueColor: 'text-sky-700',
  },
  success: {
    ring: 'ring-emerald-200',
    glow: 'from-emerald-500/15 via-emerald-500/5 to-transparent',
    iconBg: 'bg-emerald-50 text-emerald-600',
    valueColor: 'text-emerald-700',
  },
  warning: {
    ring: 'ring-amber-200',
    glow: 'from-amber-500/15 via-amber-500/5 to-transparent',
    iconBg: 'bg-amber-50 text-amber-600',
    valueColor: 'text-amber-700',
  },
  danger: {
    ring: 'ring-red-200',
    glow: 'from-red-500/15 via-red-500/5 to-transparent',
    iconBg: 'bg-red-50 text-red-600',
    valueColor: 'text-red-700',
  },
};

export function StatCard({
  label,
  value,
  helper,
  icon,
  tone = 'accent',
  className,
}: StatCardProps) {
  const styles = toneStyles[tone];

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'group relative overflow-hidden rounded-2xl border border-slate-200/60 bg-white p-6',
        'shadow-card hover:shadow-card-hover transition-shadow duration-300',
        className
      )}
    >
      {/* Soft gradient halo */}
      <div
        aria-hidden
        className={cn(
          'pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-gradient-to-br opacity-70 blur-2xl transition-opacity group-hover:opacity-100',
          styles.glow
        )}
      />

      <div className="relative flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            {label}
          </p>
          <p
            className={cn(
              'tabular mt-2 font-heading text-4xl font-bold leading-none',
              styles.valueColor
            )}
          >
            {value}
          </p>
          {helper && (
            <p className="mt-2 text-xs font-medium text-slate-500">{helper}</p>
          )}
        </div>
        {icon && (
          <div
            className={cn(
              'flex h-10 w-10 items-center justify-center rounded-xl',
              styles.iconBg
            )}
          >
            {icon}
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default StatCard;
