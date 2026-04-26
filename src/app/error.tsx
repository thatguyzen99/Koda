'use client';

import * as React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { AlertTriangle, RotateCcw, ArrowRight } from 'lucide-react';
import { KodaLogo } from '@/components/brand/KodaLogo';
import { Button } from '@/components/ui/Button';

interface RootErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function RootError({ error, reset }: RootErrorProps) {
  React.useEffect(() => {
    // eslint-disable-next-line no-console
    console.error('[Koda] root error boundary:', error);
  }, [error]);

  return (
    <div className="page-surface relative flex min-h-screen items-center justify-center px-6 py-12">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 left-1/4 h-96 w-96 rounded-full bg-magenta-500/15 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-accent-500/15 blur-3xl"
      />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="glass relative w-full max-w-lg rounded-3xl p-8 text-center shadow-card"
      >
        <div className="mb-6 flex justify-center">
          <KodaLogo variant="icon" height={56} />
        </div>

        <div className="mb-4 flex items-center justify-center gap-2 text-amber-600">
          <AlertTriangle className="h-4 w-4" />
          <span className="text-xs font-semibold uppercase tracking-wider">
            Unexpected error
          </span>
        </div>

        <h1 className="font-heading text-3xl font-extrabold text-[#0A2540]">
          Something went wrong
        </h1>
        <p className="mt-3 text-sm text-slate-600">
          We hit a snag rendering this view. The error has been logged. Try
          again, or head back to the War Room.
        </p>

        {error?.digest && (
          <p className="mt-3 font-mono text-[11px] text-slate-400">
            ref · {error.digest}
          </p>
        )}

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button variant="gradient" size="md" onClick={() => reset()}>
            <RotateCcw className="h-4 w-4" />
            Try again
          </Button>
          <Link href="/war-room">
            <Button variant="outline" size="md">
              Back to War Room
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
