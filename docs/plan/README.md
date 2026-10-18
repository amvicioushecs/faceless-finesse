# Faceless Finesse — Planning Docs

> Owner: Hector Verdugo · Planning complete (Draft v1) · 2026-10-18
> Status: planning only. Nothing has been built, deployed or registered yet.

**Faceless Finesse** is an AI-guided web app that helps beginners and existing creators pick an easy-to-rank micro-niche, generate scripts, text/image/video posts, and auto-post to YouTube, Facebook and X on a 30-day calendar. It's a SaaS built as a **Whop App** (Whop handles login, paywall, 3-day free trial and billing), hosted on **Cloudflare**, with **Supabase** for data.

## Folder map
| Path | What's in it |
|---|---|
| `README.md` | This file: overview, reading/build order, stack, open decisions |
| `prd.md` | Product requirements: audience, features (incl. video pipeline), trial, hosting, metrics, risks, scope |
| `frontend.md` | Whop app surfaces, Frosted UI, navigation without a step counter, screens/components, rendering & AEO notes |
| `backend.md` | Architecture, Whop auth, schema columns, endpoint summary, integrations, autopilot job, security, env vars |
| `api.md` | Full REST `/api/v1` reference: request/response shapes, error format, rate limits, webhooks |
| `database-schema.md` | ER diagram, tables, RLS rules, indexes, migrations, backups |
| `ai-model-options.md` | Researched text/image/video/voice model prices and the recommended budget stack |
| `devops.md` | Cloudflare hosting (Workers, R2, Queues, Cron, Workflows, KV, Containers, Workers AI), environments, CI/CD, monitoring |
| `user-flow.md` | Onboarding, core journey and autopilot diagrams, errors, edge cases, permissions, notifications |
| `state-management.md` | Local/global/server/realtime state and persistence rules |
| `testing-plan.md` | Unit, component, integration, E2E, contract and manual testing; CI gates |
| `code-documentation.md` | Documentation standards and security practices (performance moved out) |
| `performance-optimization.md` | Performance targets and techniques for frontend, public site, Workers, rendering |
| `third-party-libraries.md` | Libraries, services and licenses/compliance notes |
| `aeo.md` | Answer Engine Optimization: fact sheet, placeholders, target questions, crawlers, schema, measurement |
| `public/llms.txt` | llmstxt.org summary with links to key pages |
| `public/llms-full.txt` | Full answer-first text of the key public pages |
| `public/robots.txt` | AI crawlers + default allowed on public pages; app/API disallowed; sitemap |

## Reading / build order for AI coding agents
1. `README.md` → `prd.md` (what and why).
2. `devops.md` (where it runs) → `third-party-libraries.md` (what to install).
3. `database-schema.md` → `backend.md` → `api.md` (data and server contracts).
4. `frontend.md` → `user-flow.md` → `state-management.md` (UI and flow).
5. `ai-model-options.md` (AI Gateway providers and costs).
6. `testing-plan.md`, `code-documentation.md`, `performance-optimization.md` (quality bars).
7. `aeo.md` + `public/*` (public marketing site, last).

Suggested build sequence (matches prd.md §10):
1. Scaffold from `whopio/whop-nextjs-app-template`, add `@opennextjs/cloudflare`, wrangler config, Supabase project + migrations, CI.
2. Whop auth, access checks, webhooks, 3-day trial and plan entitlements; usage budgets; treg.to proxy.
3. Welcome screen + quiz → niche finder → offer → ideas/scripts → calendar.
4. Post Studio (text, text-on-image, image, video via Remotion in Containers), autopilot, monetization map.
5. Social OAuth + publishing (YouTube, Facebook Pages, X), failure handling and notifications.
6. Public marketing site generated from `site-facts.ts` (pages, JSON-LD, sitemap, llms files), then launch checklist.

## Stack summary
- **App:** Next.js (App Router) + React + TypeScript, Whop App template, `@whop/react`, `@whop/sdk`, Frosted UI, Tailwind, React Hook Form + Zod, TanStack Query, Zustand, dnd-kit.
- **Hosting:** Cloudflare Workers via `@opennextjs/cloudflare`; R2, Queues, Cron Triggers, Workflows, KV, Containers (Remotion + FFmpeg), Workers AI.
- **Data:** Supabase Postgres with RLS and Realtime.
- **Payments:** Whop (no Stripe), 3-day free trial.
- **Search data:** treg.to (server-side proxy with cost caps).
- **AI:** Gemini 3.1 Flash-Lite (fallback Groq gpt-oss-120b); FLUX.1 schnell + Nano Banana 2.1; xAI grok-imagine-video-1.5-lite; Gemini Flash-Lite TTS.
- **Publishing:** YouTube Data API v3, Meta Graph API (Facebook Pages), X API v2. TikTok/Instagram in phase 2.
- **Email / monitoring:** Resend, Sentry, Workers Observability.
- **Tests:** Vitest, Testing Library, MSW, Playwright; GitHub Actions.

## Open decisions
| Item | Status |
|---|---|
| Domain | Not registered; `facelessfinesse.com` is a placeholder everywhere |
| Support email | Placeholder `support@facelessfinesse.com` |
| Tier prices (Starter / Pro / Agency) | Not set; `[PRICE]` placeholders in docs, llms files and JSON-LD |
| Founder bio, photo and profile links | Needed for About page and `Person` schema |
| Whop store URL and social profile URLs | Needed for `sameAs`, CTAs and llms.txt |
| YouTube API audit | Required for public uploads (unaudited apps upload private only) |
| Meta app review | Required for Facebook Page publishing (`pages_manage_posts`) |
| X API paid tier | Required beyond the free tier; pick a tier and pass cost into plans |
| TikTok / Instagram approvals | Phase 2 |

The full placeholder list is in `aeo.md` §1 "Placeholders to replace".

## Environment variables
The complete list is in `backend.md` §8 (Security). Secrets are set with `wrangler secret put` and documented in `.env.example` in the app repo (see `devops.md` §2). Never commit secrets.
