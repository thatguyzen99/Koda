import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase-server';

export async function POST(request: NextRequest) {
  const supabase = getServerSupabase();
  if (supabase) {
    await supabase.auth.signOut();
  }
  const origin = new URL(request.url).origin;
  return NextResponse.redirect(`${origin}/sign-in`, { status: 303 });
}
