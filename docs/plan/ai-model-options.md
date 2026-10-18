# AI Model Options & Pricing (researched 2026-10-18)

Prices from official pricing pages unless marked [3rd-party]/[unverified]. Recheck before launch; several Gemini prices change Dec 1, 2026 and Jan 1, 2027.

## Text
| Tier | Option | Price (per 1M tokens in / out) |
|---|---|---|
| Free | Gemini API free tier (Flash / Flash-Lite) | Free, low daily caps, Google may train on data |
| Free | Groq free tier (gpt-oss-120b/20b) | Free, 1,000 req/day |
| Free | Cloudflare Workers AI | 10K Neurons/day free |
| Budget | OpenAI gpt-6-luna | $0.10 / $0.50 |
| Budget | Claude Haiku 5.5 | $0.10 / $0.50 |
| Budget | Groq gpt-oss-120b | $0.15 / $0.60 |
| Budget | Gemini 3.1 Flash-Lite | $0.25 / $1.50 |
| Budget | DeepSeek flash (V4.1) | $0.30 / $1.20 (half off-peak) |
| Premium | Gemini 3.8 Flash | $0.75 / $3.75 (doubles Jan 2027) |
| Premium | xAI grok-4.3 / grok-4.7 | $1.25 / $2.50 · $2 / $6 |
| Premium | Claude Sonnet 5.5 · OpenAI gpt-6.1-sol | $2 / $10 |

## Images
| Tier | Option | Price |
|---|---|---|
| Free | FLUX.1 schnell (Apache 2.0) on Cloudflare | ~$0.0006/image, ~170/day free |
| Budget | MiniMax image-01 | $0.0035/image |
| Budget | fal.ai FLUX.1 schnell | ~$0.006 per vertical image |
| Budget | xAI grok-imagine-image | $0.02 |
| Budget | Nano Banana 2.1 (Google) | $0.0336 (good text rendering) |
| Premium | Nano Banana 2 / Pro | $0.067 / $0.134 |
| Premium | Luma uni-1-max · Ideogram v3 | $0.10 · $0.09 |
Tip: render quote-card text in code over AI backgrounds: exact text and essentially free.

## Video (per second; most models make 5–15s clips)
| Tier | Option | Price |
|---|---|---|
| Free (self-host) | Wan 2.2 (Apache 2.0), LTX-2.3 (free under $10M revenue) | GPU cost only |
| Budget | xAI grok-imagine-video-1.5-lite | $0.02 |
| Budget | MiniMax H3 Max Turbo (fal) | $0.025 |
| Budget | Luma Ray3.2 540p | ~$0.03 |
| Budget | Kling 2.6 720p | $0.042 |
| Budget | Veo 3.1 Lite 720p (with audio) · Runway gen4_turbo | $0.05 |
| Premium | Veo 3.1 Fast · Gemini Omni Flash | ~$0.10–0.12 |
| Premium | Kling 3.0 · Runway gen4.5 · Veo 3.1 Standard | $0.08–0.17 · $0.12 · $0.40 |
OpenAI Sora's API shut down Sept 24, 2026.

## Voiceover
| Tier | Option | Price |
|---|---|---|
| Free | Kokoro-82M (Apache 2.0, self-host), Gemini TTS free tier | Free |
| Budget | Gemini 3.8 Flash-Lite TTS | $0.0015 per 10s |
| Budget | OpenAI tts-1 · xAI TTS | $15 per 1M chars |
| Premium | ElevenLabs v4 | $0.08 per 1K chars |

## Recommended v1 stack (≈ $3–4 per user/month)
Assumes 60 text generations, 30 images, 10 short videos per user per month.
- Text: Gemini 3.1 Flash-Lite, fallback Groq gpt-oss-120b (~$0.17)
- Images: FLUX schnell backgrounds + code-rendered text; Nano Banana 2.1 for image posts (~$0.46)
- Video: AI scene images + ~10s Grok Imagine Video 1.5 Lite motion + voiceover, stitched with Remotion/FFmpeg (~$2.42)
- Voice: Gemini Flash-Lite TTS (~$0.07)
- Premium stack for comparison: ~$42 per user/month.
Build behind a provider-switching layer so models can be swapped as prices change.
