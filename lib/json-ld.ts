import { absoluteUrl, type FaqEntry, isPlaceholder, siteFacts } from "./site-facts";

type JsonLd = Record<string, unknown>;

const ORG_ID = `${siteFacts.url}/#org`;
const FOUNDER_ID = `${siteFacts.url}/about#founder`;

export function organizationJsonLd(): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": ORG_ID,
    name: siteFacts.name,
    url: absoluteUrl("/"),
    logo: absoluteUrl(siteFacts.logoPath),
    email: siteFacts.email,
    description: siteFacts.description,
    founder: { "@id": FOUNDER_ID },
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer support",
      email: siteFacts.email,
      availableLanguage: "en",
    },
    ...(siteFacts.sameAs.length ? { sameAs: [...siteFacts.sameAs] } : {}),
  };
}

/**
 * SoftwareApplication. Offers are only emitted for tiers with a real price (we
 * never publish placeholder prices), and the checkout URL only once the Whop
 * store link is real. The trial is described in text: `eligibleDuration` would
 * mean the offer itself is only valid for 3 days.
 */
export function softwareApplicationJsonLd(): JsonLd {
  const storeUrl = isPlaceholder(siteFacts.whopStoreUrl) ? undefined : siteFacts.whopStoreUrl;
  const offers = siteFacts.tiers
    .filter((t) => t.priceUsdMonthly !== null)
    .map((t) => ({
      "@type": "Offer",
      name: t.name,
      price: String(t.priceUsdMonthly),
      priceCurrency: siteFacts.currency,
      description: `${t.summary} Billed monthly; starts with a ${siteFacts.trialLabel}.`,
      ...(storeUrl ? { url: storeUrl } : {}),
      availability: "https://schema.org/InStock",
    }));
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: siteFacts.name,
    applicationCategory: "BusinessApplication",
    applicationSubCategory: "AI content creation software",
    operatingSystem: "Web",
    url: absoluteUrl("/"),
    publisher: { "@id": ORG_ID },
    description: siteFacts.description,
    featureList: siteFacts.features.map((f) => f.name),
    ...(offers.length ? { offers } : {}),
  };
}

export function faqPageJsonLd(entries: readonly FaqEntry[] = siteFacts.faq): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: entries.map((e) => ({
      "@type": "Question",
      name: e.question,
      acceptedAnswer: { "@type": "Answer", text: e.answer },
    })),
  };
}

export function howToJsonLd(name: string, steps: readonly { name: string; text: string }[]): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name,
    step: steps.map((s, i) => ({ "@type": "HowToStep", position: i + 1, name: s.name, text: s.text })),
  };
}

export function breadcrumbJsonLd(crumbs: readonly { name: string; path: string }[]): JsonLd {
  const all = [{ name: "Home", path: "/" }, ...crumbs];
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: all.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: absoluteUrl(c.path),
    })),
  };
}

export function personJsonLd(): JsonLd {
  const f = siteFacts.founder;
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": FOUNDER_ID,
    name: f.name,
    jobTitle: f.jobTitle,
    worksFor: { "@id": ORG_ID },
    ...(f.bio ? { description: f.bio } : {}),
    ...(f.sameAs.length ? { sameAs: [...f.sameAs] } : {}),
  };
}

/**
 * Serialize for a <script type="application/ld+json"> tag. Escapes `<` so a
 * string value can never close the script element.
 */
export function serializeJsonLd(data: JsonLd | JsonLd[]): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
