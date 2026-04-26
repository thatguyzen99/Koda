import * as React from 'react';
import { cn } from '@/lib/utils';

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'ghost'
  | 'danger'
  | 'outline'
  | 'gradient';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  asChild?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-[#635BFF] text-white hover:bg-[#5247e6] active:bg-[#453dd0] shadow-sm hover:shadow-md hover:shadow-[#635BFF]/20',
  secondary:
    'bg-[#0A2540] text-white hover:bg-[#0F2F4F] active:bg-[#051a2a] shadow-sm hover:shadow-md',
  outline:
    'border border-slate-200 bg-white text-[#0A2540] hover:bg-slate-50 hover:border-slate-300',
  ghost: 'text-[#0A2540] hover:bg-slate-100 active:bg-slate-200',
  danger:
    'bg-[#ef4444] text-white hover:bg-[#dc2626] active:bg-[#b91c1c] shadow-sm hover:shadow-md',
  gradient:
    'bg-gradient-to-r from-[#635BFF] via-[#7C5CFF] to-[#A855F7] text-white shadow-md hover:shadow-lg hover:shadow-[#635BFF]/30 hover:brightness-110',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm font-medium rounded-lg gap-1.5',
  md: 'px-4 py-2.5 text-sm font-semibold rounded-lg gap-2',
  lg: 'px-6 py-3 text-base font-semibold rounded-xl gap-2',
  icon: 'h-9 w-9 rounded-lg',
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center whitespace-nowrap',
          'transition-all duration-200',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#635BFF] focus-visible:ring-offset-2',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';

export default Button;
