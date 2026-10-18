/**
 * Single source of truth for every public business fact.
 *
 * Public pages, JSON-LD, sitemap.xml, robots.txt, llms.txt and llms-full.txt are
 * all generated from this file so facts never drift (docs/plan/aeo.md §1, §8).
 *
 * Rule: never publish invented stats, user counts, testimonials, ratings or prices.
 * Values marked `placeholder: true` (or `null`) are not final and must be replaced
 * before launch. Unset prices are rendered as "not published yet" and are omitted
 * from JSON-LD.
 */

export type Tier = {
  id: "starter" | "pro" | "agency";
  name: string;
  /** Monthly price in USD. `null` until the real Whop plan price is set. */
  priceUsdMonthly: number | null;
  summary: string;
  /** Whop plan ID (plan_...) used for checkout + entitlement mapping. */
  whopPlanId: string | null;
};

export type FaqEntry = { question: string; answer: string };

export type PublicPage = {
  path: string;
  title: string;
  /** Short description used for <meta name="description"> and llms.txt. */
  description: string;
  /** Section heading in llms.txt. */
  llmsSection: "Services" | "Pricing" | "FAQ" | "About" | "Contact" | "Optional";
  /** Only published pages are linked from the sitemap and llms files. */
  published: boolean;
  /** Last content change (ISO date). Bump only when content actually changes. */
  lastModified: string;
};

