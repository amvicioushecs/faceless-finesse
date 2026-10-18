import { FaqList } from "@/components/marketing/faq-list";
import { JsonLd } from "@/components/marketing/json-ld";
import { PageHeading } from "@/components/marketing/site-chrome";
import { breadcrumbJsonLd, faqPageJsonLd } from "@/lib/json-ld";
import { pageMetadata } from "@/lib/marketing/metadata";
import { siteFacts } from "@/lib/site-facts";

export const metadata = pageMetadata("/faq");

export default function FaqPage() {
  return (
    <>
      <JsonLd data={[faqPageJsonLd(), breadcrumbJsonLd([{ name: "FAQ", path: "/faq" }])]} />
      <PageHeading title="Frequently asked questions" />
      <FaqList entries={siteFacts.faq} />
    </>
  );
}
