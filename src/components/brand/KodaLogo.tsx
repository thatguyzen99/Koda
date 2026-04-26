import Image from 'next/image';
import { cn } from '@/lib/utils';

/**
 * Koda brand asset renderer.
 *
 * The brand has seven SVG variants under `/public/brand/svg/`:
 *
 * - `icon` (default)        — colored gradient mark only
 * - `icon-mono-black`       — solid black mark only (use on light bg)
 * - `icon-mono-white`       — solid white mark only (use on dark bg)
 * - `logo-black`            — colored mark + black wordmark (light bg)
 * - `logo-white`            — colored mark + white wordmark (dark bg)
 * - `logo-mono-black`       — solid black mark + black wordmark (light bg, mono)
 * - `logo-mono-white`       — solid white mark + white wordmark (dark bg, mono)
 *
 * Pick the variant based on the surface you're placing it on. Pass
 * `priority` for above-the-fold placements (Sidebar brand, hero) so
 * Next can preload the asset.
 */

export type KodaLogoVariant =
  | 'icon'
  | 'icon-mono-black'
  | 'icon-mono-white'
  | 'logo-black'
  | 'logo-white'
  | 'logo-mono-black'
  | 'logo-mono-white';

interface KodaLogoProps {
  variant?: KodaLogoVariant;
  /** Rendered height in px. Width auto-derives from intrinsic aspect ratio. */
  height?: number;
  /** Optional alt; defaults to "Koda". */
  alt?: string;
  className?: string;
  priority?: boolean;
}

// Intrinsic aspect ratios — keeps sizing predictable across variants.
// (icon variants are roughly square; lockups are ~3.6:1 wide.)
const RATIOS: Record<KodaLogoVariant, number> = {
  icon: 1.18,
  'icon-mono-black': 1.18,
  'icon-mono-white': 1.18,
  'logo-black': 3.6,
  'logo-white': 3.6,
  'logo-mono-black': 3.6,
  'logo-mono-white': 3.6,
};

export function KodaLogo({
  variant = 'icon',
  height = 32,
  alt = 'Koda',
  className,
  priority = false,
}: KodaLogoProps) {
  const ratio = RATIOS[variant];
  const width = Math.round(height * ratio);

  return (
    <Image
      src={`/brand/svg/${variant}.svg`}
      alt={alt}
      width={width}
      height={height}
      priority={priority}
      className={cn('select-none', className)}
      // SVGs are vector — Next.js still serves them as static assets,
      // but we set unoptimized so it doesn't try to rasterize.
      unoptimized
    />
  );
}

export default KodaLogo;
