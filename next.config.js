/** @type {import('next').NextConfig} */

/**
 * Security headers applied to every response.
 *
 * - frame-ancestors / X-Frame-Options: prevent clickjacking
 * - X-Content-Type-Options: stop MIME sniffing
 * - Referrer-Policy: don't leak full URL on outbound nav
 * - Permissions-Policy: deny powerful APIs we don't use
 * - X-DNS-Prefetch-Control: opt-in only
 *
 * CSP is intentionally NOT set here — Next.js dev mode + framer-motion +
 * Tailwind JIT need careful nonce/sha pinning that's brittle for a demo.
 * Document this gap in SECURITY.md instead.
 */
const securityHeaders = [
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=()',
  },
];

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  poweredByHeader: false, // strip "X-Powered-By: Next.js"
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
};

module.exports = nextConfig;
