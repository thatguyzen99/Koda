import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';

const PLACEHOLDER_VALUES = new Set([
  '',
  'your_supabase_url_here',
  'your_supabase_anon_key_here',
]);

const isReal = (v: string | undefined) => !!v && !PLACEHOLDER_VALUES.has(v);

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = () => isReal(url) && isReal(anonKey);

/**
 * Browser client — for client components. Reads/writes cookies through
 * the browser document. Use in 'use client' files.
 *
 * For server-side clients see `@/lib/supabase-server` (next/headers based).
 */
export function getBrowserSupabase(): SupabaseClient | null {
  if (!isSupabaseConfigured()) return null;
  return createBrowserClient(url!, anonKey!);
}
