'use client';

/**
 * Top app bar with breadcrumb, search trigger, notifications,
 * settings, and avatar.
 *
 * Three popovers (notifications / settings / avatar) share a single
 * `openMenu` state so opening one auto-closes the others — that's
 * what users expect from a Mac/Stripe-style menubar. Outside-clicks
 * and route changes also collapse open menus.
 *
 * Search is implemented as a separate <CommandPalette /> modal that
 * the header opens via the search button OR the ⌘K / Ctrl+K hotkey
 * (registered globally on `window`).
 *
 * `user` is provided by the dashboard layout when Supabase is
 * configured; null in demo mode. The avatar dropdown shows real
 * email + sign-out form when present, "Sign in" link otherwise.
 */
import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  Settings,
  Search,
  ChevronRight,
  CheckCheck,
  LogOut,
  HelpCircle,
  Palette,
  KeyRound,
  ShieldAlert,
  Sparkles,
  AlertTriangle,
} from 'lucide-react';
import CommandPalette from '@/components/layout/CommandPalette';
import type { SidebarUser } from '@/components/layout/Sidebar';
import { cn } from '@/lib/utils';

const pageMeta: Record<string, { name: string; tag: string }> = {
  '/war-room': { name: 'War Room', tag: 'Live' },
  '/auditor': { name: 'Auditor', tag: 'Realtime' },
  '/momo-lab': { name: 'MoMo Lab', tag: 'Sandbox' },
  '/prd-studio': { name: 'PRD Studio', tag: 'AI' },
};

interface HeaderProps {
  user?: SidebarUser | null;
}

interface DemoNotification {
  id: string;
  icon: typeof Bell;
  iconColor: string;
  title: string;
  body: string;
  ago: string;
}

const DEMO_NOTIFICATIONS: DemoNotification[] = [
  {
    id: 'n1',
    icon: ShieldAlert,
    iconColor: 'text-red-600 bg-red-50 ring-red-200',
    title: '3 new critical findings',
    body: 'Schema audit on customers.national_id flagged AES-256 gaps.',
    ago: '2m ago',
  },
  {
    id: 'n2',
    icon: Sparkles,
    iconColor: 'text-accent-700 bg-accent-50 ring-accent-200',
    title: 'PRD generated',
    body: 'Cross-Border Remittance Platform — exec summary ready to review.',
    ago: '14m ago',
  },
  {
    id: 'n3',
    icon: AlertTriangle,
    iconColor: 'text-amber-700 bg-amber-50 ring-amber-200',
    title: 'ECOWAS framework updated',
    body: 'Directive D/2020/07 superseded — review applicable clauses.',
    ago: 'Yesterday',
  },
];

type Menu = 'notifications' | 'settings' | 'avatar' | null;

