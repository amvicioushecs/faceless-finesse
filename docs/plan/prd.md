# Product Requirements Document (PRD)

> **Faceless Finesse** · Status: Draft v1 · Owner: Hector Verdugo · Last updated: 2026-10-18
> Runs inside the **Whop** ecosystem: a Whop App (Next.js + Frosted UI) embedded in a Whop, with Whop handling login, access and payments. Hosted on **Cloudflare**.

## 1. App Overview
- **Name:** Faceless Finesse (final)
- **Tagline:** "Your faceless content business, step by step."
- **One-sentence description:** An AI-guided web app that helps beginners and existing creators pick an easy-to-rank micro-niche, generate scripts, text/image/video posts, and auto-post to YouTube, Facebook and X on a 30-day calendar.
- **Description:** A web SaaS that turns the proven 7-step faceless-content playbook (niche → offer → ideas → scripts → calendar → daily autopilot → monetization) into a simple, guided pipeline. It researches niches and trends with live search data (treg.to), writes scripts and content plans with AI, renders text-on-image, image and short video posts, and posts to social platforms automatically, so a beginner can go from zero to a running faceless brand without guessing.
- **Domain / support email:** PLACEHOLDER `facelessfinesse.com` / `support@facelessfinesse.com` (not yet registered; see aeo.md "Placeholders to replace").

## 2. Problem
Faceless content businesses work, but today the process is scattered across prompts, docs, spreadsheets and a handful of tools. Beginners stall because there's no clear next step; existing creators lose hours stitching tools together. **The core pain is lack of simplicity.**

## 3. Target Audience & Personas
| Persona | Who | Goal | Pain |
|---|---|---|---|
| **Beginner Ben** | New to content, wants side income, no audience, camera-shy | Launch a first faceless channel and make first sales | Doesn't know where to start; overwhelmed by options |
| **Creator Carla** | Already posts, some audience, inconsistent income | Post consistently and monetize with her own digital product | Too much manual work; no system tying content to sales |

Both personas need: very clear steps, one obvious next action at a time, and output that's ready to use.

