'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Mail, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { getBrowserSupabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/Toaster';
import { KodaLogo } from '@/components/brand/KodaLogo';

export default function SignInPage() {
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    setErrorMsg(null);
    const supabase = getBrowserSupabase();
    if (!supabase) {
      setStatus('error');
      const msg =
        'Auth is not configured. Add Supabase keys to .env.local to enable sign-in.';
      setErrorMsg(msg);
      toast.error(msg);
      return;
    }
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) {
      setStatus('error');
      setErrorMsg(error.message);
      toast.error(error.message || 'Could not send magic link.');
      return;
    }
    setStatus('sent');
    toast.success('Magic link sent — check your inbox.');
  };

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

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-md"
      >
        <Link
          href="/war-room"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-[#0A2540]"
        >
          ← Skip and explore the demo
        </Link>

        <div className="glass relative overflow-hidden rounded-3xl p-8">
          <div className="mb-8 flex items-center gap-3">
            <KodaLogo variant="icon" height={40} priority />
            <div>
              <p className="font-heading text-xl font-bold text-[#0A2540]">Koda</p>
              <p className="text-xs text-slate-500">Compliance-as-Code for the New Africa</p>
            </div>
          </div>

          <h1 className="font-heading text-3xl font-extrabold text-[#0A2540]">
            Welcome back
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Sign in with a magic link. We'll email you a one-tap login.
          </p>

          {status === 'sent' ? (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 rounded-2xl border border-emerald-200 bg-emerald-50/60 p-5 text-center"
            >
              <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-600" />
              <p className="mt-3 font-semibold text-[#0A2540]">Check your inbox</p>
              <p className="mt-1 text-sm text-slate-600">
                We sent a magic link to <span className="font-mono">{email}</span>.
              </p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-8 space-y-4">
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Email
                </label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-sm shadow-sm transition focus:border-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-500/30"
                  />
                </div>
              </div>
              {errorMsg && (
                <p className="text-xs font-medium text-red-600">{errorMsg}</p>
              )}
              <Button
                type="submit"
                variant="gradient"
                size="lg"
                className="w-full"
                disabled={status === 'sending'}
              >
                {status === 'sending' ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Sending magic link...
                  </>
                ) : (
                  <>
                    Send magic link
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          )}

          <p className="mt-6 text-center text-xs text-slate-500">
            By continuing you agree to Koda's terms of service.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