export default function Header({ user }: HeaderProps) {
  const pathname = usePathname() || '/';
  const firstSegment = `/${pathname.split('/').filter(Boolean)[0] || ''}`;
  const meta = pageMeta[firstSegment] || { name: 'Dashboard', tag: '' };

  const [paletteOpen, setPaletteOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState<Menu>(null);
  const [notificationsRead, setNotificationsRead] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // ⌘K / Ctrl+K to open the command palette globally.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPaletteOpen((v) => !v);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  // Close any open menu on outside click.
  useEffect(() => {
    if (!openMenu) return;
    const onClick = (e: MouseEvent) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target as Node)) setOpenMenu(null);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [openMenu]);

  // Close menus on route change.
  useEffect(() => {
    setOpenMenu(null);
  }, [pathname]);

  const toggle = (menu: Menu) =>
    setOpenMenu((current) => (current === menu ? null : menu));

  const displayName =
    user?.name?.trim() || user?.email?.split('@')[0] || 'Demo Operator';
  const email = user?.email ?? null;
  const initial = (displayName[0] ?? 'U').toUpperCase();

  const unreadCount = notificationsRead ? 0 : DEMO_NOTIFICATIONS.length;

  return (
    <>
      <header
        ref={containerRef}
        className="sticky top-0 z-30 flex h-16 flex-shrink-0 items-center justify-between border-b border-slate-200/70 bg-white/70 px-6 backdrop-blur-xl"
      >
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm">
          <span className="text-slate-400">Dashboard</span>
          <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
          <span className="font-semibold text-[#0A2540]">{meta.name}</span>
          {meta.tag && (
            <span className="ml-2 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 ring-1 ring-emerald-200">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
              </span>
              {meta.tag}
            </span>
          )}
        </div>

        {/* Right cluster */}
        <div className="flex items-center gap-2">
          {/* Search trigger */}
          <button
            onClick={() => setPaletteOpen(true)}
            aria-label="Open search"
            className="hidden h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white/60 px-3 text-sm text-slate-500 transition hover:border-slate-300 hover:bg-white sm:inline-flex"
          >
            <Search className="h-3.5 w-3.5" />
            <span>Search</span>
            <kbd className="ml-1 rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] font-mono text-slate-500">
              ⌘K
            </kbd>
          </button>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => toggle('notifications')}
              aria-label="Notifications"
              aria-haspopup="menu"
              aria-expanded={openMenu === 'notifications'}
              className={cn(
                'relative flex h-9 w-9 items-center justify-center rounded-lg transition',
                openMenu === 'notifications'
                  ? 'bg-slate-100 text-[#0A2540]'
                  : 'text-slate-500 hover:bg-slate-100 hover:text-[#0A2540]'
              )}
            >
              <Bell className="h-[18px] w-[18px]" />
              {unreadCount > 0 && (
                <span className="absolute right-1.5 top-1.5 flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-magenta-500 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-magenta-500" />
                </span>
              )}
            </button>
            <AnimatePresence>
              {openMenu === 'notifications' && (
                <motion.div
                  initial={{ opacity: 0, y: -4, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -4, scale: 0.98 }}
                  transition={{ duration: 0.15 }}
                  role="menu"
                  className="absolute right-0 top-11 w-80 overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-card-hover"
                >
                  <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                    <p className="text-sm font-semibold text-[#0A2540]">
                      Notifications
                    </p>
                    <button
                      onClick={() => setNotificationsRead(true)}
                      className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-[#0A2540]"
                    >
                      <CheckCheck className="h-3 w-3" />
                      Mark all read
                    </button>
                  </div>
                  <ul className="max-h-80 overflow-y-auto">
                    {DEMO_NOTIFICATIONS.map((n) => {
                      const Icon = n.icon;
                      return (
                        <li key={n.id} className="border-b border-slate-100 last:border-0">
                          <div className="flex items-start gap-3 px-4 py-3 transition hover:bg-slate-50/60">
                            <div
                              className={cn(
                                'flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg ring-1',
                                n.iconColor
                              )}
                            >
                              <Icon className="h-3.5 w-3.5" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-semibold text-[#0A2540]">
                                {n.title}
                              </p>
                              <p className="mt-0.5 text-xs leading-relaxed text-slate-600">
                                {n.body}
                              </p>
                              <p className="mt-1 text-[10px] uppercase tracking-wider text-slate-400">
                                {n.ago}
                              </p>
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Settings */}
          <div className="relative">
            <button
              onClick={() => toggle('settings')}
              aria-label="Settings"
              aria-haspopup="menu"
              aria-expanded={openMenu === 'settings'}
              className={cn(
                'flex h-9 w-9 items-center justify-center rounded-lg transition',
                openMenu === 'settings'
                  ? 'bg-slate-100 text-[#0A2540]'
                  : 'text-slate-500 hover:bg-slate-100 hover:text-[#0A2540]'
              )}
            >
              <Settings className="h-[18px] w-[18px]" />
            </button>
            <AnimatePresence>
              {openMenu === 'settings' && (
                <motion.div
                  initial={{ opacity: 0, y: -4, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -4, scale: 0.98 }}
                  transition={{ duration: 0.15 }}
                  role="menu"
                  className="absolute right-0 top-11 w-60 overflow-hidden rounded-2xl border border-slate-200/70 bg-white p-1 shadow-card-hover"
                >
                  <MenuItem icon={Palette} label="Appearance" hint="Light · Auto" disabled />
                  <MenuItem icon={KeyRound} label="API keys" hint=".env.local" disabled />
                  <MenuItem icon={HelpCircle} label="Help & docs" hint="Docs coming soon" disabled />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="ml-1 h-7 w-px bg-slate-200" />

          {/* Avatar */}
          <div className="relative">
            <button
              onClick={() => toggle('avatar')}
              aria-label="Account menu"
              aria-haspopup="menu"
              aria-expanded={openMenu === 'avatar'}
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#635BFF] to-[#EC4899] text-xs font-bold text-white shadow-md shadow-[#635BFF]/20 transition',
                openMenu === 'avatar' && 'ring-2 ring-accent-500/40 ring-offset-2'
              )}
            >
              {initial}
            </button>
            <AnimatePresence>
              {openMenu === 'avatar' && (
                <motion.div
                  initial={{ opacity: 0, y: -4, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -4, scale: 0.98 }}
                  transition={{ duration: 0.15 }}
                  role="menu"
                  className="absolute right-0 top-11 w-64 overflow-hidden rounded-2xl border border-slate-200/70 bg-white p-1 shadow-card-hover"
                >
                  <div className="flex items-center gap-3 px-3 py-2.5">
                    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#635BFF] to-[#EC4899] text-xs font-bold text-white">
                      {initial}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-[#0A2540]">
                        {displayName}
                      </p>
                      <p className="truncate text-[11px] text-slate-500">
                        {email ?? 'Demo session'}
                      </p>
                    </div>
                  </div>
                  <div className="my-1 h-px bg-slate-100" />
                  {user ? (
                    <form action="/auth/sign-out" method="post">
                      <button
                        type="submit"
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm font-medium text-[#0A2540] transition hover:bg-slate-50"
                      >
                        <LogOut className="h-4 w-4 text-slate-500" />
                        Sign out
                      </button>
                    </form>
                  ) : (
                    <Link
                      href="/sign-in"
                      onClick={() => setOpenMenu(null)}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm font-medium text-[#0A2540] transition hover:bg-slate-50"
                    >
                      <LogOut className="h-4 w-4 -scale-x-100 text-accent-600" />
                      Sign in
                    </Link>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </>
  );
}

function MenuItem({
  icon: Icon,
  label,
  hint,
  disabled = false,
  onClick,
}: {
  icon: typeof Bell;
  label: string;
  hint?: string;
  disabled?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition',
        disabled
          ? 'cursor-not-allowed opacity-60'
          : 'hover:bg-slate-50'
      )}
    >
      <Icon className="h-4 w-4 flex-shrink-0 text-slate-500" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-[#0A2540]">{label}</p>
        {hint && <p className="truncate text-[11px] text-slate-500">{hint}</p>}
      </div>
    </button>
  );
}