export const siteFacts = {
  name: "Faceless Finesse",
  description:
    "An AI-guided web app that helps beginners and existing creators pick an easy-to-rank micro-niche, generate scripts, text/image/video posts, and auto-post to YouTube, Facebook and X on a 30-day calendar.",
  /** Sentence form used in the first paragraph of the home page and llms.txt. */
  tagline:
    "Faceless Finesse helps you build a faceless content business step by step, without showing your face and without stitching together a pile of tools.",
  category: "SaaS / AI content creation software",
  serviceArea: "Online, worldwide",
  /** PLACEHOLDER: domain is not registered yet. */
  url: "https://facelessfinesse.com",
  /** PLACEHOLDER: support inbox not created yet. */
  email: "support@facelessfinesse.com",
  phone: null as string | null,
  hours: "Online 24/7; support by email",
  trialDays: 3,
  currency: "USD",
  /** PLACEHOLDER: real Whop store URL. */
  whopStoreUrl: "https://whop.com/PLACEHOLDER",
  /** PLACEHOLDER: logo asset not designed yet. */
  logoPath: "/logo.png",
  founder: {
    name: "Hector Verdugo",
    jobTitle: "Founder",
    /** PLACEHOLDER: bio pending. */
    bio: null as string | null,
    sameAs: [] as string[],
  },
  /** Social/profile URLs for JSON-LD `sameAs`. Only real URLs belong here. */
  sameAs: [] as string[],
  placeholders: [
    "url",
    "email",
    "whopStoreUrl",
    "logoPath",
    "founder.bio",
    "tiers[].priceUsdMonthly",
    "tiers[].whopPlanId",
  ],
  lastUpdated: "2026-10-18",
  audience: [
    "Beginners who want to start a faceless channel but don't know where to begin.",
    "Existing creators who want to post consistently and connect their content to sales.",
  ],
  whatYouGet: [
    "An easy-to-rank micro-niche, chosen with real search data.",
    "A simple digital offer to sell.",
    "Content ideas and 30-second scripts.",
    "Ready-to-post text, text-on-image, image and short video posts.",
    "A 30-day content calendar.",
    "Daily autopilot that drafts a new post every morning.",
    "Auto-posting to YouTube, Facebook Pages and X.",
  ],
  platforms: {
    live: ["YouTube", "Facebook Pages", "X"],
    planned: ["TikTok", "Instagram"],
  },
  features: [
    {
      name: "AI niche and micro-niche finder",
      text: "Suggests niches and narrower micro-niches and scores each with live keyword and search-result data into an Ease-to-Rank score.",
    },
    {
      name: "Offer builder",
      text: "Helps you create one simple digital offer with an outline, price suggestion and sales copy.",
    },
    {
      name: "Ideas and script studio",
      text: "Generates 20 ideas per niche and 30-second scripts focused on hook, watch time, emotion and call to action.",
    },
    {
      name: "Post studio",
      text: "Creates text posts, text-on-image graphics (quote cards, tip cards, carousels) in your brand colors and fonts, image posts, and short vertical videos with voiceover and captions. Everything is editable.",
    },
    {
      name: "30-day content calendar",
      text: "A month of mixed-format posts mapped to trust, leads and sales.",
    },
    {
      name: "Daily autopilot",
      text: "Pulls trending topics in your niche each morning and drafts a ready-to-post item.",
    },
    {
      name: "Auto-posting",
      text: "Publish or schedule to YouTube, Facebook Pages and X. TikTok and Instagram are planned for later.",
    },
    {
      name: "Monetization map",
      text: "A 5-step, 30-day plan linking your content to your offer.",
    },
    {
      name: "Runs inside Whop",
      text: "Log in, pay and manage your membership with your Whop account.",
    },
  ],
  howItWorks: [
    { name: "Welcome", text: "See an example of a niche turned into a script and a finished post." },
    {
      name: "Short quiz",
      text: "Your goals, experience, preferred platforms and hours per week, one question per screen. You can skip it.",
    },
    {
      name: "Pick a niche",
      text: "AI suggests evergreen, pain-driven niches and drills them into micro-niches (for example: fitness → home workouts → postpartum home workouts for busy moms). Each is scored for demand, competition and buyer intent as an Ease-to-Rank score, so the easiest wins show first.",
    },
    {
      name: "Build an offer",
      text: "One painful problem, an outline, a suggested price and sales copy. Already have an offer? Add it and skip ahead.",
    },
    {
      name: "Ideas and scripts",
      text: "20 faceless content ideas, then 30-second scripts with a hook, body and call to action. You can paste a viral video link or topic to model.",
    },
    {
      name: "Make posts",
      text: "Turn scripts into text posts, text-on-image graphics, image posts or short videos (AI scene images, short motion clips and AI voiceover, assembled automatically).",
    },
    {
      name: "Plan your month",
      text: "A 30-day calendar mixing formats and moving your audience from trust to leads to sales. Drag and drop to reschedule.",
    },
    {
      name: "Monetization map",
      text: "A 5-step, 30-day action plan with calls to action that point to your offer.",
    },
    {
      name: "Autopilot",
      text: "Choose a time and timezone. Every morning a new draft is ready. Approve-first is the default; auto-publish is optional.",
    },
    {
      name: "Auto-post",
      text: "Connect YouTube, a Facebook Page and X once. Posts publish on schedule. If a post fails, it retries automatically, then shows in red on the calendar and you get an email with a one-click Reconnect and Retry.",
    },
  ],
  tiers: [
    {
      id: "starter",
      name: "Starter",
      priceUsdMonthly: null,
      summary: "The full guided flow for one brand.",
      whopPlanId: null,
    },
    {
      id: "pro",
      name: "Pro",
      priceUsdMonthly: null,
      summary: "Adds more brands, autopilot, auto-posting and video.",
      whopPlanId: null,
    },
    {
      id: "agency",
      name: "Agency",
      priceUsdMonthly: null,
      summary: "Multiple brands and team seats.",
      whopPlanId: null,
    },
  ] satisfies Tier[] as Tier[],
  trialNote:
    "The free trial includes the full guided flow with a reduced AI usage limit. One trial per Whop account.",
  about:
    "Faceless Finesse exists because building a faceless content business is usually scattered across prompts, documents, spreadsheets and many tools, and beginners stall without a clear next step. Faceless Finesse puts the whole process into one simple, guided flow.",
  faq: [
    {
      question: "How do I start a faceless YouTube channel?",
      answer:
        "Pick an easy-to-rank micro-niche, create one simple offer, script short 30-second videos, plan 30 days of posts and publish every day. Faceless Finesse guides you through each of these steps and can auto-post your videos to YouTube.",
    },
    {
      question: "What's the best AI tool for faceless content?",
      answer:
        "Look for a tool that covers the whole workflow: niche research with real search data, scripts, visuals, a content calendar and automatic posting, with you approving each post. Faceless Finesse is built to do all of these in one guided flow.",
    },
    {
      question: "How do beginners pick a profitable niche?",
      answer:
        "Choose a niche with real search demand, weak competition and buyers who spend money, then narrow it to a specific micro-niche. Faceless Finesse checks demand and competition with live search data and ranks options by an Ease-to-Rank score.",
    },
    {
      question: "How do I make money with faceless content?",
      answer:
        "Connect your content to one simple digital offer and use posts that build trust, then capture leads, then make sales, each with a clear call to action. Faceless Finesse helps you build the offer and a 30-day monetization plan.",
    },
    {
      question: "What's an easy way to auto-post to YouTube, Facebook and X?",
      answer:
        "Connect your accounts once and schedule posts from a calendar. Faceless Finesse auto-posts to YouTube, Facebook Pages and X, asks for your approval first by default, and retries and alerts you if a post fails.",
    },
    {
      question: "Is there an alternative to hiring a content team for a faceless business?",
      answer:
        "Yes. An AI-guided system can handle niche research, scripting, design, scheduling and posting while you review and approve. Faceless Finesse is designed to be that system for one person.",
    },
    { question: "Is there a free trial?", answer: "Yes, every plan starts with a 3-day free trial through Whop." },
    {
      question: "Do I need to show my face?",
      answer:
        "No. Faceless Finesse creates faceless formats: text posts, graphics, images and videos with AI visuals and voiceover.",
    },
    {
      question: "Does it post without my approval?",
      answer: "Only if you turn on auto-publish. Approve-first is the default.",
    },
    {
      question: "Which platforms does it support?",
      answer: "YouTube, Facebook Pages and X today. TikTok and Instagram are planned for later.",
    },
    { question: "How do I cancel?", answer: "Cancel anytime from your Whop account." },
  ] satisfies FaqEntry[] as FaqEntry[],
  pages: [
    {
      path: "/",
      title: "Faceless Finesse: AI-guided faceless content business app",
      description:
        "Pick an easy-to-rank micro-niche, generate scripts and posts, and auto-post to YouTube, Facebook and X on a 30-day calendar.",
      llmsSection: "Services",
      published: true,
      lastModified: "2026-10-18",
    },
    {
      path: "/how-it-works",
      title: "How it works",
      description:
        "The guided flow from welcome screen and short quiz to niche, offer, scripts, posts, calendar, monetization map, autopilot and auto-posting.",
      llmsSection: "Services",
      published: true,
      lastModified: "2026-10-18",
    },
    {
      path: "/features",
      title: "Features",
      description:
        "AI niche and micro-niche finder with Ease-to-Rank score, offer builder, idea and 30-second script studio, text/text-on-image/image/video posts, 30-day calendar, daily autopilot, auto-posting.",
      llmsSection: "Services",
      published: true,
      lastModified: "2026-10-18",
    },
    {
      path: "/guides/start-a-faceless-youtube-channel",
      title: "Start a faceless YouTube channel",
      description: "Step-by-step guide for beginners.",
      llmsSection: "Services",
      published: false,
      lastModified: "2026-10-18",
    },
    {
      path: "/guides/pick-a-profitable-niche",
      title: "Pick a profitable niche",
      description:
        "How to find demand, weak competition and buyer intent, then narrow to a micro-niche.",
      llmsSection: "Services",
      published: false,
      lastModified: "2026-10-18",
    },
    {
      path: "/guides/auto-post-youtube-facebook-x",
      title: "Auto-post to YouTube, Facebook and X",
      description: "Connect accounts once and publish from a calendar, approve-first by default.",
      llmsSection: "Services",
      published: false,
      lastModified: "2026-10-18",
    },
    {
      path: "/pricing",
      title: "Pricing",
      description:
        "Starter, Pro and Agency plans sold through Whop; every plan starts with a 3-day free trial.",
      llmsSection: "Pricing",
      published: true,
      lastModified: "2026-10-18",
    },
    {
      path: "/faq",
      title: "FAQ",
      description:
        "Direct answers on starting a faceless channel, picking a niche, making money with faceless content, auto-posting, the free trial and cancelling.",
      llmsSection: "FAQ",
      published: true,
      lastModified: "2026-10-18",
    },
    {
      path: "/guides/make-money-with-faceless-content",
      title: "Make money with faceless content",
      description:
        "Tie posts to one digital offer and move viewers from trust to leads to sales.",
      llmsSection: "FAQ",
      published: false,
      lastModified: "2026-10-18",
    },
    {
      path: "/guides/best-ai-tool-for-faceless-content",
      title: "Best AI tool for faceless content",
      description:
        "What to look for in a faceless content tool and how Faceless Finesse covers it.",
      llmsSection: "FAQ",
      published: false,
      lastModified: "2026-10-18",
    },
    {
      path: "/about",
      title: "About",
      description:
        "Who builds Faceless Finesse and why: simplicity for people starting or growing a faceless content business.",
      llmsSection: "About",
      published: true,
      lastModified: "2026-10-18",
    },
    {
      path: "/contact",
      title: "Contact",
      description: "Support by email; online 24/7; no phone support.",
      llmsSection: "Contact",
      published: true,
      lastModified: "2026-10-18",
    },
    {
      path: "/compare/faceless-finesse-vs-hiring-a-content-team",
      title: "Faceless Finesse vs hiring a content team",
      description: "What an AI-guided system covers compared with a hired team.",
      llmsSection: "Optional",
      published: false,
      lastModified: "2026-10-18",
    },
    {
      path: "/compare/faceless-finesse-vs-chatgpt-canva",
      title: "Faceless Finesse vs ChatGPT + Canva",
      description: "One guided flow versus juggling separate tools manually.",
      llmsSection: "Optional",
      published: false,
      lastModified: "2026-10-18",
    },
  ] satisfies PublicPage[] as PublicPage[],
  /** Crawlers explicitly allowed on public pages (aeo.md §4). */
  allowedCrawlers: [
    "GPTBot",
    "OAI-SearchBot",
    "ChatGPT-User",
    "ClaudeBot",
    "Claude-SearchBot",
    "PerplexityBot",
    "Google-Extended",
    "Applebot-Extended",
    "Bingbot",
  ],
  /** Private paths (Whop app + API). Also sent `X-Robots-Tag: noindex`. */
  privatePaths: ["/api/", "/experiences/", "/dashboard/"],
} as const;

export type SiteFacts = typeof siteFacts;

export function absoluteUrl(path: string): string {
  if (path === "/") return `${siteFacts.url}/`;
  return `${siteFacts.url}${path.startsWith("/") ? path : `/${path}`}`;
}

export function publishedPages(): PublicPage[] {
  return siteFacts.pages.filter((p) => p.published);
}

export function getPage(path: string): PublicPage {
  const page = siteFacts.pages.find((p) => p.path === path);
  if (!page) throw new Error(`Unknown public page: ${path}`);
  return page;
}

export function formatPrice(tier: Tier): string {
  return tier.priceUsdMonthly === null
    ? "Price not published yet"
    : `$${tier.priceUsdMonthly.toFixed(2).replace(/\.00$/, "")} per month`;
}
