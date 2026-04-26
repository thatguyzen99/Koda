/**
 * Dashboard route group layout — shared chrome + auth gate.
 *
 * Auth gating is *conditional* on Supabase being configured:
 *
 * - With env vars set: we read the Supabase session server-side and
 *   redirect to /sign-in if there's no user. Sidebar and Header get
 *   the real user object for the avatar pill + sign-out form.
 *
 * - Without env vars (fresh clone, demo mode): the gate is bypassed
 *   entirely and the dashboard renders with a generic "Demo Operator"
 *   identity. Reviewers can clone the repo and click around without
 *   wiring Supabase first.
 *
 * This is a Server Component (no 'use client' directive) so the
 * `redirect()` from next/navigation works — that helper requires a
 * server-render context.
 */
import { redirect } from 'next/navigation';
import Sidebar, { type SidebarUser } from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import { isSupabaseConfigured } from '@/lib/supabase';
import { getServerSupabase } from '@/lib/supabase-server';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let user: SidebarUser | null = null;

  if (isSupabaseConfigured()) {
    const supabase = getServerSupabase();
    const { data } = (await supabase?.auth.getUser()) ?? { data: { user: null } };
    if (!data.user) {
      redirect('/sign-in');
    }
    user = {
      email: data.user.email ?? null,
      // user_metadata.full_name is set when users go through OAuth providers
      name: (data.user.user_metadata?.full_name as string | undefined) ?? null,
    };
  }

  return (
    <div className="flex min-h-screen bg-[#F6F9FC]">
      <Sidebar user={user} />
      <div className="flex min-h-screen flex-1 flex-col pl-[260px]">
        <Header user={user} />
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