## 4. Platform
- **v1:** Responsive web app (desktop-first, works well on mobile browsers and the Whop mobile app's web view).
- **Later:** Native mobile app.

## 5. Key Features (priority order)
| # | Feature | Source prompt | Description | v1 |
|---|---|---|---|---|
| 0 | **Welcome screen + onboarding quiz** | (new) | A welcome screen shown before the quiz: an example niche → script → finished post and one "Get started" button. Then a short quiz (goals, experience, platforms, hours/week), one question per screen, skippable. | ✅ |
| 1 | **AI Niche & Micro-Niche Finder** | Niche Goldmine Finder | AI proposes evergreen, pain-driven niches (health, wealth, relationships), then drills each into **micro-niches** (e.g. fitness → home workouts → postpartum home workouts for busy moms). Every candidate is scored with treg.to keyword volume + SERP/competition data into an **Ease-to-Rank score** (demand vs. weak competition vs. buyer intent) so users see the easy wins first. User picks one. | ✅ |
| 2 | **Offer Builder** | Offer Creation System | Guides the user to a simple digital offer solving one painful problem: outline, pricing suggestion, and sales-page copy. | ✅ |
| 3 | **Ideas & Script Studio** | Viral Content Blueprint + Script Builder | Generates 20 faceless video ideas per niche, then 30-second scripts optimized for hook, watch time, emotion and CTA. Can study a pasted viral video link/topic. | ✅ |
| 4 | **30-Day Content Calendar** | 30-Day AI Content Planner | Builds a month of mixed-format posts (video, text, text-on-image, image) mapped to trust → leads → sales, editable drag-and-drop calendar. | ✅ |
| 5 | **Daily Autopilot** | Automation Command Center | Every morning at the user's chosen time: pulls trending topics (Google Trends / treg.to), writes an idea + script or a text/image post, renders media, and drafts a ready-to-post item for approval or auto-publish. | ✅ |
| 6 | **Monetization Map** | Monetization Map | A 5-step, 30-day action plan with proven content styles and CTAs that link content to the user's offer. | ✅ |
| 7 | **Post Studio (multi-format)** | (new) | Generates **text posts** (threads, captions), **text-on-image graphics** (quote cards, tip cards, carousels rendered from brand templates), **image posts** (AI-generated or uploaded images with captions) and **short videos** (see §5.1). Every format plugs into the calendar and autopilot. | ✅ |
| 8 | **Auto-Posting** | (new) | Connect social accounts; publish or schedule from the calendar. Failures auto-retry, then turn red on the calendar with an email and one-click Reconnect/Retry. | ✅ YouTube, Facebook Pages, X · ⏳ TikTok, Instagram (phase 2, need platform app approval) |

### 5.1 Video pipeline (in v1)
1. Script → scene list (AI text model).
2. **AI scene images** (FLUX.1 schnell on Workers AI / fal.ai; Nano Banana 2.1 where text in image matters).
3. **Short motion clips** for key scenes via **xAI `grok-imagine-video-1.5-lite`** (~10 s per video).
4. **Voiceover** via **Gemini Flash-Lite TTS**.
5. **Stitched with Remotion + FFmpeg in Cloudflare Containers**: captions, transitions, voiceover mix, vertical 9:16 export to R2.
6. Fallback: if render fails, the post can go out as an image/text post. Target cost per user/month in ai-model-options.md.

### Guided-path principle
The app is a **guided flow first, dashboard second**. There is no visible step counter; each screen simply ends in one obvious primary action that leads to the next, and every AI output is editable before it's used.

## 6. Monetization (of the SaaS itself)
- **Paywall & billing:** **Whop** (memberships, checkout, plan-based access, webhooks). No Stripe.
- **3-day free trial** through Whop checkout: full features with a reduced AI/treg spending cap; one trial per Whop account; reminder 24 h before it ends; paywall at expiry opens Whop checkout.
- Proposed tiers (prices TBD, PLACEHOLDER): Starter / Pro (more brands, autopilot, auto-posting, video) / Agency (multiple brands & seats).

## 7. Hosting & Infrastructure
- **Cloudflare Workers** running Next.js via **`@opennextjs/cloudflare`** (Whop app, owner dashboard, public marketing site).
- **R2** (media), **Queues** (render/publish fan-out), **Cron Triggers** (autopilot every 15 min), **Workflows** (multi-step retryable pipelines), **KV** (cache + rate limiting), **Containers** (Remotion + FFmpeg rendering), **Workers AI** (FLUX.1 schnell images).
- **Supabase** for Postgres, RLS and Realtime. Details in devops.md.

## 8. Integrations (v1)
- **treg.to:** keyword volume, Google SERP and trend data, called only through a server-side proxy with per-user spend caps and usage logging.
- **Whop:** auth-linked membership checks, checkout, trial, webhooks for plan changes.
- **AI:** Gemini 3.1 Flash-Lite (fallback Groq gpt-oss-120b) for text; FLUX.1 schnell + Nano Banana 2.1 for images; grok-imagine-video-1.5-lite for motion clips; Gemini Flash-Lite TTS for voice. See ai-model-options.md.
- **YouTube Data API, Meta Graph API (Facebook Pages), X API:** OAuth connect + publishing.
- **Resend** for email notifications.

## 9. Success Metrics
- **Activation:** % of new users who pick a niche, build an offer, generate scripts and fill a calendar within 7 days (target ≥ 40%).
- **Time to first post:** median < 30 minutes from first open.
- **Trial conversion:** 3-day trial → paid via Whop.
- **Consistency:** % of active users publishing ≥ 5 posts/week.
- **Revenue:** MRR; churn < 8%/month.
- **AI-referred traffic:** monthly visits to the marketing site referred by chatgpt.com, perplexity.ai, copilot.microsoft.com and gemini.google.com, plus a monthly prompt test of the target questions in aeo.md.

## 10. Timeline
**ASAP, built for production the first time.** No fixed date; quality bar is production-grade from v1 (auth, security rules, tests, CI, monitoring). Rough phasing:
1. Foundation: Whop auth + paywall + trial, treg.to proxy, data model, Cloudflare setup.
2. Welcome + quiz, niche, offer, ideas/scripts, calendar.
3. Post Studio incl. video pipeline, Daily Autopilot, Monetization Map.
4. Auto-posting to YouTube, Facebook, X.
5. Phase 2: TikTok + Instagram (after app approvals), mobile app.

## 11. Assumptions & Risks
| Risk | Impact | Mitigation |
|---|---|---|
| YouTube requires an API audit before uploads can be public (unaudited = private only) | Auto-post to YouTube limited at launch | Submit audit early; fall back to "download & post" |
| Meta app review for Facebook Page publishing | Delays FB auto-post | Start review in Foundation phase |
| X API is paid beyond a small free tier | Cost per user | Pass cost into Pro tier; rate-limit |
| treg.to, AI and video render costs per user | Margin | Per-user daily budgets, caching, plan limits, trial cap |
| AI output quality/originality | Trust, platform policy | Editable outputs, originality guidance, human-approve by default |
| Platform policies on automated/AI content | Account strikes | Approval step before publish; AI-content disclosure options |
| Cloudflare Containers cold starts for renders | Slower video drafts | Renders are async; autopilot runs ahead of the user's time |

## 12. Out of Scope (v1)
Native mobile app; TikTok/Instagram auto-posting. (Text, text-on-image, image **and video** posts are all in v1.)
