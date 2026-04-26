import 'server-only';

import { createServerClient } from '@supabase/ssr';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

const PLACEHOLDER_VALUES = new Set([
  '',
  'your_supabase_url_here',
  'your_supabase_anon_key_here',
  'your_supabase_service_role_key_here',
]);

const isReal = (v: string | undefined) => !!v && !PLACEHOLDER_VALUES.has(v);

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

/**
 * Server client — for server components, route handlers, and server actions.
 * Reads/writes cookies through next/headers. Respects RLS.
 */
export function getServerSupabase(): SupabaseClient | null {
  if (!isReal(url) || !isReal(anonKey)) return null;
  const cookieStore = cookies();
  return createServerClient(url!, anonKey!, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Called from a Server Component — middleware refreshes the session instead.
        }
      },
    },
  });
}

let serviceClient: SupabaseClient | null = null;

/**
 * Service-role client — server only. Bypasses RLS. Use for trusted, system-wide
 * operations (seeded data, admin tooling). Never expose to the browser.
 */
export function getServiceSupabase(): SupabaseClient | null {
  if (!isReal(url) || !isReal(serviceRoleKey)) return null;
  if (!serviceClient) {
    serviceClient = createClient(url!, serviceRoleKey!, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
  }
  return serviceClient;
}
