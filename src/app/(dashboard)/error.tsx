'use client';

import * as React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { AlertTriangle, RotateCcw, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';

interface DashboardErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function DashboardError({
  error,
  reset,
}: DashboardErrorProps) {
  React.useEffect(() => {
    // eslint-disable-next-line no-console
    console.error('[Koda] dashboard error boundary:', error);
  }, [error]);

  return (
    <div className="page-surface relative min-h-full">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 -left-24 h-[420px] w-[420px] rounded-full bg-magenta-500/15 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute top-32 right-0 h-[380px] w-[380px] rounded-full bg-accent-500/15 blur-3xl"
      />

      <div className="relative mx-auto flex min-h-full max-w-3xl items-center justify-center px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="w-full"
        >
          <Card className="overflow-hidden border-amber-200/60 bg-white shadow-card">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-amber-400 via-magenta-500 to-accent-500"
            />
            <CardContent className="p-10 text-center">
              <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 ring-1 ring-amber-200">
                <AlertTriangle className="h-6 w-6 text-amber-600" />
              </div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-amber-600">
                Something went wrong
              </p>
              <h1 className="font-heading text-3xl font-extrabold text-[#0A2540]">
                This view crashed mid-render
              </h1>
              <p className="mx-auto mt-3 max-w-md text-sm text-slate-600">
                Don't worry — it's contained. Retry to re-render this page, or
                jump back to the War Room.
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
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
