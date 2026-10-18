# Code Documentation, Security & Performance

> Faceless Finesse · Draft v1 · covers phases 9–11

## Documentation
- **Inline comments** on complex logic only (scoring, budgets, job pipelines, OAuth flows); TSDoc on exported functions.
- **API docs:** human reference in [api.md](api.md); OpenAPI 3.1 generated from Zod schemas (`zod-to-openapi`), served at `/api/docs` for admins.
- **README:** setup, env vars, Whop app setup, Cloudflare deploy, Supabase migrations, troubleshooting.
- **Architecture diagrams:** Mermaid in `docs/` (backend.md, user-flow.md, database-schema.md); updated in the same PR as changes.
- **ADRs:** short decision records in `docs/adr/` (e.g. Whop over Stripe, Cloudflare over Vercel).

## Security
- **Authentication:** Whop user token verified server-side on every request (signed JWT); no custom passwords.
- **Authorization:** roles `member`, `agency_seat`, `owner_admin`; Postgres RLS on every user table; server checks plan entitlements.
- **Encryption:** TLS everywhere; social OAuth tokens encrypted at rest (AES-256-GCM); Supabase encryption at rest; payments handled entirely by Whop (no card data touches the app).
- **Input validation:** Zod on all inputs; parameterized queries; sanitized rendered HTML/markdown; strict CSP compatible with the Whop iframe; SSRF protection on "paste a viral link" fetches (allowlisted domains, no private IPs).
- **Abuse & cost controls:** rate limits per user, atomic budget reservation before each AI/treg call, trial caps, webhook signature checks.
- **Secrets:** Cloudflare secrets only; rotated quarterly; dependency scanning (Dependabot) and secret scanning in CI.
- **Privacy:** data deletion on request and on Whop membership cancellation + 30 days.

## Performance
Moved to **[performance-optimization.md](performance-optimization.md)** (targets, frontend, public site, Workers/backend, rendering pipeline, monitoring). Headline targets: app interactive < 2.5 s on 4G; public pages LCP < 1.5 s; API p95 < 300 ms excluding generation.
