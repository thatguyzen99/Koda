'use client';

import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Provider {
  id: string;
  name: string;
  code: string;
  country: string;
  color: string;
}

interface ProviderCardProps {
  provider: Provider;
  selected: boolean;
  isDestination: boolean;
  onClick: () => void;
}

export default function ProviderCard({
  provider,
  selected,
  isDestination,
  onClick,
}: ProviderCardProps) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 28 }}
      className={cn(
        'group relative w-full overflow-hidden rounded-2xl border bg-white p-5 text-left transition-all duration-200',
        selected
          ? 'border-accent-300 shadow-glow-accent'
          : 'border-slate-200 shadow-card hover:border-slate-300 hover:shadow-card-hover'
      )}
    >
      {/* Color halo */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full opacity-25 blur-2xl transition-opacity group-hover:opacity-40"
        style={{ backgroundColor: provider.color }}
      />

      <div className="relative flex items-center gap-4">
        <div
          className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl text-lg font-bold text-white shadow-md ring-1 ring-inset ring-white/30"
          style={{ backgroundColor: provider.color }}
        >
          {provider.code.slice(0, 2)}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-heading text-base font-bold text-[#0A2540]">
            {provider.name}
          </p>
          <p className="text-xs text-slate-500">{provider.country}</p>
        </div>
        {selected && (
          <motion.div
            initial={{ scale: 0, rotate: -45 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 24 }}
            className="flex h-6 w-6 items-center justify-center rounded-full bg-accent-500 text-white shadow-sm"
          >
            <Check className="h-3.5 w-3.5" strokeWidth={3} />
          </motion.div>
        )}
      </div>

      <div className="relative mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
        <span
          className={cn(
            'inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider',
            isDestination ? 'text-magenta-600' : 'text-accent-700'
          )}
        >
          <span
            className={cn(
              'h-1.5 w-1.5 rounded-full',
              isDestination ? 'bg-magenta-500' : 'bg-accent-500'
            )}
          />
          {isDestination ? 'Destination' : 'Source'}
        </span>
        <span className="text-[10px] font-mono uppercase text-slate-400">
          {provider.code}
        </span>
      </div>
    </motion.button>
  );
}
