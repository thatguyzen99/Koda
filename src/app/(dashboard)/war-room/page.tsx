'use client';

import { motion } from 'framer-motion';
import { AlertTriangle, AlertCircle, CheckCircle2, CalendarDays, Sparkles } from 'lucide-react';
import { ScoreRing } from '@/components/ui/ScoreRing';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { StatCard } from '@/components/ui/StatCard';
import { Button } from '@/components/ui/Button';
import { PageShell } from '@/components/layout/PageShell';
import ComplianceTimeline from '@/components/war-room/ComplianceTimeline';
import RiskBreakdown from '@/components/war-room/RiskBreakdown';
import RegulationsList from '@/components/war-room/RegulationsList';
import { useToast } from '@/components/ui/Toaster';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

export default function WarRoom() {
  const toast = useToast();
  const data = {
    overallScore: 67,
    criticalIssues: 3,
    warnings: 5,
    passing: 12,
    lastAudit: '2026-04-23T14:30:00Z',
  };

  const lastAuditTime = (() => {
    const t = new Date(data.lastAudit).getTime();
    return Number.isNaN(t) ? null : t;
  })();
  const totalControls =
    (data.criticalIssues ?? 0) + (data.warnings ?? 0) + (data.passing ?? 0);

  return (
    <PageShell
      eyebrow={
        <>
          <Sparkles className="h-3 w-3" />
          Compliance Command Center
        </>
      }
      title={
        <>
          War{' '}
          <span className="text-gradient-vibrant">Room</span>
        </>
      }
      description="Real-time compliance posture across every regulatory framework you operate under. Track risk, prioritize fixes, and ship with confidence."
      actions={
        <>
          <Button
            variant="outline"
            size="md"
            onClick={() =>
              toast.info('Export coming soon — PDF & CSV are on the roadmap.')
            }
          >
            Export Report
          </Button>
          <Button
            variant="gradient"
            size="md"
            onClick={() =>
              toast.info('Live audit available in the Auditor — try it →')
            }
          >
            Run Live Audit
          </Button>
        </>
      }
    >
      <motion.div
        className="space-y-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Top Row: Hero score + Stats */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Hero score card */}
          <motion.div variants={itemVariants} className="lg:col-span-4">
            <Card className="relative h-full overflow-hidden border-accent-200/50 bg-white shadow-card">
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-gradient-to-br from-accent-500/8 via-transparent to-magenta-500/8"
              />
              <div
                aria-hidden
                className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-accent-500/15 blur-3xl"
              />
              <CardContent className="relative flex flex-col items-center justify-center p-8 pt-8">
                <div className="mb-2">
                  <ScoreRing score={data.overallScore} size="lg" />
                </div>
                <p className="mt-6 text-sm font-semibold uppercase tracking-wider text-slate-500">
                  Overall Compliance Score
                </p>
                <p className="mt-2 text-center text-xs text-slate-500">
                  Weighted across {totalControls} controls in 3 active frameworks
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Stat tiles */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 lg:col-span-8">
            <motion.div variants={itemVariants}>
              <StatCard
                label="Critical Issues"
                value={data.criticalIssues}
                helper="Requires immediate action"
                tone="danger"
                icon={<AlertCircle className="h-5 w-5" />}
              />
            </motion.div>
            <motion.div variants={itemVariants}>
              <StatCard
                label="Warnings"
                value={data.warnings}
                helper="Review within 30 days"
                tone="warning"
                icon={<AlertTriangle className="h-5 w-5" />}
              />
            </motion.div>
            <motion.div variants={itemVariants}>
              <StatCard
                label="Passing"
                value={data.passing}
                helper="Verified compliant"
                tone="success"
                icon={<CheckCircle2 className="h-5 w-5" />}
              />
            </motion.div>
            <motion.div variants={itemVariants} className="sm:col-span-3">
              <StatCard
                label="Last Audit"
                value={
                  lastAuditTime
                    ? new Date(lastAuditTime).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })
                    : '—'
                }
                helper={
                  lastAuditTime
                    ? `${Math.max(
                        0,
                        Math.floor((Date.now() - lastAuditTime) / 86400000)
                      )} days ago · Automated scan`
                    : 'No recent audit'
                }
                tone="accent"
                icon={<CalendarDays className="h-5 w-5" />}
              />
            </motion.div>
          </div>
        </div>

        {/* Middle Row */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <motion.div variants={itemVariants}>
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Risk Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <RiskBreakdown
                  critical={data.criticalIssues}
                  warning={data.warnings}
                  passing={data.passing}
                />
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Applicable Regulations</CardTitle>
              </CardHeader>
              <CardContent>
                <RegulationsList />
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Bottom Row */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle>Recent Audit Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <ComplianceTimeline />
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </PageShell>
  );
}
