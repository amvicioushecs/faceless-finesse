import type { Metadata } from "next";
import { absoluteUrl, getPage, siteFacts } from "../site-facts";

/** Per-page metadata from site-facts: unique title/description + canonical URL. */
export function pageMetadata(path: string): Metadata {
  const page = getPage(path);
  const url = absoluteUrl(path);
  return {
    title: path === "/" ? { absolute: page.title } : page.title,
    description: page.description,
    alternates: { canonical: url },
    openGraph: { type: "website", title: page.title, description: page.description, url, siteName: siteFacts.name },
  };
}
