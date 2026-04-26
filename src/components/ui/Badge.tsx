import * as React from 'react';
import { cn } from '@/lib/utils';

export type BadgeVariant =
  | 'default'
  | 'critical'
  | 'danger'
  | 'warning'
  | 'pass'
  | 'success'
  | 'info'
  | 'accent';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-slate-100 text-slate-700 border border-slate-200',
  critical: 'bg-red-50 text-red-700 border border-red-200',
  danger: 'bg-red-50 text-red-700 border border-red-200',
  warning: 'bg-amber-50 text-amber-700 border border-amber-200',
  pass: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  success: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  info: 'bg-sky-50 text-sky-700 border border-sky-200',
  accent: 'bg-violet-50 text-violet-700 border border-violet-200',
};

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'default', ...props }, ref) => (
    <span
      ref={ref}
      className={cn(
        'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold',
        variantStyles[variant],
        className
      )}
      {...props}
    />
  )
);
Badge.displayName = 'Badge';

export default Badge;
