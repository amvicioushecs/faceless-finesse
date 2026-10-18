# API Reference (REST `/api/v1`)

> Faceless Finesse · Draft v1 · 2026-10-18 · Extracted from backend.md §4 and expanded.
> Source of truth in code: Zod schemas in `lib/schemas/*`, exported as OpenAPI 3.1 (`zod-to-openapi`) at `/api/docs` (admins only).

## 1. Conventions
- **Base URL:** `https://<app-host>/api/v1` (Cloudflare Worker; the Whop app Base URL points here). Called from the Member App inside the Whop iframe.
- **Format:** JSON request and response bodies, `Content-Type: application/json`. Timestamps are ISO 8601 UTC (`2026-10-18T14:00:00Z`); IDs are UUIDs; money is integer cents; costs are integer micro-dollars (`cost_micro`).
- **Auth:** every request carries Whop's user token header (`x-whop-user-token`), verified server-side with `@whop/sdk` `verifyUserToken`. Access to the experience is checked via Whop (cached 5 min in KV). No API keys for members.
- **Workspace scope:** user-owned resources take a `workspaceId` (body or query). The server checks ownership and Postgres RLS enforces it again.
- **Async work:** long-running operations (AI generation over a few seconds, renders, publishes) return `202 Accepted` with a `job` object. Status updates arrive via Supabase Realtime on `render_jobs` / `publish_jobs`, or by polling `GET /jobs/:id`.
- **Idempotency:** `POST` endpoints that cost money or publish accept an `Idempotency-Key` header (UUID). Repeats within 24 h return the original response (stored in KV).
- **Pagination:** cursor-based: `?limit=20&cursor=<opaque>` → `{ data: [...], nextCursor: string | null }`. Max `limit` 100.
- **Field trimming:** list endpoints return summaries; fetch a single resource for full content.

### Common objects
```ts
type Job = { id: string; kind: "generate" | "render_image" | "render_video" | "publish"; status: "queued" | "running" | "succeeded" | "failed"; progress?: number; error?: ApiError["error"]; resultId?: string; createdAt: string };
type Usage = { periodStart: string; limitMicro: number; usedMicro: number; percent: number };
type Platform = "youtube" | "facebook" | "x";          // "tiktok" | "instagram" in phase 2
type PostFormat = "video" | "text" | "text_image" | "image";
type PostStatus = "draft" | "approved" | "scheduled" | "published" | "failed";
type Goal = "trust" | "leads" | "sales";
```

## 2. Error format
All errors use one shape:
```json
{ "error": { "code": "budget_exceeded", "message": "You've used this month's AI credits.", "details": { "usedMicro": 4000000, "limitMicro": 4000000 }, "requestId": "req_01J..." } }
```
| HTTP | `code` examples | When |
|---|---|---|
| 400 | `validation_failed` (`details.fieldErrors`) | Zod validation failed |
| 401 | `unauthenticated` | Missing/invalid Whop token |
| 402 | `plan_limit_reached`, `budget_exceeded`, `trial_expired` | Plan entitlement, monthly budget or trial cap hit |
| 403 | `forbidden`, `not_workspace_owner` | No access to this resource / not admin |
| 404 | `not_found` | Resource doesn't exist or isn't yours |
| 409 | `conflict`, `already_published`, `idempotency_mismatch` | State conflict |
| 422 | `social_reauth_required`, `unsafe_url` | Social token expired; viral link failed SSRF checks |
| 429 | `rate_limited` (+ `Retry-After` header) | Rate limit hit |
| 502 | `upstream_failed` (`details.provider`) | AI/treg/social provider failed after fallback |
| 500 | `internal_error` | Unexpected; reported to Sentry with `requestId` |

## 3. Rate limits
Enforced with Cloudflare Rate Limiting bindings + Workers KV counters, per Whop user. Responses include `RateLimit-Limit`, `RateLimit-Remaining`, `RateLimit-Reset`.
| Bucket | Limit (default, tunable in `PUT /admin/plan-limits`) |
|---|---|
| Read (`GET`) | 120 / min |
| Write (non-AI) | 60 / min |
| AI generation (`/discover`, `/drill`, `/generate`, offers AI) | 30 / min |
| Render (`/posts/:id/render`) | 10 / min, max 2 concurrent video renders per user |
| Publish | 20 / min, plus each platform's own limits (queue spaces posts) |
| Webhooks | Not rate-limited per user; signature required |

Separately, every paid call reserves budget atomically in `usage_budgets` before it runs; if the reservation fails the API returns `402 budget_exceeded`. Trial accounts have a reduced cap.

## 4. Endpoints

