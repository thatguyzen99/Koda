'use client';

import { motion } from 'framer-motion';
import { Check, AlertTriangle, X, Loader2, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ComplianceCheckpoint {
  label: string;
  regulation: string;
  status: 'success' | 'warning' | 'critical' | 'pending';
}

interface TransactionFlowStep {
  icon: string;
  label: string;
  status: 'pending' | 'processing' | 'success' | 'warning' | 'critical';
  checkpoints: ComplianceCheckpoint[];
}

interface TransactionFlowProps {
  steps: TransactionFlowStep[];
}

const stepStyles = {
  success: { ring: 'ring-emerald-200', dot: 'bg-emerald-500', icon: Check, badge: 'bg-emerald-50 text-emerald-700 ring-emerald-200', label: 'Complete' },
  warning: { ring: 'ring-amber-200', dot: 'bg-amber-500', icon: AlertTriangle, badge: 'bg-amber-50 text-amber-700 ring-amber-200', label: 'Needs Review' },
  critical: { ring: 'ring-red-200', dot: 'bg-red-500', icon: X, badge: 'bg-red-50 text-red-700 ring-red-200', label: 'Failed' },
  processing: { ring: 'ring-accent-200', dot: 'bg-accent-500', icon: Loader2, badge: 'bg-accent-50 text-accent-700 ring-accent-200', label: 'In Progress' },
  pending: { ring: 'ring-slate-200', dot: 'bg-slate-300', icon: Circle, badge: 'bg-slate-100 text-slate-600 ring-slate-200', label: 'Pending' },
} as const;

const checkpointStyles = {
  success: 'bg-emerald-50/60 ring-emerald-200',
  warning: 'bg-amber-50/60 ring-amber-200',
  critical: 'bg-red-50/60 ring-red-200',
  pending: 'bg-slate-50 ring-slate-200',
} as const;

const checkpointIcons = {
  success: <Check className="h-3.5 w-3.5 text-emerald-600" strokeWidth={3} />,
  warning: <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />,
  critical: <X className="h-3.5 w-3.5 text-red-600" strokeWidth={3} />,
  pending: <Circle className="h-3.5 w-3.5 text-slate-400" />,
};

export default function TransactionFlow({ steps }: TransactionFlowProps) {
  return (
    <div className="relative">
      {/* Spine */}
      <div className="absolute left-7 top-7 bottom-12 w-px bg-gradient-to-b from-accent-200 via-slate-200 to-transparent" />

      <div className="space-y-5">
        {steps.map((step, index) => {
          const styles = stepStyles[step.status];
          const StepIcon = styles.icon;
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.08 }}
              className="relative flex gap-5"
            >
              {/* Status node */}
              <div
                className={cn(
                  'relative z-10 flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-white ring-4',
                  styles.ring
                )}
              >
                <span className="text-2xl">{step.icon}</span>
                <div
                  className={cn(
                    'absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full text-white shadow-sm',
                    styles.dot
                  )}
                >
                  <StepIcon
                    className={cn(
                      'h-3.5 w-3.5',
                      step.status === 'processing' && 'animate-spin'
                    )}
                    strokeWidth={3}
                  />
                </div>
              </div>

              {/* Body */}
              <div className="min-w-0 flex-1 pt-1.5">
                <div className="mb-3 flex items-center gap-3">
                  <h3 className="font-heading text-base font-bold text-[#0A2540]">
                    {step.label}
                  </h3>
                  <span
                    className={cn(
                      'inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ring-1',
                      styles.badge
                    )}
                  >
                    {styles.label}
                  </span>
                </div>

                {step.checkpoints.length > 0 && (
                  <div className="space-y-1.5">
                    {step.checkpoints.map((checkpoint, cpIndex) => (
                      <motion.div
                        key={cpIndex}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.08 + cpIndex * 0.04 }}
                        className={cn(
                          'flex items-center gap-3 rounded-xl px-3 py-2 ring-1',
                          checkpointStyles[checkpoint.status]
                        )}
                      >
                        <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center">
                          {checkpointIcons[checkpoint.status]}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold text-[#0A2540]">
                            {checkpoint.label}
                          </p>
                          <p className="font-mono text-[10px] uppercase tracking-wider text-slate-500">
                            {checkpoint.regulation}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
