# Koda

> **Compliance-as-Code for the New Africa.**
> The AI compliance architect for fintech builders shipping into West Africa and beyond.

## Quick Start

```bash
cd regvibe
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — you'll land on the **War Room** dashboard.

## Environment Variables

Copy `.env.local` and fill in whatever you want enabled. **Every key is optional** — Koda gracefully falls back to demo mocks when a key is missing.

```
# Anthropic (powers Auditor + PRD Studio when set)
ANTHROPIC_API_KEY=sk-ant-...

# Supabase (powers project persistence + magic-link auth when set)
NEXT_PUBLIC_SUPABASE_URL=https://...supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

| Capability                | Without keys                                | With keys                                                     |
| ------------------------- | ------------------------------------------- | ------------------------------------------------------------- |
| Schema audit              | Heuristic mock findings                     | Live Claude audit with prompt caching, persisted to Supabase  |
| PRD generation            | Templated PRD                               | Live Claude PRD via tool-use                                  |
| Project list / save       | In-memory (resets on reload)                | Persisted to Supabase                                         |
| Sign-in (`/sign-in`)      | Friendly "auth not configured" message      | Supabase magic-link OTP, dashboard gate, server-side session  |

## Project Structure

```
regvibe/
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
│   │   └── layout.tsx               # Metadata + fonts
│   ├── components/
│   │   ├── ui/                      # Button, Card, Badge, Textarea, ScoreRing, StatCard
│   │   ├── layout/                  # Sidebar, Header, PageShell
│   │   ├── war-room/                # Timeline, RegulationsList, RiskBreakdown
│   │   ├── auditor/                 # CodeEditor, FindingsPanel, FixSuggestion
│   │   └── momo/                    # ProviderCard, TransactionFlow
│   ├── data/                        # Sample regulations and schemas
│   ├── lib/
│   │   ├── claude.ts                # Anthropic SDK wrapper (prompt caching + tool-use)
│   │   ├── supabase.ts              # Browser-side Supabase client
│   │   ├── supabase-server.ts       # Server-side cookie + service-role clients
│   │   ├── supabase-middleware.ts   # Session refresh helper
│   │   ├── utils.ts                 # cn(), formatters
│   │   └── constants.ts
│   ├── middleware.ts                # Refreshes Supabase session every request
│   └── types/                       # Shared TypeScript types
└── supabase/
    └── migrations/
        ├── 001_initial_schema.sql       # Auth-scoped production schema
        └── 002_koda_demo_projects.sql   # Demo projects table (no auth required)
```

## Design System

- **Brand:** Navy `#0A2540` + electric purple `#635BFF`, with magenta `#EC4899` and sky `#0EA5E9` as vibrant gradient companions.
- **Surfaces:** Aurora gradient mesh on `page-surface`, frosted-glass cards via `.glass`, `card-elevated` for default surfaces.
- **Typography:** Urbanist (display/headings) + Plus Jakarta Sans (body), tabular numerals for any stat.
- **Motion:** Framer Motion stagger + spring on hover — calm by default, vibrant on interaction.
- All four dashboard pages use `<PageShell>` for consistent layout.

## Tech Stack

- **Next.js 14** (App Router) + TypeScript
- **Tailwind CSS** with custom design tokens
- **Supabase** (Postgres + Auth + RLS) via `@supabase/ssr` for cookie-based server-side auth
- **Anthropic SDK** (`claude-sonnet-4-6` with prompt caching + tool use)
- **Framer Motion** for animation
- **Lucide React** for icons
