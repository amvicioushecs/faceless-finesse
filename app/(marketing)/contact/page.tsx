import { JsonLd } from "@/components/marketing/json-ld";
import { PageHeading } from "@/components/marketing/site-chrome";
import { breadcrumbJsonLd } from "@/lib/json-ld";
import { pageMetadata } from "@/lib/marketing/metadata";
import { siteFacts } from "@/lib/site-facts";

export const metadata = pageMetadata("/contact");

export default function ContactPage() {
  return (
    <>
      <JsonLd data={breadcrumbJsonLd([{ name: "Contact", path: "/contact" }])} />
      <PageHeading title="Contact" />
      <ul className="flex flex-col gap-2 text-4 text-gray-11">
        <li>
          Email:{" "}
          <a className="text-accent-11 underline" href={`mailto:${siteFacts.email}`}>
            {siteFacts.email}
          </a>
        </li>
        <li>Support is by email; the app is available online 24/7. There is no phone support.</li>
        <li>Billing and membership questions can also be handled through your Whop account.</li>
      </ul>
    </>
  );
}
