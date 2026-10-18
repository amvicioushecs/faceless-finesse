# Faceless Finesse

An AI-guided web app that helps beginners and existing creators pick an easy-to-rank micro-niche, generate scripts, text/image/video posts, and auto-post to YouTube, Facebook and X on a 30-day calendar.

It's a **Whop App** (Whop handles login, paywall, 3-day free trial and billing), runs on **Cloudflare Workers** via [`@opennextjs/cloudflare`](https://opennext.js.org/cloudflare), and stores data in **Supabase** (Postgres + RLS + Realtime). The full plan is in [`docs/plan/`](docs/plan/README.md).

## Stack
Next.js 16 (App Router, TypeScript) · `@whop/react` + Frosted UI · Tailwind CSS 4 · Supabase · Zod · Vitest + Testing Library + PGlite · Playwright · ESLint · GitHub Actions. Started from [`whopio/whop-nextjs-app-template`](https://github.com/whopio/whop-nextjs-app-template).

## Getting started
Requirements: Node 22 (see `.nvmrc`) and pnpm 10.

```bash
pnpm install
cp .env.example .env.local   # fill in what you have; the public site runs with none
pnpm dev                     # Next.js behind the Whop dev proxy
# or: pnpm dev:next          # plain next dev (public site only)
```

To test inside Whop: create an app in the Whop dashboard, set its Base URL to your dev URL, and use the paths below.

| Surface | Path | Who |
|---|---|---|
| Member app (welcome screen) | `/experiences/[experienceId]` | Members with access |
| Owner dashboard | `/dashboard/[companyId]` | Whop company admins |
| Discover listing | `/discover` | Whop browsers |
| Public site | `/`, `/how-it-works`, `/features`, `/pricing`, `/faq`, `/about`, `/contact` | Everyone, search engines, AI assistants |
| AEO files | `/llms.txt`, `/llms-full.txt`, `/robots.txt`, `/sitemap.xml` | Crawlers |

## Scripts
| Command | What it does |
|---|---|
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm lint` | ESLint (`eslint-config-next`) |
| `pnpm test` | Vitest: unit, component and RLS tests (migrations applied to in-process Postgres via PGlite) |
| `pnpm test:e2e` | Playwright smoke tests against `next start` (run `pnpm build` first) or `E2E_BASE_URL` |
| `pnpm build` | `next build` |
| `pnpm cf:build` | OpenNext build for Cloudflare Workers (`.open-next/`) |
| `pnpm cf:preview` | Build + run locally in the Workers runtime (workerd). Nothing is deployed. |
| `pnpm check` | typecheck + lint + test + build |

## Project layout
```
app/(marketing)/      Public site (static HTML + JSON-LD from site-facts)
app/(whop)/           Whop app: experiences, dashboard, discover
app/api/              /api/health, /api/v1/webhooks/whop
app/llms*.txt, robots.ts, sitemap.ts   Generated from lib/site-facts.ts
lib/site-facts.ts     Single source of truth for every public business fact
lib/env.ts            Zod env validation (matches .env.example)
lib/auth/             Whop token verification + cached access checks
lib/supabase/         Browser, user-scoped and service-role clients
supabase/migrations/  Schema + RLS
tests/                unit, integration (RLS), e2e
wrangler.jsonc        Workers config (bindings are PLACEHOLDERS)
```

## Placeholders before launch
- Domain `facelessfinesse.com` and `support@facelessfinesse.com` (in `lib/site-facts.ts`, `wrangler.jsonc`).
- Tier prices and Whop plan IDs (`siteFacts.tiers`); unset prices show "Price not published yet" and are left out of JSON-LD.
- Whop store URL, social profile URLs, founder bio, logo.
- Cloudflare R2 bucket and KV namespace IDs in `wrangler.jsonc`.

## Secrets
Never commit secrets. Locally use `.env.local` / `.dev.vars`; in Cloudflare use `wrangler secret put <NAME>`. Every variable is listed in `.env.example` and validated in `lib/env.ts` (a test keeps the two in sync).

## Notes
- `@whop/sdk` is pinned to `0.0.x` because it includes `verifyUserToken`; the 2.x rewrite does not expose it yet.
- Users authenticate with Whop, not Supabase Auth. After verifying the Whop token, the server will mint a Supabase JWT with `sub = users.id` (stage 2), so RLS (`owner_id = auth.uid()`) applies to every user query.
