# Testing Plan

> Faceless Finesse · Draft v1

| Layer | Tool | Covers |
|---|---|---|
| Unit | **Vitest** | Ease-to-Rank scoring, budget reservation, prompt builders, calendar generation, date/timezone logic, Zod schemas |
| Component | Vitest + Testing Library | Forms, NicheTree, Calendar drag-and-drop, Post Studio |
| Integration | Vitest + local Supabase + MSW (mocked Whop/treg/AI/social APIs) | API routes, **RLS policies** (user A can't read user B), Whop webhook handling, publish/render job state machines |
| End-to-end | **Playwright** on preview deploys | Welcome → quiz → niche → offer → ideas/scripts → post → calendar → autopilot → (sandbox) publish; trial expiry → paywall |
| Contract | Recorded fixtures for treg.to, Whop, YouTube, Meta, X | Catch upstream API changes |
| Manual / exploratory | Hector before each launch | Checklist: real Whop trial, real social accounts (test channels), mobile browser pass |

CI gates: all tests + lint + typecheck must pass before merge; E2E smoke on every preview and after production deploy. Coverage target ≥ 80% on core logic.
