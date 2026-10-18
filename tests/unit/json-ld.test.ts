import { describe, expect, it, vi } from "vitest";
import {
  breadcrumbJsonLd,
  faqPageJsonLd,
  organizationJsonLd,
  personJsonLd,
  serializeJsonLd,
  softwareApplicationJsonLd,
} from "@/lib/json-ld";
import { siteFacts } from "@/lib/site-facts";

describe("JSON-LD", () => {
  it("Organization carries the shared facts and contact point", () => {
    const org = organizationJsonLd();
    expect(org).toMatchObject({
      "@context": "https://schema.org",
      "@type": "Organization",
      "@id": "https://facelessfinesse.com/#org",
      name: siteFacts.name,
      url: "https://facelessfinesse.com/",
      email: siteFacts.email,
      description: siteFacts.description,
      contactPoint: { "@type": "ContactPoint", email: siteFacts.email },
    });
    // No placeholder profile URLs in sameAs until real ones exist.
    expect(org.sameAs).toBeUndefined();
  });

  it("SoftwareApplication omits offers while prices are unset", () => {
    const app = softwareApplicationJsonLd();
    expect(app["@type"]).toBe("SoftwareApplication");
    expect(app.offers).toBeUndefined();
    expect(app.featureList).toHaveLength(siteFacts.features.length);
    expect(JSON.stringify(app)).not.toContain("PRICE");
  });

  it("SoftwareApplication emits a priced Offer with the 3-day trial once a price is set", async () => {
    vi.resetModules();
    const facts = await import("@/lib/site-facts");
    const original = facts.siteFacts.tiers[1].priceUsdMonthly;
    facts.siteFacts.tiers[1].priceUsdMonthly = 49;
    try {
      const { softwareApplicationJsonLd: build } = await import("@/lib/json-ld");
      const offers = build().offers as Array<Record<string, unknown>>;
      expect(offers).toHaveLength(1);
      expect(offers[0]).toMatchObject({
        "@type": "Offer",
        name: "Pro",
        price: "49",
        priceCurrency: "USD",
        eligibleDuration: { value: 3, unitCode: "DAY" },
      });
    } finally {
      facts.siteFacts.tiers[1].priceUsdMonthly = original;
    }
  });

  it("FAQPage mirrors every FAQ entry", () => {
    const faq = faqPageJsonLd() as { mainEntity: Array<{ name: string; acceptedAnswer: { text: string } }> };
    expect(faq.mainEntity).toHaveLength(siteFacts.faq.length);
    expect(faq.mainEntity[0].name).toBe(siteFacts.faq[0].question);
    expect(faq.mainEntity[0].acceptedAnswer.text).toBe(siteFacts.faq[0].answer);
  });

  it("BreadcrumbList starts at Home with absolute URLs", () => {
    const crumbs = breadcrumbJsonLd([{ name: "FAQ", path: "/faq" }]) as {
      itemListElement: Array<{ position: number; item: string }>;
    };
    expect(crumbs.itemListElement.map((c) => [c.position, c.item])).toEqual([
      [1, "https://facelessfinesse.com/"],
      [2, "https://facelessfinesse.com/faq"],
    ]);
  });

  it("Person omits the bio until it is written", () => {
    expect(personJsonLd()).not.toHaveProperty("description");
  });

  it("serializes safely inside a script tag", () => {
    const out = serializeJsonLd({ text: "</script><script>alert(1)</script>" });
    expect(out).not.toContain("</script>");
    expect(JSON.parse(out)).toEqual({ text: "</script><script>alert(1)</script>" });
  });
});
