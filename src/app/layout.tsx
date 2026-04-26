import type { Metadata, Viewport } from 'next';
import { Urbanist, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/Toaster';

const urbanist = Urbanist({
  variable: '--font-urbanist',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
});

const plusJakarta = Plus_Jakarta_Sans({
  variable: '--font-plus-jakarta',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
  title: {
    default: 'Koda — Compliance-as-Code for the New Africa',
    template: '%s · Koda',
  },
  description:
    'Compliance-as-Code for the New Africa. Audit schemas, simulate cross-border flows, and generate compliance-ready PRDs in seconds.',
  icons: {
    icon: '/favicon.svg',
  },
  openGraph: {
    title: 'Koda — Compliance-as-Code for the New Africa',
    description: 'Compliance-as-Code for the New Africa. The AI compliance architect for fintech builders.',
    type: 'website',
    images: [{ url: '/og-image.svg', width: 1200, height: 630, alt: 'Koda' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Koda — Compliance-as-Code for the New Africa',
    description: 'Compliance-as-Code for the New Africa.',
    images: ['/og-image.svg'],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0A2540',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${urbanist.variable} ${plusJakarta.variable} bg-[#F6F9FC] text-[#0A2540] antialiased`}
      >
        <Toaster>{children}</Toaster>
      </body>
    </html>
  );
}
