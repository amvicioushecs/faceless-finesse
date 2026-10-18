# Third-Party Libraries & Services

> Faceless Finesse · Draft v1. Licenses are the packages' published licenses; recheck on install.

## App framework & UI
| Library | Purpose | License |
|---|---|---|
| next, react, react-dom, typescript | App framework | MIT / Apache-2.0 |
| @opennextjs/cloudflare, wrangler | Run Next.js on Cloudflare Workers | MIT / Apache-2.0 |
| @whop/react, @whop/sdk, @whop/iframe | Whop app shell, auth verification, API, iframe actions, checkout | Whop SDK terms |
| frosted-ui (via @whop/react) | Whop's design system | Whop |
| tailwindcss | Styling | MIT |
| react-hook-form, zod, @hookform/resolvers | Forms + validation | MIT |
| @tanstack/react-query | Server state | MIT |
| zustand | Global UI state | MIT |
| @dnd-kit/core | Calendar drag-and-drop | MIT |
| date-fns, date-fns-tz | Dates & timezones | MIT |
| lucide-react | Icons | ISC |

## Backend & data
| Library / service | Purpose |
|---|---|
| @supabase/supabase-js, Supabase CLI | Postgres, RLS, Realtime, migrations |
| Cloudflare R2, Queues, Cron Triggers, Workflows, KV, Containers, Workers AI | Storage, jobs, scheduling, cache, rendering, FLUX images |
| remotion, @remotion/renderer, FFmpeg | Video assembly in containers |
| satori, @resvg/resvg-wasm (or sharp in container) | Text-on-image rendering |
| googleapis (YouTube Data API v3) | YouTube uploads |
| Meta Graph API (fetch) | Facebook Page posts |
| twitter-api-v2 | X posting |
| resend | Email |
| @sentry/nextjs, @sentry/cloudflare | Error monitoring |
| zod-to-openapi | API docs |

## AI & data providers (via internal AI Gateway; see ai-model-options.md)
| Provider | Use |
|---|---|
| treg.to | Keyword volume, SERP, trends (server-side proxy) |
| Google Gemini API (3.1 Flash-Lite, Flash-Lite TTS, Nano Banana 2.1) | Text, voiceover, image posts |
| Groq (gpt-oss-120b) | Text fallback |
| Workers AI / fal.ai (FLUX.1 schnell) | Backgrounds & scene images |
| xAI (grok-imagine-video-1.5-lite) | Short motion clips |

## Testing & tooling
vitest, @testing-library/react, msw, @playwright/test, eslint, prettier, GitHub Actions, Dependabot.

## Security & compliance notes
- FLUX.1 schnell is Apache-2.0 (commercial OK); FLUX.2 [dev] is non-commercial, so avoid it.
- Gemini free tier may use data for training, so production uses the paid tier only.
- YouTube API audit, Meta app review, and X paid tier required for publishing; TikTok/Instagram need approval (phase 2).
- No card data handled (Whop); GDPR/CCPA deletion supported.
