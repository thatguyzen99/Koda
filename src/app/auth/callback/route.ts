/**
 * Magic-link callback for Supabase Auth.
 *
 * Supabase redirects here with `?code=...&next=/some/path` after a user
 * clicks the email link. We exchange the code for a session cookie and
 * forward to the requested page.
 *
 * SECURITY: `next` is attacker-controlled query input. We only follow it if
 * it's a same-origin relative path (starts with `/` and is not protocol-
 * relative `//evil.com`). Otherwise we drop back to the default landing.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase-server';

const DEFAULT_NEXT = '/war-room';

/**
 * Returns `next` only if it's a safe same-origin relative path.
 * Rejects external URLs and protocol-relative paths (`//host/...`).
 */
function safeNext(next: string | null): string {
  if (!next) return DEFAULT_NEXT;
  if (!next.startsWith('/')) return DEFAULT_NEXT;
  if (next.startsWith('//') || next.startsWith('/\\')) return DEFAULT_NEXT;
  return next;
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = safeNext(searchParams.get('next'));

  if (!code) {
    return NextResponse.redirect(`${origin}/sign-in?error=missing_code`);
  }

  const supabase = getServerSupabase();
  if (!supabase) {
    return NextResponse.redirect(`${origin}/sign-in?error=auth_not_configured`);
  }

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    console.error('exchangeCodeForSession failed:', error.message);
    return NextResponse.redirect(`${origin}/sign-in?error=exchange_failed`);
  }

  return NextResponse.redirect(`${origin}${next}`);
}
