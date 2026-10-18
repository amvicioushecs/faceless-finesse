# Performance Optimization

> Faceless Finesse · Draft v1 · 2026-10-18 · Extracted from code-documentation.md and expanded.

## 1. Targets (budgets enforced in CI)
| Metric | Target | Measured with |
|---|---|---|
| Member app interactive (inside Whop iframe) | < 2.5 s on 4G mid-range phone | Playwright + Lighthouse CI on preview |
| Public pages LCP / INP / CLS | < 1.5 s / < 200 ms / < 0.1 | Lighthouse CI, Cloudflare Web Analytics (RUM) |
| API p95 (non-generation) | < 300 ms | Workers Observability |
| AI text generation p95 | < 8 s (else switch to async job) | `usage_events` latency field |
| Image render (text-on-image) | < 2 s | render_jobs timings |
| Video render (30 s, 9:16) | < 3 min from queue to R2 | render_jobs timings |
| JS shipped on first app route | < 200 KB gzipped | bundle analyzer in CI |

## 2. Frontend
- **Code splitting:** route-level by default (App Router); `next/dynamic` lazy-loads heavy pieces: calendar (dnd-kit), canvas/template preview, script editor, charts in the owner dashboard.
- **Server Components first:** data-heavy screens render on the server; client components only for interactivity.
- **Images:** pre-sized thumbnails generated at render time (WebP/AVIF) stored in R2; `loading="lazy"` and explicit width/height to avoid CLS; Cloudflare Images/resizing optional.
- **Fonts:** self-hosted, subset, `font-display: swap`; Frosted UI tokens to avoid extra CSS.
- **TanStack Query:** sensible `staleTime` (e.g. niches 10 min, calendar 30 s), prefetch the next screen in the guided flow, optimistic updates for drag-and-drop and approvals.
- **Lists:** virtualize long lists (ideas, members table) beyond ~100 rows.
- **Realtime instead of polling** for job status.

## 3. Public marketing site
- **Static generation (SSG)** for home, features, how it works, pricing, FAQ, about, contact and guides; served from Workers static assets at the edge.
- Minimal client JS (no app bundle on marketing pages); critical CSS inlined.
- Long-lived cache headers on hashed assets; HTML cached at the edge and purged on deploy.
- JSON-LD and all facts in server-rendered HTML so crawlers don't need JS (see aeo.md).

## 4. Backend / Workers
- **Indexes** per database-schema.md; `EXPLAIN ANALYZE` on every new query touching > 10k rows.
- **Connection pooling:** Supabase pooler or Cloudflare Hyperdrive for Postgres from Workers.
- **Caching in KV:** treg.to keyword/SERP results 24 h, trend pulls 1–6 h, Whop access checks 5 min, idempotency keys 24 h.
- **Batching:** generate 20 ideas or a 30-day calendar in one structured AI call instead of many; batch treg.to keyword lookups.
- **Async everything heavy:** AI calls > a few seconds, renders and publishes go through Queues/Workflows; the request returns `202` immediately.
- **Payloads:** paginated, field-trimmed responses; gzip/brotli via Cloudflare.
- **Cold starts:** Workers have near-zero cold start; Containers can cold start, so autopilot runs ahead of the user's chosen time and keeps a warm instance during peak morning windows if needed.

## 5. Rendering pipeline
- Satori + resvg-wasm in a Worker for text-on-image (no container needed).
- Video: scene images generated in parallel; motion clips only for key scenes (~10 s per video); Remotion renders at 720×1280 by default; FFmpeg `-preset veryfast`; outputs straight to R2.
- Per-user render concurrency limit (2) and Queue batching smooth the 7 AM spike.
- Cache reusable assets (brand intros, music beds, templates) in the container image or R2.

## 6. Cost-performance
- Cheapest capable model first with fallback (see ai-model-options.md); prompt caching where the provider supports it.
- Daily cost job sums `usage_events`; alert on spend anomalies.

## 7. Monitoring & regression
- Lighthouse CI + bundle-size check fail the PR if budgets regress > 10%.
- Workers Observability + Sentry performance traces for API p95; dashboards per endpoint and per job kind.
