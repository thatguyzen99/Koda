'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  Shield,
  Code2,
  Smartphone,
  FileText,
  Sparkles,
  LogOut,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { KodaLogo } from '@/components/brand/KodaLogo';

const navItems = [
  { label: 'War Room', href: '/war-room', icon: Shield },
  { label: 'Auditor', href: '/auditor', icon: Code2 },
  { label: 'MoMo Lab', href: '/momo-lab', icon: Smartphone },
  { label: 'PRD Studio', href: '/prd-studio', icon: FileText },
];

export interface SidebarUser {
  email: string | null;
  name: string | null;
}

interface SidebarProps {
  user?: SidebarUser | null;
}

export default function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const isActive = (href: string) => pathname?.startsWith(href);

  const displayName =
    user?.name?.trim() ||
    user?.email?.split('@')[0] ||
    'Demo Operator';
  const initial = (displayName[0] ?? 'U').toUpperCase();
  const subtitle = user?.email ?? 'v2.0 · Sandbox';

  return (
    <aside className="fixed flex h-screen w-[260px] flex-col bg-gradient-to-b from-[#0A2540] via-[#0C2B4A] to-[#0A2540] text-white">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-[#635BFF]/20 via-transparent to-transparent blur-2xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-20 -right-10 h-60 w-60 rounded-full bg-[#EC4899]/10 blur-3xl"
      />

      {/* Brand */}
      <div className="relative flex items-center gap-3 px-6 py-6">
        <KodaLogo variant="icon" height={32} priority />
        <div>
          <p className="font-heading text-lg font-bold leading-none tracking-tight">
            Koda
          </p>
          <p className="mt-1 flex items-center gap-1 text-[10px] font-medium uppercase tracking-wider text-white/50">
            <Sparkles className="h-2.5 w-2.5" />
            Compliance Engine
          </p>
        </div>
      </div>

      <div className="mx-6 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      {/* Nav */}
      <nav className="relative flex-1 px-3 py-6 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link key={item.href} href={item.href} className="block">
              <motion.div
                whileHover={{ x: 2 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                  active
                    ? 'bg-white/10 text-white shadow-inner-line'
                    : 'text-white/60 hover:bg-white/5 hover:text-white'
                )}
              >
                {active && (
                  <motion.span
                    layoutId="sidebar-active-pill"
                    className="absolute inset-0 -z-10 rounded-xl bg-gradient-to-r from-[#635BFF]/20 via-[#7C5CFF]/15 to-transparent ring-1 ring-inset ring-[#635BFF]/30"
                    transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                  />
                )}
                <Icon
                  className={cn(
                    'h-[18px] w-[18px] flex-shrink-0 transition-colors',
                    active ? 'text-[#A78BFA]' : 'text-white/50 group-hover:text-white'
                  )}
                />
                <span>{item.label}</span>
                {active && (
                  <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[#A78BFA] shadow-[0_0_12px_2px_rgba(167,139,250,0.6)]" />
                )}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* User pill */}
      <div className="relative px-4 pb-5">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3 backdrop-blur">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#635BFF] to-[#EC4899] text-xs font-bold">
              {initial}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-white">
                {displayName}
              </p>
              <p className="truncate text-[11px] text-white/50">{subtitle}</p>
            </div>
            {user && (
              <form action="/auth/sign-out" method="post">
                <button
                  type="submit"
                  aria-label="Sign out"
                  className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg text-white/50 transition-colors hover:bg-white/10 hover:text-white"
                >
                  <LogOut className="h-3.5 w-3.5" />
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}
