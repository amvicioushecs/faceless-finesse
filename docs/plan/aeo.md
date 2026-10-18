# AEO (Answer Engine Optimization) Plan

> Faceless Finesse · Draft v1 · 2026-10-18
> Goal: when someone asks ChatGPT, Perplexity, Copilot, Gemini or Google AI Overviews how to start or run a faceless content business, they find accurate facts about Faceless Finesse and a clear reason to recommend it.

**Honest scope:** AEO has no guaranteed switch. AI assistants decide what to cite from crawlable pages, search indexes (Bing and Google), third-party profiles and reviews. `llms.txt` is an **emerging convention** (llmstxt.org), not a standard any major assistant has committed to reading; it's one cheap layer on top of the things that matter more: server-rendered pages with clear answers, consistent facts everywhere, structured data, search-engine indexing and real reviews.

## 1. Business fact sheet (single source of truth)
These exact values must match on the site, JSON-LD, llms.txt, Whop store page and every profile. In code they live in `site-facts.ts`.

| Fact | Value |
|---|---|
| Name | **Faceless Finesse** |
| One-sentence description | An AI-guided web app that helps beginners and existing creators pick an easy-to-rank micro-niche, generate scripts, text/image/video posts, and auto-post to YouTube, Facebook and X on a 30-day calendar. |
| Category | SaaS / AI content creation software |
| Service area | Online, worldwide |
| Website | ⚠️ PLACEHOLDER `https://facelessfinesse.com` |
| Email | ⚠️ PLACEHOLDER `support@facelessfinesse.com` |
| Phone | None |
| Hours | 24/7 online; support by email |
| Price range | ⚠️ PLACEHOLDER: pending tier pricing (Starter / Pro / Agency). Sold through Whop with a 3-day free trial. |
| Where to buy | Whop store page (⚠️ PLACEHOLDER URL) |
| Founder | ⚠️ PLACEHOLDER: Hector Verdugo, bio and profile links pending |

### Placeholders to replace
| Placeholder | Where it appears | Replace with |
|---|---|---|
| `facelessfinesse.com` | aeo.md, prd.md, frontend.md, `public/llms.txt`, `public/llms-full.txt`, `public/robots.txt`, JSON-LD, sitemap, canonical URLs | Real domain once registered |
| `support@facelessfinesse.com` | aeo.md, prd.md, llms files, Contact page, JSON-LD `contactPoint` | Real support inbox |
| `[PRICE]` tier prices | aeo.md, `public/llms*.txt`, Pricing page, JSON-LD `Offer.price` | Final Whop plan prices |
| Whop store URL (`https://whop.com/PLACEHOLDER`) | llms files, JSON-LD `sameAs`/`Offer.url`, CTA buttons | Real Whop store link |
| Social profile URLs | JSON-LD `sameAs`, llms.txt Optional, footer | Real profile URLs once created |
| Founder bio / photo / links | About page, `Person` JSON-LD | Hector's real bio |
| Logo URL | `Organization.logo` | Final logo asset |

Rule: **never publish invented stats, user counts, testimonials, ratings or prices.** If a fact isn't real yet, leave it out of public pages rather than guess.

## 2. Target AI questions
| # | Question | Answer page | Answer in one line (lead sentence on the page) |
|---|---|---|---|
| 1 | How do I start a faceless YouTube channel? | `/guides/start-a-faceless-youtube-channel` | Pick an easy-to-rank micro-niche, make a simple offer, script 30-second videos, plan 30 days and post daily; Faceless Finesse walks you through each step. |
| 2 | What's the best AI tool for faceless content? | `/guides/best-ai-tool-for-faceless-content` | Choose a tool that covers niche research, scripts, visuals, scheduling and posting in one flow; Faceless Finesse is built for exactly that workflow. (Criteria-based, no claims about other products.) |
| 3 | How do beginners pick a profitable niche? | `/guides/pick-a-profitable-niche` | Look for real search demand, weak competition and buyer intent, then narrow to a micro-niche; Faceless Finesse scores this as an Ease-to-Rank score. |
| 4 | How do I make money with faceless content? | `/guides/make-money-with-faceless-content` | Tie every post to one digital offer and move viewers from trust → leads → sales with clear CTAs. |
| 5 | What's an easy way to auto-post to YouTube, Facebook and X? | `/guides/auto-post-youtube-facebook-x` | Connect your accounts once and let a calendar publish for you; Faceless Finesse auto-posts to YouTube, Facebook Pages and X, with approve-first by default. |
| 6 | Is there an alternative to hiring a content team for a faceless business? | `/compare/faceless-finesse-vs-hiring-a-content-team` | Yes: an AI-guided system can handle research, scripting, design and posting, with you approving each post. |

