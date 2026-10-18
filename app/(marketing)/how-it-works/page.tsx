import { JsonLd } from "@/components/marketing/json-ld";
import { CtaLink, PageHeading } from "@/components/marketing/site-chrome";
import { breadcrumbJsonLd, howToJsonLd } from "@/lib/json-ld";
import { pageMetadata } from "@/lib/marketing/metadata";
import { siteFacts } from "@/lib/site-facts";

export const metadata = pageMetadata("/how-it-works");

export default function HowItWorksPage() {
  return (
    <>
      <JsonLd
        data={[
          howToJsonLd(`How to build a faceless content business with ${siteFacts.name}`, siteFacts.howItWorks),
          breadcrumbJsonLd([{ name: "How it works", path: "/how-it-works" }]),
        ]}
      />
      <PageHeading
        title="How it works"
        lead={`${siteFacts.name} walks you from a welcome screen to auto-posting in one guided flow, with one clear next step on every screen.`}
      />
      <ol className="flex flex-col gap-5">
        {siteFacts.howItWorks.map((s, i) => (
          <li key={s.name}>
            <h2 className="text-5 font-semibold text-gray-12">
              {i + 1}. {s.name}
            </h2>
            <p className="mt-1 text-3 text-gray-11">{s.text}</p>
          </li>
        ))}
      </ol>
      <div className="mt-10">
        <CtaLink />
      </div>
    </>
  );
}
