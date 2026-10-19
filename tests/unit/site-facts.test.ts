import { describe, expect, it } from "vitest";
import { absoluteUrl, formatPrice, getPage, publishedPages, siteFacts } from "@/lib/site-facts";

describe("site-facts", () => {
  it("uses the exact one-sentence description from the AEO fact sheet", () => {
    expect(siteFacts.name).toBe("Faceless Finesse");
    expect(siteFacts.description).toBe(
      "An AI-guided web app that helps beginners and existing creators pick an easy-to-rank micro-niche, generate scripts, text/image/video posts, and auto-post to YouTube, Facebook and X on a 30-day calendar.",
    );
    expect(siteFacts.trialDays).toBe(3);
  });

  it("publishes the seven key public pages", () => {
    const paths = publishedPages().map((p) => p.path);
    for (const p of ["/", "/pricing", "/features", "/how-it-works", "/faq", "/about", "/contact"]) {
      expect(paths).toContain(p);
    }
  });

  it("has unique paths and unique titles", () => {
    const paths = siteFacts.pages.map((p) => p.path);
    const titles = siteFacts.pages.map((p) => p.title);
    expect(new Set(paths).size).toBe(paths.length);
    expect(new Set(titles).size).toBe(titles.length);
  });

  it("answers all six target AI questions in the FAQ", () => {
    const qs = siteFacts.faq.map((f) => f.question);
    expect(qs).toEqual(
      expect.arrayContaining([
        "How do I start a faceless YouTube channel?",
        "What's the best AI tool for faceless content?",
        "How do beginners pick a profitable niche?",
        "How do I make money with faceless content?",
        "What's an easy way to auto-post to YouTube, Facebook and X?",
        "Is there an alternative to hiring a content team for a faceless business?",
      ]),
    );
  });

  it("never contains placeholder price tokens, invented stats or ratings", () => {
    const text = JSON.stringify(siteFacts).toLowerCase();
    expect(text).not.toContain("[price]");
    const inventedStats = [
      /aggregaterating|testimonial|trusted by/,
      /\d[\d,.]*\s*[km]?\+?\s*(users|members|creators|customers|subscribers|channels)/, // "10K+ users"
      /\d(\.\d)?\s*(\/\s*5|stars?|★)/, // "4.8/5", "4.9 stars"
      /\d+(\.\d+)?\s*%\s*(of|more|increase|growth|retention)/, // "92% retention"
    ];
    for (const re of inventedStats) expect(text, String(re)).not.toMatch(re);
  });

  it("derives every trial mention from trialDays", () => {
    expect(siteFacts.trialLabel).toBe(`${siteFacts.trialDays}-day free trial`);
    for (const s of [
      siteFacts.pricingLead,
      siteFacts.closingLine,
      getPage("/pricing").description,
      siteFacts.faq.find((f) => f.question === "Is there a free trial?")?.answer ?? "",
    ]) {
      expect(s).toContain(siteFacts.trialLabel);
    }
    expect(siteFacts.descriptionSentence).toBe(`${siteFacts.name} is an ${siteFacts.description.slice(3)}`);
  });

  it("formats unset and set prices", () => {
    const tier = siteFacts.tiers[0];
    expect(formatPrice(tier)).toBe("Price not published yet");
    expect(formatPrice({ ...tier, priceUsdMonthly: 29 })).toBe("$29 per month");
    expect(formatPrice({ ...tier, priceUsdMonthly: 19.5 })).toBe("$19.50 per month");
  });

  it("builds canonical absolute URLs", () => {
    expect(absoluteUrl("/")).toBe("https://facelessfinesse.com/");
    expect(absoluteUrl("/faq")).toBe("https://facelessfinesse.com/faq");
    expect(absoluteUrl("faq")).toBe("https://facelessfinesse.com/faq");
    expect(() => getPage("/nope")).toThrow(/Unknown public page/);
  });
});
