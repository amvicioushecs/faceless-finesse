import { JsonLd } from "@/components/marketing/json-ld";
import { PageHeading } from "@/components/marketing/site-chrome";
import { breadcrumbJsonLd, personJsonLd } from "@/lib/json-ld";
import { pageMetadata } from "@/lib/marketing/metadata";
import { siteFacts } from "@/lib/site-facts";

export const metadata = pageMetadata("/about");

export default function AboutPage() {
  const { founder } = siteFacts;
  return (
    <>
      <JsonLd data={[personJsonLd(), breadcrumbJsonLd([{ name: "About", path: "/about" }])]} />
      <PageHeading title={`About ${siteFacts.name}`} lead={siteFacts.about} />
      <section id="founder">
        <h2 className="text-6 font-bold text-gray-12">Founder</h2>
        <p className="mt-2 text-3 text-gray-11">
          {founder.name}, {founder.jobTitle}.{founder.bio ? ` ${founder.bio}` : ""}
        </p>
      </section>
    </>
  );
}
