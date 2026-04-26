import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

const PLACEHOLDER_VALUES = new Set([
  '',
  'your_supabase_url_here',
  'your_supabase_anon_key_here',
]);

const isReal = (v: string | undefined) => !!v && !PLACEHOLDER_VALUES.has(v);

/**
 * Refreshes the Supabase auth session cookie on every request.
 * No-ops gracefully when Supabase env vars are missing.
 */
export async function updateSession(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!isReal(url) || !isReal(anonKey)) {
    return NextResponse.next({ request });
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(url!, anonKey!, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  // Required: this triggers the cookie refresh on every request.
  await supabase.auth.getUser();

  return response;
}
