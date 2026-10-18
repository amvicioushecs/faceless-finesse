import type { MetadataRoute } from "next";
import { absoluteUrl, publishedPages, siteFacts } from "./site-facts";

/** robots.txt: AI crawlers + default allowed on public pages; app/API disallowed (aeo.md §4). */
export function buildRobots(): MetadataRoute.Robots {
  const disallow = [...siteFacts.privatePaths];
  return {
    rules: [...siteFacts.allowedCrawlers, "*"].map((userAgent) => ({ userAgent, allow: "/", disallow })),
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}

/** sitemap.xml: published public pages only; lastmod = last content change. */
export function buildSitemap(): MetadataRoute.Sitemap {
  return publishedPages().map((p) => ({
    url: absoluteUrl(p.path),
    lastModified: p.lastModified,
    changeFrequency: "monthly",
    priority: p.path === "/" ? 1 : 0.7,
  }));
}
