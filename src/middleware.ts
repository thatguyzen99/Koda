import { type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase-middleware';

export async function middleware(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Run on every route except static assets and image optimizer.
     * Keeps the Supabase session cookie fresh so server components
     * can read auth state without races.
     */
    '/((?!_next/static|_next/image|favicon\\.ico|favicon\\.svg|og-image\\.svg).*)',
  ],
};
