'use client';

/**
 * Koda landing page.
 *
 * Lives at `/`. Stripe-style: tight, dense, high-contrast — designed
 * to convert hackathon visitors and judges who land here cold. The
 * page renders real product components in the previews (StatCard,
 * ScoreRing, etc.) so visitors see the actual product, not
 * screenshot mockups.
 */

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  PlayCircle,
  ShieldCheck,
  Sparkles,
  Code2,
  Smartphone,
  FileText,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Zap,
  Globe,
  Github,
} from 'lucide-react';
import { KodaLogo } from '@/components/brand/KodaLogo';
import { ScoreRing } from '@/components/ui/ScoreRing';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

const FRAMEWORKS = [
  'CBL-MFS · Liberia',
  'ECOWAS-PSIF',
  'LDPA',
  'WAEMU',
  'Bank of Ghana',
  'CBN Nigeria',
];

const FEATURES = [
  {
    icon: Code2,
    eyebrow: 'Auditor',
    title: 'Catch what regulators will.',
    body: 'Paste a schema. Pick jurisdictions. Get a prioritized list of compliance gaps with copy-paste fixes — keyed to the exact CBL-MFS, ECOWAS, or LDPA clause.',
    href: '/auditor',
  },
  {
    icon: Smartphone,
    eyebrow: 'MoMo Lab',
    title: 'See the regulation behind every step.',
    body: 'Simulate a cross-network mobile money transaction. Watch each compliance checkpoint fire — KYC, AML, beneficiary, settlement — annotated with the framework that governs it.',
    href: '/momo-lab',
  },
  {
    icon: FileText,
    eyebrow: 'PRD Studio',
    title: 'Compliance baked into v1.',
    body: 'Brain-dump your idea, pick the jurisdictions, get back a Product Requirements Document with regulatory requirements, data model, API spec, and security controls — ready for engineering.',
    href: '/prd-studio',
  },
];

