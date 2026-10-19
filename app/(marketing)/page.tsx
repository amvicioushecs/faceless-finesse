import Link from "next/link";
import { JsonLd } from "@/components/marketing/json-ld";
import { CtaLink } from "@/components/marketing/site-chrome";
import { softwareApplicationJsonLd } from "@/lib/json-ld";
import { pageMetadata } from "@/lib/marketing/metadata";
import { siteFacts } from "@/lib/site-facts";

export const metadata = pageMetadata("/");

export default function HomePage() {
  return (
    <>
      <JsonLd data={softwareApplicationJsonLd()} />
      <section className="py-8">
        <h1 className="text-9 font-bold text-gray-12">{siteFacts.name}</h1>
        <p className="mt-4 max-w-3xl text-5 text-gray-12">
          {siteFacts.descriptionSentence}
        </p>
        <p className="mt-3 max-w-3xl text-4 text-gray-11">{siteFacts.tagline}</p>
        <div className="mt-6 flex flex-wrap items-center gap-4">
          <CtaLink />
          <Link href="/how-it-works" className="text-3 text-accent-11 underline">
            See how it works
          </Link>
        </div>
      </section>

      <section className="mt-10 grid gap-10 sm:grid-cols-2">
        <div>
          <h2 className="text-6 font-bold text-gray-12">Who it&apos;s for</h2>
          <ul className="mt-3 list-disc pl-5 text-3 text-gray-11">
            {siteFacts.audience.map((a) => (
              <li key={a}>{a}</li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="text-6 font-bold text-gray-12">What you get in one guided flow</h2>
          <ul className="mt-3 list-disc pl-5 text-3 text-gray-11">
            {siteFacts.whatYouGet.map((w) => (
              <li key={w}>{w}</li>
            ))}
          </ul>
        </div>
      </section>

      <p className="mt-10 text-4 text-gray-12">{siteFacts.closingLine}</p>
    </>
  );
}
