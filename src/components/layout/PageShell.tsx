'use client';

/**
 * Shared page chrome for every dashboard view.
 *
 * Provides the consistent hero block (eyebrow → display title →
 * description → actions) plus the ambient aurora-mesh background and
 * floating glow blobs that give Koda its "premium fintech dashboard"
 * feel. Pages compose their own content as children.
 *
 * Pass `flat` to disable the gradient background (e.g. for a focused
 * page that needs a calmer surface). Pass `maxWidth` to override the
 * default `max-w-7xl` container.
 */
import * as React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface PageShellProps {
  /** Eyebrow / kicker text shown above the title */
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  /** Constrain the inner content width. Defaults to `max-w-7xl`. */
  maxWidth?: 'max-w-3xl' | 'max-w-4xl' | 'max-w-5xl' | 'max-w-6xl' | 'max-w-7xl' | 'max-w-full';
  /** Disable the ambient gradient mesh on this page. */
  flat?: boolean;
  className?: string;
  children: React.ReactNode;
}

export function PageShell({
  eyebrow,
  title,
  description,
  actions,
  maxWidth = 'max-w-7xl',
  flat = false,
  className,
  children,
}: PageShellProps) {
  return (
    <div
      className={cn(
        'relative min-h-full',
        flat ? 'bg-[#F6F9FC]' : 'page-surface',
        className
      )}
    >
      {/* Decorative floating glow blobs */}
      {!flat && (
        <>
          <div
            aria-hidden
            className="pointer-events-none absolute -top-32 -left-24 h-[420px] w-[420px] rounded-full bg-accent-500/20 blur-3xl animate-float"
            style={{ animationDelay: '0s' }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute top-32 right-0 h-[380px] w-[380px] rounded-full bg-magenta-500/15 blur-3xl animate-float"
            style={{ animationDelay: '-3s' }}
          />
        </>
      )}

      <div className={cn('relative px-6 py-10 lg:px-10 lg:py-12', maxWidth, 'mx-auto')}>
        <motion.header
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between"
        >
          <div>
            {eyebrow && (
              <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-accent-200 bg-white/60 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-accent-700 backdrop-blur">
                {eyebrow}
              </p>
            )}
            <h1 className="text-display-md font-heading font-extrabold text-[#0A2540]">
              {title}
            </h1>
            {description && (
              <p className="mt-3 max-w-2xl text-base text-slate-600 lg:text-lg">
                {description}
              </p>
            )}
          </div>
          {actions && (
            <div className="flex flex-wrap items-center gap-3">{actions}</div>
          )}
        </motion.header>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.08 }}
        >
          {children}
        </motion.div>
      </div>
    </div>
  );
}

export default PageShell;
