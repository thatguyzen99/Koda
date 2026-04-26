import * as React from 'react';
import { cn } from '@/lib/utils';

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          'flex min-h-24 w-full rounded-xl border border-slate-200 bg-white px-4 py-3',
          'text-base text-[#0A2540] placeholder:text-slate-400',
          'shadow-sm transition-all',
          'focus:outline-none focus:ring-2 focus:ring-[#635BFF]/30 focus:border-[#635BFF]',
          'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-slate-50',
          'resize-y',
          className
        )}
        {...props}
      />
    );
  }
);
Textarea.displayName = 'Textarea';

export default Textarea;
