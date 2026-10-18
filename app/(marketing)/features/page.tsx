import { JsonLd } from "@/components/marketing/json-ld";
import { PageHeading } from "@/components/marketing/site-chrome";
import { breadcrumbJsonLd } from "@/lib/json-ld";
import { pageMetadata } from "@/lib/marketing/metadata";
import { siteFacts } from "@/lib/site-facts";

export const metadata = pageMetadata("/features");

export default function FeaturesPage() {
  return (
    <>
      <JsonLd data={breadcrumbJsonLd([{ name: "Features", path: "/features" }])} />
      <PageHeading title="Features" lead={siteFacts.description} />
      <div className="grid gap-6 sm:grid-cols-2">
        {siteFacts.features.map((f) => (
          <section key={f.name}>
            <h2 className="text-5 font-semibold text-gray-12">{f.name}</h2>
            <p className="mt-1 text-3 text-gray-11">{f.text}</p>
          </section>
        ))}
      </div>
    </>
  );
}
