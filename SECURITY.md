# Security model

This document describes Koda's security posture. It's accurate as of the
current commit.

## Threat model in scope

- **Untrusted user input** to API routes (audit, PRD, projects, momo,
  regulations search) — schemas, descriptions, jurisdictions, currency
  codes, etc.
- **Untrusted query params** on `/auth/callback` (the magic-link landing).
- **Untrusted clipboard / DOM input** on the Auditor's code editor.
- **Browser-only** — Koda has no exposed admin surface; all writes go
  through API routes that this app owns.

## Out of scope (acknowledged gaps)

- **Rate limiting** — no per-IP / per-user request caps. Acceptable for
  the demo; a production deploy should put the API routes behind Vercel
  Edge Middleware rate-limit, Upstash, or similar.
- **CSP** — no `Content-Security-Policy` header is set. Setting one is
  brittle with Next.js dev mode + framer-motion + Google Fonts, and the
  demo doesn't load third-party scripts. Production deploys should pin
  a CSP using nonces.
- **Secrets rotation** — keys live in `.env.local` and are gitignored.
  Rotation is manual.

## What is enforced

### Server-side input validation (every API route)
- `POST /api/audit` — strict types on `schema_input`, `schema_type`,
  `jurisdictions`. Caps total payload at 100 KB. Rejects unknown
  schema types.
- `POST /api/prd/generate` — caps description at 10 KB, jurisdictions
  array at 16 entries × 32 chars each.
- `POST /api/projects` — name ≤ 255 chars, description ≤ 4 KB,
  jurisdictions capped, every entry trimmed and lowercased.
- `POST /api/momo/simulate` — provider IDs ≤ 32 chars, source ≠ target,
  amount in (0, 10⁹], currency in a fixed allowlist.
- `POST /api/regulations/search` — query ≤ 256 chars,
  `constraint_type` in a fixed allowlist.
- All routes return a structured `{error: {code, message, field}}`
  envelope on validation failures.

### Server-side error handling
- 500 responses **never** include stack traces or error messages
  derived from internal exceptions. They log internally and return a
  generic `{error: "..."}` to the client.
- Supabase persistence failures are caught and downgraded to in-memory
  fallbacks — they never break the user-facing response.

### Auth
- `/auth/callback` validates the `next` query param: only same-origin
  relative paths are followed (`/foo`), protocol-relative URLs
  (`//evil.com`, `/\\evil.com`) and absolute URLs are rejected. This
  closes the open-redirect class of bugs that magic-link flows
  classically have.
- Sign-out is a `POST /auth/sign-out` — not a `GET` — so it can't be
  triggered by a hostile image / `<a>` tag from another origin.
- Session cookies are managed by `@supabase/ssr` with the SDK's
  defaults: `HttpOnly`, `Secure` (over HTTPS), `SameSite=Lax`. Renewal
  happens in `src/middleware.ts` on every request.

### Service-role key isolation
- The Supabase service-role key is read **only** by
  `src/lib/supabase-server.ts`, which has a top-of-file `import 'server-only'`
  guard. Any attempt to import that module from a client component
  fails the build.
- Browser code uses the anon key via `getBrowserSupabase()` and
  respects RLS.

### Public env vars
- Only variables prefixed `NEXT_PUBLIC_` are bundled into client code.
  `ANTHROPIC_API_KEY` and `SUPABASE_SERVICE_ROLE_KEY` are server-only
  by name and stay server-only by routing.

### Database
- Every Supabase table has Row Level Security enabled.
- The auth-scoped `001_initial_schema.sql` enforces "owner can read/
  write own rows" via `auth.uid()` policies.
- The demo tables (`koda_projects`, `koda_audits`, `koda_audit_findings`)
  use public-read + server-only-write policies, so an attacker with the
  anon key can read demo data but cannot write to it. Writes go
  through API routes that use the service role.
- All Supabase calls use the SDK's parameterized query builder
  (`.from().select().eq()...`). No string concatenation = no SQL
  injection surface.

### XSS
- Every dynamic value is rendered as React text (auto-escaped). The
  codebase contains zero `dangerouslySetInnerHTML`, `eval`, or
  `new Function`.
- The Auditor's code editor is a plain `<textarea>` — content is
  echoed back through React, not parsed as HTML.

### Response headers (`next.config.js`)
- `X-Frame-Options: DENY` — clickjacking protection.
- `X-Content-Type-Options: nosniff` — stop browser MIME sniffing.
- `Referrer-Policy: strict-origin-when-cross-origin` — don't leak
  full URL on outbound nav.
- `Permissions-Policy: camera=(), microphone=(), geolocation=(),
  payment=(), usb=()` — deny powerful APIs we don't use.
- `X-Powered-By` is stripped via `poweredByHeader: false`.

### Secrets in repo
- `.gitignore` excludes `.env`, `.env.local`, `.env.*.local`. Verify
  with `git check-ignore -v .env.local`.

## Recommended hardening before production

1. Add Upstash or Vercel rate-limit middleware to `/api/audit`,
   `/api/prd/generate`, `/api/projects`.
2. Pin a Content-Security-Policy with nonces (see Next.js docs §CSP).
3. Migrate all production data from the auth-optional `koda_*` demo
   tables to the auth-scoped tables in `001_initial_schema.sql`, which
   already have proper per-user RLS policies.
4. Configure Supabase magic-link expiry (default 60 min) and OTP
   reuse policy in the dashboard.
5. Rotate the Anthropic + Supabase keys that touched any AI / chat
   transcript context.
6. Set `NEXT_PUBLIC_SITE_URL` in production so OG metadata absolute
   URLs resolve correctly.