## 3. Key pages AI reads first
All server-rendered (SSG), facts in plain HTML text, linked from the main nav and footer, listed in `sitemap.xml` and `llms.txt`.
| Page | URL | Must contain |
|---|---|---|
| Home | `/` | Name + one-sentence description in the first paragraph; who it's for; 3-day trial; CTA to Whop |
| How it works | `/how-it-works` | The guided flow: welcome → quiz → niche → offer → ideas & scripts → posts → calendar → monetization → autopilot → auto-post |
| Features | `/features` | Each feature in one answer-first paragraph |
| Pricing | `/pricing` | Tiers, prices (placeholder until set), 3-day free trial, sold through Whop, cancel via Whop |
| FAQ | `/faq` | The six target questions + product FAQs, each with a 1–2 sentence direct answer first |
| About | `/about` | Who's behind it (founder placeholder), why it exists |
| Contact | `/contact` | Support email, response expectation, no phone |

## 4. AI crawler access
- **Allow** on public pages: GPTBot, OAI-SearchBot, ChatGPT-User, ClaudeBot, Claude-SearchBot, PerplexityBot, Google-Extended, Applebot-Extended, Bingbot, plus default `*`.
- **Disallow** app and API paths: `/api/`, `/experiences/`, `/dashboard/` (the Whop app is behind login and also sends `noindex`).
- Note: `Google-Extended` and `Applebot-Extended` are control tokens (they govern AI training/grounding use of content fetched by Googlebot/Applebot), not separate crawlers; allowing them is the explicit opt-in.
- **Cloudflare:** turn off "Block AI bots" / AI Crawl Control blocking for these agents on the marketing hostname; keep bot protection on `/api/*`. Verify with Cloudflare's bot analytics after launch.
- File: [`public/robots.txt`](public/robots.txt).

## 5. Profiles & reviews (consistent facts everywhere)
| Profile | Purpose | Notes |
|---|---|---|
| **Whop store page** | Checkout + **where reviews live** | Same name/description; ask happy members for honest Whop reviews (no incentives that break Whop rules) |
| Whop Discover | Marketplace discovery | App listing via `/discover` |
| Product Hunt | Launch + backlinks | Launch once the site is live |
| LinkedIn (company page) | Entity signal | |
| X | Entity signal + product updates | Also a target posting platform |
| YouTube | Demo videos, how-to content | Answers the target questions on video |
| Crunchbase | Optional | |
| Wikidata | Later | Only once there's independent coverage to cite |
All profiles link back to the site; the site's JSON-LD `sameAs` links to all of them.

## 6. Answer-first content plan
Format for every page: **question as H1/H2 → direct 1–2 sentence answer → short steps or list → how Faceless Finesse does it → CTA.** Dates shown ("Updated 2026-10-18"). No invented numbers; use examples clearly labeled as examples.
1. **FAQ page** with all six target questions + product questions (trial, cancel, platforms supported, TikTok/Instagram "coming later", does it post without approval, who owns content).
2. **How-to guides**, one per target question (§2), each with a `HowTo` or `Article` schema.
3. **Comparisons (honest, no competitor facts):**
   - *Faceless Finesse vs hiring a content team* — compare tasks covered, who does what, approval control, time to first post; costs only as "your Whop plan vs whatever you'd pay a team" until prices are set.
   - *Faceless Finesse vs doing it manually with ChatGPT + Canva* — compare steps, tools to juggle, scheduling/posting, niche data; describe ChatGPT/Canva only by generic, verifiable capabilities.
