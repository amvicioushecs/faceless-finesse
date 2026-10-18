import { Theme } from "@whop/react/components";
import { JsonLd } from "@/components/marketing/json-ld";
import { SiteFooter, SiteHeader } from "@/components/marketing/site-chrome";
import { organizationJsonLd } from "@/lib/json-ld";

// Public marketing site: statically generated HTML (aeo.md §8).
export const dynamic = "force-static";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <Theme>
      <JsonLd data={organizationJsonLd()} />
      <SiteHeader />
      <main id="main" className="mx-auto max-w-5xl px-4 py-10">
        {children}
      </main>
      <SiteFooter />
    </Theme>
  );
}