### 4.1 Account
**`GET /me`** → `200`
```json
{ "user": { "id": "uuid", "name": "Ben", "email": "ben@example.com", "timezone": "America/Los_Angeles" },
  "membership": { "tier": "trial|starter|pro|agency", "status": "trialing|active|past_due|canceled", "trialEndsAt": "2026-10-21T16:00:00Z", "renewsAt": null },
  "workspaces": [{ "id": "uuid", "name": "Home Workouts for Moms" }],
  "usage": { "periodStart": "2026-10-01T00:00:00Z", "limitMicro": 4000000, "usedMicro": 1200000, "percent": 30 },
  "entitlements": { "maxWorkspaces": 1, "autopilot": true, "video": true, "autoPost": true } }
```

**`POST /onboarding`**
```json
// request
{ "workspaceId": "uuid", "goals": ["side_income"], "experience": "beginner|some|experienced", "platforms": ["youtube","facebook","x"], "hoursPerWeek": 5, "skipped": false }
// 200
{ "onboardingProfile": { "workspaceId": "uuid", "goals": ["side_income"], "experience": "beginner", "platforms": ["youtube"], "hoursPerWeek": 5 } }
```

### 4.2 Niches
**`POST /niches/discover`** — AI niche suggestions scored with treg.to. Sync if < ~8 s, else `202` + job.
```json
// request
{ "workspaceId": "uuid", "seed": "fitness (optional)", "platform": "youtube", "minEaseToRank": 0, "count": 8 }
// 200
{ "niches": [{ "id": "uuid", "name": "Home workouts", "level": "niche", "monthlyVolume": 74000, "competition": 0.42, "buyerIntent": 0.6, "trendScore": 0.7, "easeToRankScore": 71, "reason": "High demand, many low-authority results" }] }
```
**`POST /niches/:id/drill`** — generate + score children (`sub` / `micro`). Request `{ "count": 6 }` → `200 { "parentId": "uuid", "niches": [Niche] }`.
**`PATCH /niches/:id/select`** — `{}` → `200 { "niche": Niche & { "selected": true } }` (unselects siblings).
**`POST /niches/custom`** — "I already have a niche": `{ "workspaceId", "name" }` → `200 { "niche": Niche }` (scored, then drillable).
**`GET /niches?workspaceId=&parentId=`** — tree listing, sorted by `easeToRankScore desc`.

### 4.3 Offers
**`POST /offers`**
```json
// request
{ "workspaceId": "uuid", "problem": "Busy moms can't find 20 minutes to work out", "audience": "postpartum moms", "format": "ebook|course|template|coaching|community", "generate": ["outline","price","salesCopy"], "existingUrl": null }
// 201
{ "offer": { "id": "uuid", "problem": "...", "audience": "...", "format": "ebook", "outline": [{ "title": "Week 1", "points": ["..."] }], "priceCents": 2700, "priceRationale": "...", "salesCopy": "markdown", "whopProductId": null } }
```
**`PATCH /offers/:id`** — partial update of any field; `{ "regenerate": ["salesCopy"] }` re-runs AI for that part.
**`GET /offers?workspaceId=`** · **`GET /offers/:id`**

### 4.4 Ideas & scripts
**`POST /ideas/generate`**
```json
// request
{ "workspaceId": "uuid", "nicheId": "uuid", "count": 20, "source": "ai|viral_link|trend", "viralUrl": "https://www.youtube.com/shorts/... (optional, allowlisted domains only)", "topic": "optional" }
// 200
{ "ideas": [{ "id": "uuid", "title": "3 moves you can do while the baby naps", "hook": "...", "angle": "...", "source": "ai", "status": "new" }] }
```
**`POST /scripts/generate`** — `{ "ideaId": "uuid", "durationSec": 30, "tone": "optional" }` → `200 { "script": { "id", "ideaId", "hook", "body", "cta", "durationSec": 30, "version": 1 } }`.
**`PATCH /scripts/:id`** — edit; creates a new `version`.
**`GET /ideas?workspaceId=&status=`** · **`PATCH /ideas/:id`** (`status`: `new|saved|used|dismissed`).

### 4.5 Posts (Post Studio)
**`POST /posts`**
```json
// request
{ "workspaceId": "uuid", "format": "video|text|text_image|image", "scriptId": "uuid (video)", "caption": "string", "goal": "trust|leads|sales",
  "template": { "id": "quote_card_01", "text": "..." }, "imagePrompt": "optional", "uploadKeys": ["r2 key (optional)"] }
// 201
{ "post": { "id": "uuid", "format": "text_image", "caption": "...", "mediaUrls": [], "status": "draft", "goal": "trust", "createdAt": "..." } }
```
**`GET /posts?workspaceId=&status=&format=&from=&to=`** · **`GET /posts/:id`** · **`PATCH /posts/:id`** (caption, template, goal, `status: "approved"`) · **`DELETE /posts/:id`** → `204` (409 if publishing).
**`POST /uploads`** — `{ "workspaceId", "contentType": "image/png", "bytes": 123456 }` → `200 { "key", "uploadUrl", "expiresAt" }` (presigned R2 PUT; max 20 MB images, 200 MB video).

