# DevOps Documentation

> Faceless Finesse · Draft v1 · 2026-10-18

## 1. Hosting
| Piece | Host | Notes |
|---|---|---|
| Next.js app (Whop app + owner dashboard + public site) | **Cloudflare Workers** via the **OpenNext Cloudflare adapter** (`@opennextjs/cloudflare`) | Whop app Base URL points at the Workers domain. Static public pages served from Workers static assets. |
| Database, auth-adjacent data, Realtime | **Supabase** (Postgres, RLS, Realtime) | Host-independent; connect via Supabase JS or Hyperdrive for pooled Postgres. |
| Media storage | **Cloudflare R2** | Brand assets, rendered images/videos; no egress fees. Signed URLs for private assets. |
| Background jobs & scheduling | **Cloudflare Cron Triggers + Queues + Workflows** | Replaces Inngest: Cron every 15 min for autopilot; Queues for render/publish fan-out; Workflows for multi-step, retryable pipelines. |
| Video rendering | **Remotion + FFmpeg in Cloudflare Containers** | Container image with Chromium/Remotion/FFmpeg; invoked from a Queue consumer; output written to R2. Scales to zero when idle. |
| Text-on-image rendering | Satori + resvg-wasm in Workers (lightweight) or the render container | |
| AI images (budget) | **Workers AI** FLUX.1 schnell (free daily allowance) with fal.ai fallback | |
| Rate limiting / cache | Workers KV + Cloudflare Rate Limiting | Replaces Upstash Redis |
| Email | Resend | |
| DNS / CDN / WAF | Cloudflare | Bot protection on public endpoints; AI crawlers explicitly allowed on public pages (see aeo.md). |

> backend.md uses these same Cloudflare services (no Inngest, Upstash, Supabase Storage or Vercel).

## 2. Environments
- **dev:** local `wrangler dev` / `next dev`, Whop dev proxy, Supabase local (`supabase start`).
- **preview:** every PR deploys a Workers preview URL with a Supabase branch database.
- **production:** `main` branch → production Worker + production Supabase project.
- Secrets via `wrangler secret put` (never committed); `.env.example` documents every variable.

## 3. CI/CD (GitHub Actions)
On every PR: install → lint → typecheck → unit/integration tests → build (OpenNext) → container image build → deploy preview → Playwright smoke tests against preview.
On merge to `main`: run Supabase migrations → deploy Worker → push render container → post-deploy smoke test → automatic rollback (`wrangler rollback`) if smoke fails.

## 4. Monitoring & Alerting
- **Sentry** for frontend + Worker + container errors (source maps uploaded in CI).
- **Cloudflare Workers Observability / Logpush** for logs and traces.
- **Uptime checks** on the app, public site, and webhook endpoint.
- **Cost alerts:** daily job sums `usage_events` per provider and alerts the owner if spend exceeds thresholds.
- Alerts for failed publish/render jobs above a threshold, and expiring social tokens.

## 5. Scaling
- Workers and Containers scale automatically; Queues smooth bursts (e.g. many autopilot runs at 7 AM).
- Per-user concurrency limits on renders; plan-based budgets cap AI spend.
- Supabase: connection pooling, indexes per backend.md, read-heavy data cached in KV.

## 6. Backups & Recovery
- Supabase daily backups + point-in-time recovery (Pro plan).
- R2 object versioning on the media bucket.
- Documented restore runbook in the repo.
