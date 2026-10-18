# Frontend Documentation

> Faceless Finesse · Draft v1 · 2026-10-17

## 1. Surfaces
| Surface | Where it runs | Who | Purpose |
|---|---|---|---|
| **Member App** | Inside Whop (iframe), path `/experiences/[experienceId]` | Paying members | The guided flow + workspace |
| **Owner Dashboard** | Inside Whop, path `/dashboard/[companyId]` | Hector / business owner | Members, usage, costs, settings |
| **Discover page** | Inside Whop, path `/discover` | Prospects browsing Whop | App listing / pitch |
| **Public marketing site** | Own domain (PLACEHOLDER `facelessfinesse.com`) | Google, AI assistants, visitors | SEO/AEO, pricing, FAQ, links to Whop checkout |

## 2. Framework & Libraries
- **Next.js (App Router) + React + TypeScript**, started from Whop's official `whop-nextjs-app-template`.
- **`@whop/react`** for the Whop app shell, iframe SDK (`useIframeSdk`: open external links, in-app purchases) and `withWhopAppConfig` in `next.config.ts`.
- **UI library:** **Frosted UI** (Whop's design system) so the app looks native in Whop. Extra primitives only where Frosted lacks them.
- **Styling:** **Tailwind CSS** with Frosted UI tokens; light/dark follows the Whop theme.
- **Forms:** React Hook Form + Zod (shared schemas with the backend).
- **Calendar drag-and-drop:** dnd-kit.
- **Text-on-image editor/preview:** HTML/CSS templates previewed in-browser; final PNGs rendered server-side (see backend).

## 3. Navigation
- **No step counter.** The guided flow is implied by the UX: each screen ends in **one primary action** that opens the next screen (Niche → Offer → Ideas & Scripts → Post Studio → Calendar → Monetization Map → Autopilot → Connect Accounts).
- After onboarding, a **compact side menu**: Home (today's drafts), Studio, Calendar, Autopilot, Offer, Niches, Connected Accounts, Settings.
- Returning users land on **Home**, which shows the single most useful next action ("3 drafts ready to approve").

## 4. Screens & Key Components
| Screen | Key components | Notes |
|---|---|---|
| Onboarding quiz | `QuizStepper`, `ChoiceCard` | Goals, experience level, preferred platforms, time per week. 1 question per screen. |
| AI Niche & Micro-Niche Finder | `NicheTree`, `NicheCard` (Ease-to-Rank badge, volume, competition, intent), `DrillDownButton` | AI suggests niches → user drills to micro-niches; easiest wins sorted first; pick one. |
| Offer Builder | `OfferWizard`, `PriceSuggestion`, `SalesCopyEditor` | One painful problem → outline → price → sales copy. |
| Ideas & Script Studio | `IdeaGrid` (20 ideas), `ScriptEditor` (hook / body / CTA, 30s timer), `ViralLinkAnalyzer` | Paste a viral link/topic to model. |
| Post Studio | `FormatTabs` (Video script · Text · Text-on-image · Image), `TemplatePicker`, `CanvasPreview`, `CaptionEditor` | Brand colors/fonts/logo applied automatically. |
| 30-Day Calendar | `MonthCalendar` (drag-and-drop), `PostChip` (format icon + status), `GoalLane` (Trust / Leads / Sales) | Mixed formats. |
| Monetization Map | `ActionPlan` (5 steps / 30 days), `CTALibrary` | |
| Autopilot | `ScheduleForm` (time + timezone), `ModeToggle` (approve-first / auto-publish), `DraftQueue` | Approve-first is default. |
| Connected Accounts | `PlatformCard` (YouTube, Facebook Page, X; TikTok/Instagram "coming soon") | OAuth popups via `openExternalUrl` where iframe blocks it. |
| Settings | Brand kit, plan/usage meter (treg + AI credits), billing (opens Whop) | |
| Owner Dashboard | `MembersTable`, `UsageCostChart`, `PlanLimitsForm`, `AlertsFeed` | |

## 5. Forms (all React Hook Form + Zod)
1. Onboarding quiz
2. AI niche & micro-niche picking (filters: budget, platform, ease-to-rank threshold)
3. Offer details (problem, audience, format, price)
4. Brand kit (voice/tone, colors, fonts, logo upload)
5. Post editor (per format)
6. Autopilot schedule
7. Social account connections

## 6. State Management (summary; detailed in state-management.md)
- **Server state:** TanStack Query (React Query) for API data, caching, optimistic updates on the calendar.
- **Global UI state:** Zustand (current brand/workspace, editor UI state).
- **Local state:** React state + React Hook Form.
- **Server Actions** for simple mutations inside the Whop app.

## 7. Rendering Strategy & AEO
- **Member App / Owner Dashboard:** dynamic, authenticated, inside Whop; `noindex`.
- **Public marketing site:** **statically generated / server-rendered HTML** (many AI crawlers don't run JavaScript). Every business fact (name, what it does, pricing, FAQ) is in real HTML text, not images.
- **JSON-LD** injected per page in the Next.js `layout`/`page` metadata: `Organization`, `SoftwareApplication` + `Offer` (pricing), `FAQPage`, `BreadcrumbList`, `Article` for guides.
- Next.js Metadata API for titles, descriptions, canonical URLs, Open Graph/Twitter cards.
- `robots.txt`, `sitemap.xml`, `llms.txt`, `llms-full.txt` served from `/public` or generated route handlers (see aeo.md).

## 8. Accessibility & Responsiveness
- WCAG 2.2 AA: keyboard navigation, focus states, alt text on generated images, color-contrast checks on text-on-image templates.
- Responsive down to 375px (works in mobile browsers and the Whop mobile app's web view) until a native app exists.
