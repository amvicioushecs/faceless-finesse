import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { buildLlmsFullTxt, buildLlmsTxt, pricesSummary } from "@/lib/llms";
import { buildRobots, buildSitemap } from "@/lib/seo";
import { publishedPages, siteFacts } from "@/lib/site-facts";

const plan = (f: string) => readFileSync(new URL(`../../docs/plan/public/${f}`, import.meta.url), "utf8");

describe("llms.txt", () => {
  const txt = buildLlmsTxt();

  it("follows the llmstxt.org shape: H1, blockquote, sections", () => {
    const lines = txt.split("\n");
    expect(lines[0]).toBe("# Faceless Finesse");
    expect(lines[2].startsWith("> Faceless Finesse is an AI-guided web app")).toBe(true);
    for (const h of ["## Services", "## Pricing", "## FAQ", "## About", "## Contact", "## Optional"]) {
      expect(txt).toContain(h);
    }
  });

  it("matches the planned summary line", () => {
    const planned = plan("llms.txt").split("\n")[2];
    expect(txt.split("\n")[2]).toBe(planned);
  });

  it("only links to published pages", () => {
    const links = [...txt.matchAll(/\]\((https:\/\/facelessfinesse\.com[^)]*)\)/g)].map((m) => m[1]);
    const allowed = new Set([
      ...publishedPages().map((p) => (p.path === "/" ? `${siteFacts.url}/` : siteFacts.url + p.path)),
      `${siteFacts.url}/llms-full.txt`,
    ]);
    expect(links.length).toBeGreaterThan(5);
    for (const l of links) expect(allowed.has(l), l).toBe(true);
  });

  it("never prints the [PRICE] token", () => {
    expect(txt).not.toContain("[PRICE]");
    expect(buildLlmsFullTxt()).not.toContain("[PRICE]");
  });
});

describe("prices line", () => {
  it("lists only tiers with a real price", () => {
    const tiers = siteFacts.tiers.map((t) => ({ ...t }));
    expect(pricesSummary(tiers)).toBe("not published yet");
    tiers[1].priceUsdMonthly = 49;
    expect(pricesSummary(tiers)).toBe("Pro $49 per month");
    expect(pricesSummary(tiers)).not.toContain("not published");
  });
});

describe("llms-full.txt", () => {
  it("contains every FAQ question and answer and the contact facts", () => {
    const full = buildLlmsFullTxt();
    for (const f of siteFacts.faq) {
      expect(full).toContain(f.question);
      expect(full).toContain(f.answer);
    }
    expect(full).toContain(`Email: ${siteFacts.email}`);
  });

  it("keeps the same page sections as the planned file", () => {
    const headings = (s: string) => s.split("\n").filter((l) => l.startsWith("## "));
    expect(headings(buildLlmsFullTxt())).toEqual(headings(plan("llms-full.txt")));
  });
});

describe("robots + sitemap", () => {
  it("allows the same user agents as the planned robots.txt and blocks private paths", () => {
    const plannedAgents = [...plan("robots.txt").matchAll(/^User-agent: (.+)$/gm)].map((m) => m[1]);
    const rules = buildRobots().rules as Array<{ userAgent: string; allow: string; disallow: string[] }>;
    expect(rules.map((r) => r.userAgent)).toEqual(plannedAgents);
    for (const r of rules) {
      expect(r.allow).toBe("/");
      expect(r.disallow).toEqual(["/api/", "/experiences/", "/dashboard/"]);
    }
    expect(buildRobots().sitemap).toBe("https://facelessfinesse.com/sitemap.xml");
  });

  it("lists only published pages with a lastModified date", () => {
    const map = buildSitemap();
    expect(map.map((e) => e.url)).toEqual(
      publishedPages().map((p) => (p.path === "/" ? `${siteFacts.url}/` : siteFacts.url + p.path)),
    );
    expect(map.every((e) => /^\d{4}-\d{2}-\d{2}$/.test(String(e.lastModified)))).toBe(true);
  });
});
