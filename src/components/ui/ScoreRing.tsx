'use client';

/**
 * Animated circular score indicator (0–100).
 *
 * The ring is drawn as a single SVG <circle> with a stroke gradient
 * sized to a known circumference. We animate from "fully empty" (the
 * stroke offset equals the circumference) to "score%" using framer-
 * motion on the `strokeDashoffset` attribute. The trick: the ring
 * appears to fill clockwise even though SVG strokes start at the
 * 3-o'clock position by default — we rotate the parent svg by -90°
 * so the start sits at 12-o'clock.
 *
 * Color tone is derived from the score: ≥80 emerald, ≥50 amber,
 * otherwise red. Each tone has a multi-stop gradient + a soft outer
 * blur halo so the indicator feels alive rather than flat.
 */
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

type SizeType = 'sm' | 'md' | 'lg';

interface ScoreRingProps {
  score: number;
  size?: SizeType;
  label?: string;
}

const sizeMap: Record<SizeType, { container: number; text: string; sub: string; radius: number; stroke: number }> = {
  sm: { container: 88, text: 'text-2xl', sub: 'text-[10px]', radius: 38, stroke: 6 },
  md: { container: 132, text: 'text-4xl', sub: 'text-[11px]', radius: 58, stroke: 8 },
  lg: { container: 180, text: 'text-5xl', sub: 'text-xs', radius: 80, stroke: 10 },
};

function getScoreTone(score: number) {
  if (score >= 80) {
    return {
      gradient: 'from-emerald-400 via-emerald-500 to-teal-500',
      stops: ['#34D399', '#10B981', '#0D9488'],
      label: 'Compliant',
      text: 'text-emerald-600',
    };
  }
  if (score >= 50) {
    return {
      gradient: 'from-amber-400 via-amber-500 to-orange-500',
      stops: ['#FBBF24', '#F59E0B', '#F97316'],
      label: 'At Risk',
      text: 'text-amber-600',
    };
  }
  return {
    gradient: 'from-red-400 via-red-500 to-rose-500',
    stops: ['#F87171', '#EF4444', '#E11D48'],
    label: 'Critical',
    text: 'text-red-600',
  };
}

export function ScoreRing({ score, size = 'md', label }: ScoreRingProps) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const config = sizeMap[size];
  const tone = getScoreTone(score);
  const circumference = 2 * Math.PI * config.radius;
  const cx = config.container / 2;
  const cy = config.container / 2;
  const gradientId = `score-gradient-${size}-${tone.label}`;

  useEffect(() => {
    const t = setTimeout(() => setAnimatedScore(score), 50);
    return () => clearTimeout(t);
  }, [score]);

  return (
    <div className="flex flex-col items-center gap-3">
      <motion.div
        className="relative"
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        style={{ width: config.container, height: config.container }}
      >
        {/* Soft outer glow */}
        <div
          aria-hidden
          className={`pointer-events-none absolute inset-0 rounded-full bg-gradient-to-br ${tone.gradient} opacity-20 blur-2xl`}
        />

        <svg
          width={config.container}
          height={config.container}
          viewBox={`0 0 ${config.container} ${config.container}`}
          className="relative -rotate-90"
        >
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={tone.stops[0]} />
              <stop offset="50%" stopColor={tone.stops[1]} />
              <stop offset="100%" stopColor={tone.stops[2]} />
            </linearGradient>
          </defs>
          <circle
            cx={cx}
            cy={cy}
            r={config.radius}
            fill="none"
            stroke="rgb(241 245 249)"
            strokeWidth={config.stroke}
          />
          <motion.circle
            cx={cx}
            cy={cy}
            r={config.radius}
            fill="none"
            stroke={`url(#${gradientId})`}
            strokeWidth={config.stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{
              strokeDashoffset: circumference - (animatedScore / 100) * circumference,
            }}
            transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.p
            className={`tabular font-heading font-extrabold ${config.text} ${tone.text}`}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.4 }}
          >
            {Math.round(animatedScore)}
          </motion.p>
          <p className={`font-semibold uppercase tracking-wider text-slate-500 ${config.sub}`}>
            {tone.label}
          </p>
        </div>
      </motion.div>

      {label && <p className="text-sm font-medium text-slate-700">{label}</p>}
    </div>
  );
}

export default ScoreRing;