export default function LandingPage() {
  return (
    <div className="page-surface min-h-screen overflow-hidden">
      {/* Decorative ambient blobs, hero only */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 left-1/4 h-[520px] w-[520px] rounded-full bg-[#785e9f]/30 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute top-32 right-0 h-[480px] w-[480px] rounded-full bg-[#f7cf87]/25 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute top-72 left-0 h-[420px] w-[420px] rounded-full bg-[#d59fb2]/20 blur-3xl"
      />

      {/* Nav */}
      <header className="relative z-20">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-10">
          <Link href="/" className="flex items-center gap-3">
            <KodaLogo variant="icon" height={32} priority />
            <span className="font-heading text-xl font-extrabold tracking-tight text-[#0A2540]">
              Koda
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <Link
              href="#product"
              className="hidden items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-white/60 hover:text-[#0A2540] sm:inline-flex"
            >
              Product
            </Link>
            <Link
              href="#frameworks"
              className="hidden items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-white/60 hover:text-[#0A2540] sm:inline-flex"
            >
              Frameworks
            </Link>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-white/60 hover:text-[#0A2540] sm:inline-flex"
              aria-label="GitHub"
            >
              <Github className="h-4 w-4" />
            </a>
            <Link
              href="/war-room"
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#0A2540] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0F2F4F]"
            >
              Launch app
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero */}
      <section className="relative z-10 mx-auto max-w-7xl px-6 pb-24 pt-12 lg:px-10 lg:pb-32 lg:pt-20">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto max-w-4xl text-center"
        >
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-slate-200/70 bg-white/70 px-4 py-1.5 backdrop-blur">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-700">
              Compliance Engineering · Powered by Claude
            </span>
          </div>

          <h1 className="font-heading text-5xl font-extrabold leading-[1.05] tracking-tight text-[#0A2540] sm:text-6xl lg:text-[5.5rem]">
            Compliance-as-Code{' '}
            <span className="text-gradient-koda">for the New Africa.</span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-600 lg:text-xl">
            Koda audits schemas, simulates cross-border flows, and generates
            compliance-ready PRDs — all in seconds. Built for fintech founders
            shipping into West Africa and beyond.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/war-room">
              <Button variant="gradient" size="lg" className="px-7">
                Launch app
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="#product">
              <Button
                variant="outline"
                size="lg"
                className="px-7 bg-white/70 backdrop-blur"
              >
                <PlayCircle className="h-4 w-4" />
                Watch demo
              </Button>
            </Link>
          </div>

          <p className="mt-6 text-xs font-medium text-slate-500">
            No setup · Free for the demo · Open-source under MIT
          </p>
        </motion.div>

        {/* Hero showcase: live ScoreRing inside a glass card */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="relative mx-auto mt-16 max-w-5xl"
        >
          <div className="glass relative overflow-hidden rounded-3xl p-8 lg:p-10">
            <div
              aria-hidden
              className="pointer-events-none absolute -right-32 -top-32 h-80 w-80 rounded-full bg-[#785e9f]/20 blur-3xl"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute -bottom-32 -left-32 h-80 w-80 rounded-full bg-[#f7cf87]/20 blur-3xl"
            />
            <div className="relative grid gap-8 lg:grid-cols-3 lg:items-center">
              <div className="flex justify-center lg:justify-start">
                <ScoreRing score={67} size="lg" />
              </div>
              <div className="lg:col-span-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-accent-700">
                  Live audit · Cross-Border Remittance Platform
                </p>
                <p className="mt-2 font-heading text-2xl font-bold text-[#0A2540]">
                  20 controls evaluated across CBL-MFS, ECOWAS-PSIF, and LDPA.
                </p>
                <div className="mt-5 grid grid-cols-3 gap-3">
                  <HeroStat tone="danger" count={3} label="Critical" icon={AlertCircle} />
                  <HeroStat tone="warning" count={5} label="Warnings" icon={AlertTriangle} />
                  <HeroStat tone="success" count={12} label="Passing" icon={CheckCircle2} />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Trust strip */}
      <section
        id="frameworks"
        className="relative z-10 border-y border-slate-200/60 bg-white/40 backdrop-blur-sm"
      >
        <div className="mx-auto max-w-7xl px-6 py-8 lg:px-10">
          <p className="mb-5 text-center text-xs font-semibold uppercase tracking-wider text-slate-500">
            Calibrated against the regulators that matter
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
            {FRAMEWORKS.map((f) => (
              <span
                key={f}
                className="text-sm font-semibold tracking-tight text-slate-600"
              >
                {f}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section
        id="product"
        className="relative z-10 mx-auto max-w-7xl px-6 py-24 lg:px-10 lg:py-32"
      >
        <div className="mx-auto max-w-2xl text-center">
          <p className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-accent-200 bg-white/60 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-accent-700 backdrop-blur">
            <Sparkles className="h-3 w-3" />
            Three surfaces, one engine
          </p>
          <h2 className="font-heading text-4xl font-extrabold tracking-tight text-[#0A2540] lg:text-5xl">
            Everything a fintech founder needs to{' '}
            <span className="text-gradient-koda">ship compliance-first.</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-slate-600">
            Koda packages three workflows that used to take a week of legal
            review into tools that respond in seconds.
          </p>
        </div>

        <div className="mt-16 grid gap-6 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <FeatureCard key={f.eyebrow} feature={f} index={i} />
          ))}
        </div>
      </section>

      {/* Product preview */}
      <section className="relative z-10 mx-auto max-w-7xl px-6 pb-24 lg:px-10 lg:pb-32">
        <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-accent-200 bg-white/60 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-accent-700 backdrop-blur">
              <Zap className="h-3 w-3" />
              Watch it work
            </p>
            <h2 className="font-heading text-4xl font-extrabold tracking-tight text-[#0A2540] lg:text-5xl">
              From idea to{' '}
              <span className="text-gradient-koda">audit-ready</span>
              {' '}in under a minute.
            </h2>
            <p className="mt-5 text-base leading-relaxed text-slate-600 lg:text-lg">
              Koda's Auditor reads your schema, your jurisdictions, and the
              full text of every regulation you operate under. It returns a
              ranked list of compliance gaps with concrete, copy-paste fixes —
              cited to the exact regulatory clause.
            </p>
            <ul className="mt-6 space-y-3">
              {[
                'Real-time audit on Claude',
                'Findings cited to specific clauses',
                'Copy-paste remediation snippets',
                'Audit history persisted to Supabase',
              ].map((item) => (
                <li key={item} className="flex items-center gap-3 text-sm text-slate-700">
                  <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-emerald-500" />
                  {item}
                </li>
              ))}
            </ul>
            <div className="mt-8">
              <Link href="/auditor">
                <Button variant="gradient" size="lg" className="px-7">
                  Try the Auditor
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Audit findings preview */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="glass overflow-hidden rounded-3xl p-2 shadow-card-hover">
              <div className="overflow-hidden rounded-2xl border border-slate-200/60 bg-white">
                <div className="flex items-center justify-between border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="flex gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
                      <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                      <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                    </span>
                    <span className="ml-2 font-mono text-xs text-slate-500">
                      compliance-report.koda
                    </span>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 ring-1 ring-emerald-200">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    </span>
                    Live
                  </span>
                </div>
                <div className="divide-y divide-slate-100">
                  <FindingPreview
                    severity="critical"
                    regulation="CBL-MFS §4.2"
                    field="customers.national_id"
                    description="Stored in plaintext"
                  />
                  <FindingPreview
                    severity="critical"
                    regulation="CBL-MFS §5.1"
                    field="transactions"
                    description="No immutable audit trail"
                  />
                  <FindingPreview
                    severity="warning"
                    regulation="ECOWAS D/2020/07"
                    field="cross_border.corridor"
                    description="Missing corridor metadata"
                  />
                  <FindingPreview
                    severity="warning"
                    regulation="LDPA §14"
                    field="services/identity"
                    description="No DSAR endpoint"
                  />
                  <FindingPreview
                    severity="info"
                    regulation="CBL-MFS §6.3"
                    field="wallet.daily_limit"
                    description="Tiered KYC ceiling not enforced"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative z-10 mx-auto max-w-7xl px-6 pb-24 lg:px-10 lg:pb-32">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0A2540] via-[#1B1444] to-[#0A2540] px-8 py-16 text-center lg:px-16 lg:py-24">
          <div
            aria-hidden
            className="pointer-events-none absolute -top-32 -left-32 h-80 w-80 rounded-full bg-[#785e9f]/40 blur-3xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-32 -right-32 h-80 w-80 rounded-full bg-[#f7cf87]/30 blur-3xl"
          />
          <div className="relative">
            <KodaLogo
              variant="icon-mono-white"
              height={48}
              className="mx-auto opacity-90"
            />
            <h2 className="mx-auto mt-8 max-w-3xl font-heading text-4xl font-extrabold leading-tight tracking-tight text-white lg:text-6xl">
              Ready to ship{' '}
              <span className="text-gradient-koda">compliance-first?</span>
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-base text-white/70 lg:text-lg">
              Open the War Room. Run an audit. See what your regulators would
              see — before they do.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href="/war-room">
                <Button variant="gradient" size="lg" className="px-7">
                  Launch app
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/sign-in">
                <Button
                  variant="outline"
                  size="lg"
                  className="border-white/20 bg-white/5 px-7 text-white hover:bg-white/10 hover:border-white/30"
                >
                  Sign in
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-200/60 bg-white/40 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-6 py-12 lg:px-10">
          <div className="grid gap-10 lg:grid-cols-4">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3">
                <KodaLogo variant="icon" height={28} />
                <span className="font-heading text-lg font-extrabold tracking-tight text-[#0A2540]">
                  Koda
                </span>
              </div>
              <p className="mt-3 max-w-sm text-sm text-slate-600">
                The AI compliance architect for fintech builders shipping into
                West Africa and beyond.
              </p>
            </div>
            <FooterColumn title="Product">
              <FooterLink href="/war-room">War Room</FooterLink>
              <FooterLink href="/auditor">Auditor</FooterLink>
              <FooterLink href="/momo-lab">MoMo Lab</FooterLink>
              <FooterLink href="/prd-studio">PRD Studio</FooterLink>
            </FooterColumn>
            <FooterColumn title="Frameworks">
              <FooterLink href="#frameworks">CBL-MFS Liberia</FooterLink>
              <FooterLink href="#frameworks">ECOWAS PSIF</FooterLink>
              <FooterLink href="#frameworks">Liberia DPA</FooterLink>
              <FooterLink href="#frameworks">WAEMU</FooterLink>
            </FooterColumn>
          </div>
          <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-slate-200/60 pt-6 sm:flex-row">
            <p className="text-xs text-slate-500">
              © {new Date().getFullYear()} Koda · Compliance-as-Code for the New Africa.
            </p>
            <div className="flex items-center gap-3 text-xs text-slate-500">
              <span className="inline-flex items-center gap-1.5">
                <Globe className="h-3 w-3" />
                Built for West Africa
              </span>
              <span className="text-slate-300">·</span>
              <span className="inline-flex items-center gap-1.5">
                <Sparkles className="h-3 w-3" />
                Powered by Claude
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────── *
 * Section helpers
 * ─────────────────────────────────────────────────────────────────── */

function HeroStat({
  tone,
  count,
  label,
  icon: Icon,
}: {
  tone: 'danger' | 'warning' | 'success';
  count: number;
  label: string;
  icon: typeof AlertCircle;
}) {
  const styles = {
    danger: 'bg-red-50 text-red-700 ring-red-200',
    warning: 'bg-amber-50 text-amber-700 ring-amber-200',
    success: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  } as const;
  return (
    <div className={cn('rounded-xl px-3 py-3 ring-1', styles[tone])}>
      <div className="flex items-center gap-2">
        <Icon className="h-3.5 w-3.5" />
        <p className="text-[10px] font-semibold uppercase tracking-wider">
          {label}
        </p>
      </div>
      <p className="tabular font-heading mt-1 text-2xl font-bold leading-none">
        {count}
      </p>
    </div>
  );
}

function FeatureCard({
  feature,
  index,
}: {
  feature: (typeof FEATURES)[number];
  index: number;
}) {
  const Icon = feature.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
    >
      <Link
        href={feature.href}
        className="group relative block h-full overflow-hidden rounded-3xl border border-slate-200/70 bg-white p-8 shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-gradient-to-br from-[#785e9f]/15 to-[#f7cf87]/10 opacity-70 blur-2xl transition-opacity group-hover:opacity-100"
        />
        <div className="relative">
          <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-koda text-white shadow-md ring-1 ring-inset ring-white/30">
            <Icon className="h-5 w-5" />
          </div>
          <p className="text-xs font-semibold uppercase tracking-wider text-accent-700">
            {feature.eyebrow}
          </p>
          <h3 className="mt-2 font-heading text-2xl font-bold tracking-tight text-[#0A2540]">
            {feature.title}
          </h3>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            {feature.body}
          </p>
          <p className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-accent-700 transition-all group-hover:gap-2.5">
            Open
            <ArrowRight className="h-3.5 w-3.5" />
          </p>
        </div>
      </Link>
    </motion.div>
  );
}

function FindingPreview({
  severity,
  regulation,
  field,
  description,
}: {
  severity: 'critical' | 'warning' | 'info';
  regulation: string;
  field: string;
  description: string;
}) {
  const meta = {
    critical: { label: 'CRITICAL', tone: 'bg-red-50 text-red-700 ring-red-200', dot: 'bg-red-500', icon: AlertCircle },
    warning: { label: 'WARNING', tone: 'bg-amber-50 text-amber-700 ring-amber-200', dot: 'bg-amber-500', icon: AlertTriangle },
    info: { label: 'INFO', tone: 'bg-sky-50 text-sky-700 ring-sky-200', dot: 'bg-sky-500', icon: ShieldCheck },
  }[severity];
  const Icon = meta.icon;
  return (
    <div className="flex items-start gap-3 px-4 py-3 transition hover:bg-slate-50/60">
      <div className={cn('flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg ring-1', meta.tone)}>
        <Icon className="h-3.5 w-3.5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-mono text-[10px] uppercase tracking-wider text-slate-500">
          {regulation}
        </p>
        <p className="truncate font-mono text-sm font-semibold text-[#0A2540]">
          {field}
        </p>
        <p className="mt-0.5 text-xs text-slate-600">{description}</p>
      </div>
      <span
        className={cn(
          'inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ring-1',
          meta.tone
        )}
      >
        <span className={cn('mr-1 h-1.5 w-1.5 rounded-full', meta.dot)} />
        {meta.label}
      </span>
    </div>
  );
}

function FooterColumn({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
        {title}
      </p>
      <ul className="space-y-2.5">{children}</ul>
    </div>
  );
}

function FooterLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <li>
      <Link
        href={href}
        className="text-sm text-slate-600 transition-colors hover:text-[#0A2540]"
      >
        {children}
      </Link>
    </li>
  );
}
