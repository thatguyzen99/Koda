import Link from 'next/link';
import { ArrowRight, Compass } from 'lucide-react';
import { KodaLogo } from '@/components/brand/KodaLogo';
import { Button } from '@/components/ui/Button';

export default function NotFound() {
  return (
    <div className="page-surface relative flex min-h-screen items-center justify-center px-6 py-12">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 left-1/4 h-96 w-96 rounded-full bg-accent-500/20 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-magenta-500/15 blur-3xl"
      />

      <div className="relative w-full max-w-lg text-center">
        <div className="mb-8 flex justify-center">
          <KodaLogo variant="icon" height={56} />
        </div>

        <p className="font-heading text-7xl font-extrabold leading-none text-gradient-vibrant">
          404
        </p>
        <h1 className="mt-4 font-heading text-3xl font-extrabold text-[#0A2540]">
          This page is off the map
        </h1>
        <p className="mt-3 text-sm text-slate-600">
          The view you're looking for doesn't exist — or it never did. Let's
          get you back to compliance HQ.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href="/war-room">
            <Button variant="gradient" size="md">
              <Compass className="h-4 w-4" />
              Back to War Room
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
