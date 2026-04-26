'use client';

/**
 * Lightweight toast notification system — provider + hook.
 *
 * Mounted once at the root via `<Toaster>` in app/layout.tsx. Inside
 * any client component, call `useToast()` to get the imperative API:
 *
 *     const toast = useToast();
 *     toast.success('Saved.');
 *     toast.error('Network error.');
 *     toast.info('Heads up.');
 *
 * Toasts auto-dismiss after `duration` (default 4s) and can be
 * stacked. Each entry is rendered with role="status" (success/info)
 * or role="alert" (error) for screen readers.
 *
 * Implementation notes:
 * - Uses a React Context so any descendant can push toasts without
 *   prop-drilling.
 * - Auto-dismiss timers are cleaned up on unmount and on manual
 *   dismiss to avoid setting state on an unmounted component.
 * - Zero external deps beyond framer-motion (already in the bundle).
 */
import * as React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  CheckCircle2,
  AlertCircle,
  Info,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export type ToastVariant = 'success' | 'error' | 'info';

export interface ToastItem {
  id: string;
  message: string;
  variant: ToastVariant;
  /** ms; defaults to 4000 */
  duration?: number;
}

interface ToastContextValue {
  toasts: ToastItem[];
  push: (variant: ToastVariant, message: string, duration?: number) => string;
  dismiss: (id: string) => void;
}

const ToastContext = React.createContext<ToastContextValue | null>(null);

const DEFAULT_DURATION = 4000;

function makeId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `t-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

interface ToasterProps {
  children: React.ReactNode;
}

export function Toaster({ children }: ToasterProps) {
  const [toasts, setToasts] = React.useState<ToastItem[]>([]);
  const timersRef = React.useRef<Map<string, ReturnType<typeof setTimeout>>>(
    new Map()
  );

  const dismiss = React.useCallback((id: string) => {
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const push = React.useCallback(
    (variant: ToastVariant, message: string, duration?: number) => {
      const id = makeId();
      const ttl = duration ?? DEFAULT_DURATION;
      const item: ToastItem = { id, message, variant, duration: ttl };
      setToasts((prev) => [...prev, item]);
      if (ttl > 0) {
        const timer = setTimeout(() => dismiss(id), ttl);
        timersRef.current.set(id, timer);
      }
      return id;
    },
    [dismiss]
  );

  React.useEffect(() => {
    const timers = timersRef.current;
    return () => {
      timers.forEach((timer) => clearTimeout(timer));
      timers.clear();
    };
  }, []);

  // Bind imperative singleton (so callers can `import { toast } from ...`)
  React.useEffect(() => {
    toastBridge.current = { push, dismiss };
    return () => {
      toastBridge.current = null;
    };
  }, [push, dismiss]);

  const value = React.useMemo(
    () => ({ toasts, push, dismiss }),
    [toasts, push, dismiss]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastViewport toasts={toasts} dismiss={dismiss} />
    </ToastContext.Provider>
  );
}

interface ToastViewportProps {
  toasts: ToastItem[];
  dismiss: (id: string) => void;
}

function ToastViewport({ toasts, dismiss }: ToastViewportProps) {
  return (
    <div
      aria-live="polite"
      aria-atomic="false"
      className="pointer-events-none fixed bottom-6 right-6 z-[100] flex w-full max-w-sm flex-col gap-3"
    >
      <AnimatePresence initial={false}>
        {toasts.map((t) => (
          <ToastCard key={t.id} toast={t} onDismiss={() => dismiss(t.id)} />
        ))}
      </AnimatePresence>
    </div>
  );
}

const variantConfig: Record<
  ToastVariant,
  {
    icon: React.ComponentType<{ className?: string }>;
    iconColor: string;
    accent: string;
    role: 'status' | 'alert';
  }
> = {
  success: {
    icon: CheckCircle2,
    iconColor: 'text-emerald-500',
    accent: 'from-emerald-500/15 to-emerald-500/5',
    role: 'status',
  },
  error: {
    icon: AlertCircle,
    iconColor: 'text-red-500',
    accent: 'from-red-500/15 to-magenta-500/5',
    role: 'alert',
  },
  info: {
    icon: Info,
    iconColor: 'text-accent-600',
    accent: 'from-accent-500/15 to-magenta-500/5',
    role: 'status',
  },
};

interface ToastCardProps {
  toast: ToastItem;
  onDismiss: () => void;
}

function ToastCard({ toast, onDismiss }: ToastCardProps) {
  const config = variantConfig[toast.variant];
  const Icon = config.icon;
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.96 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      role={config.role}
      className={cn(
        'pointer-events-auto relative overflow-hidden rounded-2xl shadow-card',
        'glass'
      )}
    >
      <div
        aria-hidden
        className={cn(
          'pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br blur-2xl',
          config.accent
        )}
      />
      <div className="relative flex items-start gap-3 p-4">
        <div className="mt-0.5 flex-shrink-0">
          <Icon className={cn('h-5 w-5', config.iconColor)} />
        </div>
        <p className="flex-1 pr-2 text-sm font-medium leading-snug text-[#0A2540]">
          {toast.message}
        </p>
        <button
          type="button"
          aria-label="Dismiss notification"
          onClick={onDismiss}
          className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-slate-100 hover:text-[#0A2540] focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-500/40"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </motion.div>
  );
}

export function useToast() {
  const ctx = React.useContext(ToastContext);
  return React.useMemo(
    () => ({
      success: (message: string, duration?: number) =>
        ctx ? ctx.push('success', message, duration) : toastBridgePush('success', message, duration),
      error: (message: string, duration?: number) =>
        ctx ? ctx.push('error', message, duration) : toastBridgePush('error', message, duration),
      info: (message: string, duration?: number) =>
        ctx ? ctx.push('info', message, duration) : toastBridgePush('info', message, duration),
      dismiss: (id: string) => (ctx ? ctx.dismiss(id) : undefined),
    }),
    [ctx]
  );
}

// Imperative bridge for code paths that don't have access to a hook.
const toastBridge: { current: { push: ToastContextValue['push']; dismiss: ToastContextValue['dismiss'] } | null } = {
  current: null,
};

function toastBridgePush(variant: ToastVariant, message: string, duration?: number) {
  if (toastBridge.current) {
    return toastBridge.current.push(variant, message, duration);
  }
  if (typeof console !== 'undefined') {
    // eslint-disable-next-line no-console
    console.warn('[toast] No <Toaster /> mounted yet:', variant, message);
  }
  return '';
}

export const toast = {
  success: (message: string, duration?: number) =>
    toastBridgePush('success', message, duration),
  error: (message: string, duration?: number) =>
    toastBridgePush('error', message, duration),
  info: (message: string, duration?: number) =>
    toastBridgePush('info', message, duration),
};

export default Toaster;