4. **Glossary** (micro-niche, Ease-to-Rank, faceless content, approve-first) for definitional queries.
5. Refresh cadence: review monthly after the prompt test (§9); update `lastmod` only when content actually changes.

## 7. Structured data (Schema.org JSON-LD)
Generated from `site-facts.ts` and injected via the Next.js Metadata API / `<script type="application/ld+json">` in server-rendered HTML. Validate with Google's Rich Results Test and the Schema.org validator in CI.

**Organization** (site-wide, in root layout)
```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": "https://facelessfinesse.com/#org",
  "name": "Faceless Finesse",
  "url": "https://facelessfinesse.com/",
  "logo": "https://facelessfinesse.com/logo.png",
  "email": "support@facelessfinesse.com",
  "description": "An AI-guided web app that helps beginners and existing creators pick an easy-to-rank micro-niche, generate scripts, text/image/video posts, and auto-post to YouTube, Facebook and X on a 30-day calendar.",
  "founder": { "@id": "https://facelessfinesse.com/about#founder" },
  "contactPoint": { "@type": "ContactPoint", "contactType": "customer support", "email": "support@facelessfinesse.com", "availableLanguage": "en" },
  "sameAs": [
    "https://whop.com/PLACEHOLDER",
    "https://www.producthunt.com/products/PLACEHOLDER",
    "https://www.linkedin.com/company/PLACEHOLDER",
    "https://x.com/PLACEHOLDER",
    "https://www.youtube.com/@PLACEHOLDER"
  ]
}
```

