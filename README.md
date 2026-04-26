# Koda

> **Compliance-as-Code for the New Africa.**
> The AI compliance architect for fintech builders shipping into West Africa and beyond.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fthatguyzen99%2FKoda&project-name=koda&repository-name=koda&env=ANTHROPIC_API_KEY%2CNEXT_PUBLIC_SUPABASE_URL%2CNEXT_PUBLIC_SUPABASE_ANON_KEY%2CSUPABASE_SERVICE_ROLE_KEY&envDescription=All%20keys%20are%20optional.%20Without%20them%2C%20Koda%20runs%20in%20demo%20mode%20with%20mocked%20AI%20%2B%20in-memory%20persistence.&envLink=https%3A%2F%2Fgithub.com%2Fthatguyzen99%2FKoda%2Fblob%2Fmain%2F.env.example)

One-click deploy to Vercel — judges and reviewers can spin up their own copy in under two minutes.

## Quick Start (local)

```bash
git clone https://github.com/thatguyzen99/Koda.git koda
cd koda
npm install
cp .env.example .env.local   # fill in keys (or skip — demo mode works without them)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — you'll land on the marketing page. Click **Launch app** to enter the dashboard.

## Environment Variables

**Every key is optional.** Koda gracefully falls back to mock data when a key is missing, so the app stays runnable on a fresh clone with no setup.

| Variable | Required? | What it powers | Where to get it |
|---|---|---|---|
| `ANTHROPIC_API_KEY` | optional | Live Claude analysis in **Auditor** + **PRD Studio** (Haiku 4.5 with prompt caching). Without it, both endpoints return curated mock findings/PRDs. | [console.anthropic.com](https://console.anthropic.com/) → API Keys |
| `NEXT_PUBLIC_SUPABASE_URL` | optional* | Supabase project URL for auth + persistence. | Supabase project → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | optional* | Browser-side Supabase client (RLS-bound). | Same dashboard, "anon public" key |
| `SUPABASE_SERVICE_ROLE_KEY` | optional* | Server-only key that bypasses RLS — used by API routes to persist audits and projects. **Never expose this to the browser.** | Same dashboard, "service_role" key |
| `NEXT_PUBLIC_SITE_URL` | optional | Production URL (e.g. `https://koda.vercel.app`) — used so OG metadata images resolve to absolute URLs. | Set this on Vercel after first deploy. |

*The three Supabase variables are a unit — set all three or none. If only some are set, persistence falls back to in-memory mocks.

### Capability matrix at a glance

| Capability | Without keys | With keys |
| --- | --- | --- |
| Schema audit | Heuristic mock findings | Live Claude audit, persisted to Supabase |
| PRD generation | Templated PRD | Live Claude PRD via tool-use |
| Project list / save | In-memory (resets on reload) | Persisted to Supabase |
| Sign-in (`/sign-in`) | Friendly "auth not configured" message | Magic-link OTP, dashboard gate, server-side session |

### Deploying to Vercel manually

If the one-click button isn't your style:

```bash
npm install -g vercel
vercel login
vercel link            # link to a new or existing project
vercel env add ANTHROPIC_API_KEY production
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
vercel env add SUPABASE_SERVICE_ROLE_KEY production
vercel --prod
```

After first deploy, set `NEXT_PUBLIC_SITE_URL` to the production URL (e.g. `https://koda.vercel.app`) so OG metadata resolves correctly. Also add `https://<your-domain>/auth/callback` to **Supabase → Authentication → URL Configuration → Redirect URLs** so magic-link sign-in works in production.

## Apply the Supabase Migrations

If you set the Supabase env vars, run the three migrations against your project. Easiest path is the Supabase Studio SQL editor — paste each file in order:

1. `supabase/migrations/001_initial_schema.sql` — auth-scoped production schema (optional for demo)
2. `supabase/migrations/002_koda_demo_projects.sql` — powers `/api/projects`
3. `supabase/migrations/003_koda_audits.sql` — powers Auditor history

Or via the Supabase CLI (one-time setup):

```bash
npm install -D supabase
npx supabase login
npx supabase link --project-ref <your-project-ref>
npx supabase db push
```

Then add `http://localhost:3000/auth/callback` (and your production callback URL) to **Authentication → URL Configuration → Redirect URLs**.

## Project Structure

```
koda/
├── src/
│   ├── app/
│   │   ├── (dashboard)/             # Authenticated dashboard views
│   │   │   ├── war-room/            # Compliance health command center
│   │   │   ├── auditor/             # Schema audit split-screen
│   │   │   ├── momo-lab/            # Mobile money simulator
│   │   │   └── prd-studio/          # Compliance PRD generator
│   │   ├── auth/                    # Magic-link callback + sign-out
│   │   ├── sign-in/                 # Magic-link form
│   │   ├── api/                     # Route handlers
│   │   ├── globals.css              # Single source of truth for global CSS
│   │   ├── layout.tsx               # Metadata + fonts
│   │   └── page.tsx                 # Marketing landing
│   ├── components/
│   │   ├── brand/                   # KodaLogo
│   │   ├── ui/                      # Button, Card, Badge, Textarea, ScoreRing, StatCard, Toaster
│   │   ├── layout/                  # Sidebar, Header, PageShell, CommandPalette
│   │   ├── war-room/                # Timeline, RegulationsList, RiskBreakdown
│   │   ├── auditor/                 # CodeEditor, FindingsPanel, FixSuggestion
│   │   └── momo/                    # ProviderCard, TransactionFlow
│   ├── data/                        # Sample regulations, schemas, mock violations
│   ├── lib/
│   │   ├── claude.ts                # Anthropic SDK wrapper (prompt caching + tool-use)
│   │   ├── supabase.ts              # Browser-side Supabase client
│   │   ├── supabase-server.ts       # Server-side cookie + service-role clients
│   │   ├── supabase-middleware.ts   # Session refresh helper
│   │   ├── use-rotating-message.ts  # Loading-state progress messages
│   │   └── utils.ts                 # cn(), formatters
│   ├── middleware.ts                # Refreshes Supabase session every request
│   └── types/                       # Shared TypeScript types
├── public/
│   ├── brand/svg/                   # Koda brand SVG assets
│   ├── favicon.svg
│   └── og-image.svg
└── supabase/
    └── migrations/                  # SQL migrations
```

## Design System

- **Brand:** Official Koda gradient (`#4d285a → #785e9f → #ae87bd → #c7afd4 → #d59fb2 → #e3bcad → #f7cf87`), navy `#0A2540`.
- **Typography:** Urbanist (display / headings) + Plus Jakarta Sans (body), with tabular numerals on every stat.
- **Surfaces:** Aurora gradient mesh on `page-surface`, frosted-glass cards via `.glass`, `card-elevated` for default surfaces.
- **Motion:** Framer Motion stagger + spring on hover — calm by default, vibrant on interaction.
- All four dashboard pages compose around `<PageShell>` for consistent layout.

## Tech Stack

- **Next.js 14** (App Router) + TypeScript
- **Tailwind CSS** with custom design tokens
- **Supabase** (Postgres + Auth + RLS) via `@supabase/ssr` for cookie-based server-side auth
- **Anthropic SDK** (`claude-haiku-4-5` with prompt caching + tool use)
- **Framer Motion** for animation
- **Lucide React** for icons

## Security

See [SECURITY.md](SECURITY.md) for the threat model, what's enforced (input validation, RLS, service-role isolation, security headers, parameterized queries, validated auth-callback redirects), what's *not* (no rate limiting, no CSP), and a pre-production hardening checklist.

## License

MIT — see [LICENSE](LICENSE).
