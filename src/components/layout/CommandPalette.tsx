'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Shield,
  Code2,
  Smartphone,
  FileText,
  CornerDownLeft,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface PaletteItem {
  id: string;
  label: string;
  hint: string;
  icon: typeof Shield;
  href: string;
  keywords?: string;
}

const ITEMS: PaletteItem[] = [
  {
    id: 'war-room',
    label: 'War Room',
    hint: 'Compliance health dashboard',
    icon: Shield,
    href: '/war-room',
    keywords: 'home dashboard score risk',
  },
  {
    id: 'auditor',
    label: 'Auditor',
    hint: 'Run a schema audit',
    icon: Code2,
    href: '/auditor',
    keywords: 'audit schema sql prisma compliance',
  },
  {
    id: 'momo-lab',
    label: 'MoMo Lab',
    hint: 'Simulate a mobile money transaction',
    icon: Smartphone,
    href: '/momo-lab',
    keywords: 'mobile money momo simulate transaction',
  },
  {
    id: 'prd-studio',
    label: 'PRD Studio',
    hint: 'Brain-dump → compliance-aware PRD',
    icon: FileText,
    href: '/prd-studio',
    keywords: 'prd document spec product requirements',
  },
];

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
}

export default function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [activeIdx, setActiveIdx] = useState(0);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return ITEMS;
    return ITEMS.filter((item) => {
      const haystack = `${item.label} ${item.hint} ${item.keywords ?? ''}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [query]);

  // Reset state every time the palette opens.
  useEffect(() => {
    if (open) {
      setQuery('');
      setActiveIdx(0);
    }
  }, [open]);

  // Keep activeIdx valid as the list shrinks while typing.
  useEffect(() => {
    if (activeIdx >= filtered.length) setActiveIdx(0);
  }, [filtered.length, activeIdx]);

  const choose = useCallback(
    (item: PaletteItem) => {
      onClose();
      router.push(item.href);
    },
    [onClose, router]
  );

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIdx((i) => (filtered.length === 0 ? 0 : (i + 1) % filtered.length));
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIdx((i) =>
          filtered.length === 0 ? 0 : (i - 1 + filtered.length) % filtered.length
        );
        return;
      }
      if (e.key === 'Enter') {
        e.preventDefault();
        const item = filtered[activeIdx];
        if (item) choose(item);
      }
    },
    [activeIdx, choose, filtered, onClose]
  );

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-[12vh]"
          onKeyDown={onKeyDown}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          {/* Backdrop */}
          <button
            aria-label="Close command palette"
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-2xl"
            role="dialog"
            aria-label="Command palette"
          >
            <div className="flex items-center gap-3 border-b border-slate-200 px-4 py-3">
              <Search className="h-4 w-4 text-slate-400" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search Koda…"
                className="flex-1 bg-transparent text-sm text-[#0A2540] placeholder:text-slate-400 focus:outline-none"
              />
              <kbd className="rounded-md border border-slate-200 bg-slate-50 px-1.5 py-0.5 font-mono text-[10px] text-slate-500">
                Esc
              </kbd>
            </div>

            <div className="max-h-80 overflow-y-auto p-2">
              {filtered.length === 0 ? (
                <div className="px-4 py-8 text-center text-sm text-slate-500">
                  Nothing matches &ldquo;{query}&rdquo;.
                </div>
              ) : (
                <ul role="listbox">
                  {filtered.map((item, idx) => {
                    const Icon = item.icon;
                    const active = idx === activeIdx;
                    return (
                      <li key={item.id} role="option" aria-selected={active}>
                        <button
                          onMouseEnter={() => setActiveIdx(idx)}
                          onClick={() => choose(item)}
                          className={cn(
                            'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors',
                            active ? 'bg-accent-50' : 'hover:bg-slate-50'
                          )}
                        >
                          <div
                            className={cn(
                              'flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg transition-colors',
                              active
                                ? 'bg-gradient-to-br from-accent-500 to-magenta-500 text-white shadow-sm'
                                : 'bg-slate-100 text-slate-500'
                            )}
                          >
                            <Icon className="h-4 w-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-[#0A2540]">
                              {item.label}
                            </p>
                            <p className="truncate text-xs text-slate-500">
                              {item.hint}
                            </p>
                          </div>
                          {active && (
                            <CornerDownLeft className="h-3.5 w-3.5 text-accent-600" />
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            <div className="flex items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/60 px-4 py-2 text-[11px] text-slate-500">
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-1">
                  <kbd className="rounded border border-slate-200 bg-white px-1 py-0.5 font-mono text-[10px]">
                    <ArrowUp className="inline h-2.5 w-2.5" />
                    <ArrowDown className="inline h-2.5 w-2.5" />
                  </kbd>
                  navigate
                </span>
                <span className="inline-flex items-center gap-1">
                  <kbd className="rounded border border-slate-200 bg-white px-1 py-0.5 font-mono text-[10px]">
                    <CornerDownLeft className="inline h-2.5 w-2.5" />
                  </kbd>
                  open
                </span>
              </div>
              <span>{filtered.length} result{filtered.length === 1 ? '' : 's'}</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