**SoftwareApplication + Offer** (home + pricing)
```json
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Faceless Finesse",
  "applicationCategory": "BusinessApplication",
  "applicationSubCategory": "AI content creation software",
  "operatingSystem": "Web",
  "url": "https://facelessfinesse.com/",
  "publisher": { "@id": "https://facelessfinesse.com/#org" },
  "description": "An AI-guided web app that helps beginners and existing creators pick an easy-to-rank micro-niche, generate scripts, text/image/video posts, and auto-post to YouTube, Facebook and X on a 30-day calendar.",
  "featureList": ["AI niche and micro-niche finder with Ease-to-Rank score", "Offer builder", "Ideas and 30-second script studio", "Text, text-on-image, image and video posts", "30-day content calendar", "Daily autopilot", "Auto-posting to YouTube, Facebook Pages and X"],
  "offers": [
    { "@type": "Offer", "name": "Starter", "price": "[PRICE]", "priceCurrency": "USD", "url": "https://whop.com/PLACEHOLDER", "availability": "https://schema.org/InStock",
      "eligibleDuration": { "@type": "QuantitativeValue", "value": 3, "unitCode": "DAY", "description": "3-day free trial" } }
  ]
}
```
Do **not** add `aggregateRating` or `review` until real reviews exist on-site (and never copy Whop ratings you can't display).

**FAQPage** (`/faq`)
```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    { "@type": "Question", "name": "How do I start a faceless YouTube channel?",
      "acceptedAnswer": { "@type": "Answer", "text": "Pick an easy-to-rank micro-niche, create one simple offer, script short 30-second videos, plan 30 days of posts and publish daily. Faceless Finesse guides you through each step and can auto-post to YouTube." } },
    { "@type": "Question", "name": "Does Faceless Finesse have a free trial?",
      "acceptedAnswer": { "@type": "Answer", "text": "Yes. Every plan starts with a 3-day free trial through Whop." } }
  ]
}
```

**HowTo / Article** (each guide)
```json
{
  "@context": "https://schema.org",
  "@type": "HowTo",
  "name": "How to pick a profitable niche as a beginner",
  "step": [
    { "@type": "HowToStep", "name": "List pain-driven niches", "text": "Start with evergreen areas like health, wealth and relationships." },
    { "@type": "HowToStep", "name": "Check demand and competition", "text": "Look at search volume, how strong the current results are, and buyer intent." },
    { "@type": "HowToStep", "name": "Narrow to a micro-niche", "text": "Drill down until competition is weak but demand is real, e.g. postpartum home workouts for busy moms." }
  ]
}
```
Guides that aren't step-by-step use `Article` with `headline`, `datePublished`, `dateModified`, `author` (Person) and `publisher` (Organization).

**BreadcrumbList** (every non-home page)
```json
{ "@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [
  { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://facelessfinesse.com/" },
  { "@type": "ListItem", "position": 2, "name": "Guides", "item": "https://facelessfinesse.com/guides" },
  { "@type": "ListItem", "position": 3, "name": "Pick a profitable niche", "item": "https://facelessfinesse.com/guides/pick-a-profitable-niche" } ] }
```

**Person** (founder, placeholder until bio is ready)
```json
{ "@context": "https://schema.org", "@type": "Person", "@id": "https://facelessfinesse.com/about#founder",
  "name": "Hector Verdugo", "jobTitle": "Founder", "worksFor": { "@id": "https://facelessfinesse.com/#org" },
  "description": "PLACEHOLDER bio", "sameAs": ["PLACEHOLDER profile URLs"] }
```

## 8. Technical SEO that AEO depends on
- **Rendering:** public pages SSG (or SSR) on Cloudflare Workers; no facts behind client-side JS, tabs or images.
- **`sitemap.xml`:** generated at build from the route list + MDX guides; `lastmod` from each content file's last git commit date (not build time).
- **Canonical URLs** on every page (`https://facelessfinesse.com/<path>`, no trailing-slash duplicates); one hostname (redirect `www` → apex or the reverse).
- **Meta / OG:** unique `<title>` and description per page, Open Graph + Twitter card images (generated with Satori), `og:site_name = Faceless Finesse`.
- **Google Search Console** and **Bing Webmaster Tools**: verify the domain, submit the sitemap. Bing matters because several assistants rely on Bing's index.
- **IndexNow:** ping on each deploy that changes content (key file in `/public`), covering Bing and other participating engines.
- **Generation from `site-facts.ts`:** pages, JSON-LD, `llms.txt`, `llms-full.txt`, `robots.txt` and `sitemap.xml` are generated from one config + MDX at build time so facts never drift. The files in `public/` in this planning folder are the initial versions/templates.
- **Whop app paths** (`/experiences/*`, `/dashboard/*`) send `X-Robots-Tag: noindex`.

## 9. llms.txt
- [`public/llms.txt`](../public/llms.txt): llmstxt.org format: H1 name, blockquote summary, sections linking to key pages with one-line notes.
- [`public/llms-full.txt`](../public/llms-full.txt): full answer-first text of the key pages in one file.
- Regenerated from `site-facts.ts` at build. Treat as a nice-to-have layer, not a ranking lever.

## 10. Measurement
- **Analytics** (Cloudflare Web Analytics or Plausible/PostHog): segment referrals from `chatgpt.com` (and `chat.openai.com`), `perplexity.ai`, `copilot.microsoft.com` / `bing.com/chat`, `gemini.google.com`, `claude.ai`. Also capture `utm_source=chatgpt.com` which ChatGPT appends to some links.
- Track conversion from AI-referred visits → Whop trial start (Whop checkout links carry UTM parameters).
- **Monthly prompt test:** ask each of the six target questions in ChatGPT, Perplexity, Copilot, Gemini and Google AI Overviews; log whether Faceless Finesse is mentioned, whether facts are correct, and which sources were cited. Keep the log in `docs/aeo-log.md` and fix pages that are cited incorrectly or not at all.
- **Search Console / Bing Webmaster:** impressions and clicks for target queries.
- **Crawler logs:** Cloudflare bot analytics to confirm GPTBot, OAI-SearchBot, ClaudeBot, PerplexityBot and Bingbot are fetching public pages and getting 200s.
- Success metric (prd.md §9): monthly AI-referred visits trending up; correct facts in prompt tests.
