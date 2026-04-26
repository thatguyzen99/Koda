'use client';

import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';

interface TimelineEvent {
  id: string;
  timestamp: Date;
  auditType: string;
  scoreChange: number;
  previousScore: number;
  currentScore: number;
  status: 'improved' | 'declined' | 'stable';
}

const mockTimelineData: TimelineEvent[] = [
  {
    id: '1',
    timestamp: new Date('2026-04-23T14:30:00Z'),
    auditType: 'Automated Scan',
    scoreChange: 2,
    previousScore: 65,
    currentScore: 67,
    status: 'improved',
  },
  {
    id: '2',
    timestamp: new Date('2026-04-21T10:15:00Z'),
    auditType: 'CBL MFS Regulations',
    scoreChange: -3,
    previousScore: 68,
    currentScore: 65,
    status: 'declined',
  },
  {
    id: '3',
    timestamp: new Date('2026-04-19T16:45:00Z'),
    auditType: 'Manual Review',
    scoreChange: 0,
    previousScore: 68,
    currentScore: 68,
    status: 'stable',
  },
  {
    id: '4',
    timestamp: new Date('2026-04-15T09:20:00Z'),
    auditType: 'Data Protection Audit',
    scoreChange: 5,
    previousScore: 63,
    currentScore: 68,
    status: 'improved',
  },
];

const statusMeta = {
  improved: { icon: TrendingUp, color: 'text-emerald-600', dot: 'bg-emerald-500', badge: 'success' as const },
  declined: { icon: TrendingDown, color: 'text-red-600', dot: 'bg-red-500', badge: 'danger' as const },
  stable: { icon: Minus, color: 'text-sky-600', dot: 'bg-sky-500', badge: 'info' as const },
};

const formatRelative = (d: Date | null | undefined) => {
  if (!d || Number.isNaN(d.getTime())) return '—';
  const diffMs = Date.now() - d.getTime();
  // Future dates: just show the date instead of negative numbers.
  if (diffMs < 0) {
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
  const days = Math.floor(diffMs / 86400000);
  if (days === 0) {
    const hours = Math.max(0, Math.floor(diffMs / 3600000));
    if (hours === 0) {
      const mins = Math.max(0, Math.floor(diffMs / 60000));
      return mins <= 1 ? 'Just now' : `${mins}m ago`;
    }
    return `${hours}h ago`;
  }
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export default function ComplianceTimeline() {
  return (
    <div className="relative">
      {/* Vertical line */}
      <div className="absolute left-3.5 top-2 bottom-2 w-px bg-gradient-to-b from-slate-200 via-slate-200 to-transparent" />

      <motion.div
        className="space-y-3"
        variants={{
          hidden: { opacity: 0 },
          visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
        }}
        initial="hidden"
        animate="visible"
      >
        {mockTimelineData.map((event) => {
          const meta = statusMeta[event.status];
          const Icon = meta.icon;
          return (
            <motion.div
              key={event.id}
              variants={{
                hidden: { opacity: 0, x: -8 },
                visible: { opacity: 1, x: 0 },
              }}
              className="relative flex gap-4"
            >
              {/* Dot */}
              <div className={cn(
                'relative z-10 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full ring-4 ring-white',
                meta.dot
              )}>
                <Icon className="h-3.5 w-3.5 text-white" strokeWidth={2.5} />
              </div>

              {/* Content */}
              <div className="flex-1 rounded-xl border border-slate-200 bg-white p-4 transition-shadow hover:shadow-card">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-heading font-bold text-[#0A2540]">
                      {event.auditType}
                    </p>
                    <p className="text-xs text-slate-500">
                      {formatRelative(event.timestamp)}
                    </p>
                  </div>
                  <Badge variant={meta.badge}>
                    {event.status === 'improved' && 'Improved'}
                    {event.status === 'declined' && 'Declined'}
                    {event.status === 'stable' && 'Stable'}
                  </Badge>
                </div>

                <div className="mt-3 flex items-center gap-4">
                  <div className="flex items-baseline gap-1">
                    <span className="tabular font-heading text-2xl font-bold text-[#0A2540]">
                      {event.currentScore}
                    </span>
                    <span className="text-xs text-slate-500">/ 100</span>
                  </div>
                  <div className={cn('text-sm font-semibold', meta.color)}>
                    {event.scoreChange > 0 ? '+' : ''}
                    {event.scoreChange} pts
                  </div>
                  <div className="ml-auto tabular text-xs text-slate-400">
                    {event.previousScore} → {event.currentScore}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