**`POST /posts/:id/render`** — queue image/video render (Queue → Workflow → Container for video).
```json
// request
{ "kind": "image|video", "options": { "aspect": "9:16", "voice": "default", "captions": true, "motionClips": true } }
// 202
{ "job": { "id": "uuid", "kind": "render_video", "status": "queued", "createdAt": "..." } }
```
On success the post gets `mediaUrls` (signed R2 URLs, 1 h). On failure: `job.status = "failed"`, post shows "Render failed", and `{ "fallback": "image" }` is suggested.

**`POST /posts/:id/publish`**
```json
// request
{ "targets": [{ "socialAccountId": "uuid", "platform": "youtube" }], "when": "now | 2026-10-19T15:00:00Z" }
// 202
{ "jobs": [{ "id": "uuid", "kind": "publish", "status": "queued" }], "post": { "status": "scheduled" } }
```
Publish retries with backoff (3 attempts). Final failure → `post.status = "failed"`, calendar entry red, email sent, error code `social_reauth_required` or `upstream_failed`.

**`GET /jobs/:id`** → `200 { "job": Job }`.

### 4.6 Calendar
**`POST /calendar/generate`** — `{ "workspaceId", "startDate": "2026-10-19", "days": 30, "formats": ["video","text","text_image","image"], "platforms": ["youtube","x"], "postsPerDay": 1 }` → `202 { "job" }`; result: `{ "entries": [CalendarEntry] }`.
**`GET /calendar?workspaceId=&from=&to=`** → `200 { "entries": [{ "id", "postId", "scheduledAt", "platform", "format", "status", "goal" }] }`.
**`PATCH /calendar/:entryId`** — drag-and-drop: `{ "scheduledAt": "...", "platform": "x" }` → `200 { "entry" }` (409 if already published).

### 4.7 Monetization
**`POST /monetization/generate`** — `{ "workspaceId", "offerId": "uuid|null" }` → `200 { "plan": { "id", "steps": [{ "day": 1, "title", "actions": ["..."] }], "ctas": [{ "goal": "leads", "text": "..." }] } }`. Without an offer, generic CTAs plus a prompt to create one.

### 4.8 Autopilot
**`GET /autopilot?workspaceId=`** → `200 { "settings": { "enabled": true, "runTimeLocal": "07:00", "timezone": "America/Los_Angeles", "mode": "approve_first|auto_publish", "formats": ["text_image","video"], "platforms": ["youtube"] }, "nextRunAt": "..." }`
**`PUT /autopilot`** — full settings object; validates IANA timezone; `auto_publish` requires at least one connected account.

### 4.9 Social accounts
**`GET /social?workspaceId=`** → `200 { "accounts": [{ "id", "platform", "displayName", "status": "connected|expired", "expiresAt" }] }` (tokens never returned).
**`GET /social/:platform/connect?workspaceId=`** → `302` to the platform's OAuth (opened via `openExternalUrl` from the iframe). `state` is signed and stored in KV (10 min).
**`GET /social/:platform/callback`** → exchanges code, stores encrypted tokens, `302` back to the app with `?connected=youtube`.
**`DELETE /social/:id`** → `204` (revokes token where the platform supports it).

### 4.10 Owner dashboard (Whop company admin only)
**`GET /admin/members?cursor=`** → `{ data: [{ userId, name, tier, status, workspaces, lastActiveAt, usedMicro }], nextCursor }`
**`GET /admin/usage?from=&to=&groupBy=provider|user|day`** → `{ rows: [{ key, units, costMicro }], totalMicro }`
**`PUT /admin/plan-limits`** → `{ "tiers": { "trial": { "budgetMicro": 500000, "maxWorkspaces": 1, "videoPerMonth": 2 }, "starter": {...}, "pro": {...}, "agency": {...} }, "rateLimits": {...} }` → `200`.

## 5. Webhooks
### Inbound: Whop
**`POST /webhooks/whop`** — verified with `WHOP_WEBHOOK_SECRET` (signature header via `@whop/sdk`); invalid signature → `401`, no body processed. Handled idempotently by event ID (stored in KV 7 days); responds `200` fast and enqueues work.
| Event | Effect |
|---|---|
| `membership.went_valid` / created (incl. trial start) | Upsert `memberships`, set tier, initialize `usage_budgets` |
| `membership.went_invalid` / cancelled / expired | Mark inactive; pause autopilot; schedule data deletion at +30 days |
| plan/product changed | Update tier + entitlements |
| `payment.succeeded` / `payment.failed` | Update status (`past_due`), notify user |
(Event names to be confirmed against Whop's current webhook docs at build time.)

### Outbound: Realtime (no customer webhooks in v1)
Clients subscribe via Supabase Realtime to `render_jobs` and `publish_jobs` rows filtered by `owner_id`; RLS applies. Email notifications go out via Resend (see user-flow.md §8).

### Internal (not public)
Cron Triggers, Queue consumers and Workflows are invoked through Worker bindings, not HTTP. A manual trigger `POST /internal/autopilot/run` exists for ops only, protected by `CRON_SECRET` and blocked at the WAF for public traffic.
