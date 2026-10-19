import { JsonLd } from "@/components/marketing/json-ld";
import { PricingTable } from "@/components/marketing/pricing-table";
import { CtaLink, PageHeading } from "@/components/marketing/site-chrome";
import { breadcrumbJsonLd, softwareApplicationJsonLd } from "@/lib/json-ld";
import { pageMetadata } from "@/lib/marketing/metadata";
import { siteFacts } from "@/lib/site-facts";

export const metadata = pageMetadata("/pricing");

export default function PricingPage() {
  return (
    <>
      <JsonLd data={[softwareApplicationJsonLd(), breadcrumbJsonLd([{ name: "Pricing", path: "/pricing" }])]} />
      <PageHeading title="Pricing" lead={siteFacts.pricingLead} />
      <PricingTable />
      <p className="mt-6 text-3 text-gray-11">{siteFacts.trialNote}</p>
      <div className="mt-8">
        <CtaLink />
      </div>
    </>
  );
}
