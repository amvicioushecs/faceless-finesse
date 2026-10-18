import Link from "next/link";
import { siteFacts } from "@/lib/site-facts";

const NAV = [
  { href: "/how-it-works", label: "How it works" },
  { href: "/features", label: "Features" },
  { href: "/pricing", label: "Pricing" },
  { href: "/faq", label: "FAQ" },
];

export function SiteHeader() {
  return (
    <header className="border-b border-gray-a4">
      <nav aria-label="Main" className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4">
        <Link href="/" className="text-5 font-bold text-gray-12">
          {siteFacts.name}
        </Link>
        <ul className="flex flex-wrap items-center gap-4 text-3 text-gray-11">
          {NAV.map((n) => (
            <li key={n.href}>
              <Link href={n.href} className="hover:text-gray-12">
                {n.label}
              </Link>
            </li>
          ))}
          <li>
            <CtaLink />
          </li>
        </ul>
      </nav>
    </header>
  );
}

export function CtaLink({ label = `Start your ${siteFacts.trialDays}-day free trial` }: { label?: string }) {
  return (
    <a
      href={siteFacts.whopStoreUrl}
      className="inline-block rounded-lg bg-accent-9 px-4 py-2 text-3 font-medium text-white hover:bg-accent-10"
    >
      {label}
    </a>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-gray-a4">
      <div className="mx-auto flex max-w-5xl flex-col gap-3 px-4 py-8 text-2 text-gray-11 sm:flex-row sm:justify-between">
        <p>
          © {new Date(siteFacts.lastUpdated).getFullYear()} {siteFacts.name}. {siteFacts.category}.
        </p>
        <ul className="flex flex-wrap gap-4">
          <li><Link href="/about">About</Link></li>
          <li><Link href="/contact">Contact</Link></li>
          <li><a href="/llms.txt">llms.txt</a></li>
          <li><a href={`mailto:${siteFacts.email}`}>{siteFacts.email}</a></li>
        </ul>
      </div>
    </footer>
  );
}

export function PageHeading({ title, lead }: { title: string; lead?: string }) {
  return (
    <div className="mb-8">
      <h1 className="text-8 font-bold text-gray-12">{title}</h1>
      {lead ? <p className="mt-3 max-w-3xl text-4 text-gray-11">{lead}</p> : null}
    </div>
  );
}
