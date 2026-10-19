import { formatPrice, siteFacts, type Tier } from "@/lib/site-facts";

export function PricingTable({ tiers = siteFacts.tiers }: { tiers?: readonly Tier[] }) {
  return (
    <ul className="grid gap-4 sm:grid-cols-3">
      {tiers.map((t) => (
        <li key={t.id} className="rounded-xl border border-gray-a4 p-6">
          <h2 className="text-6 font-bold text-gray-12">{t.name}</h2>
          <p className="mt-2 text-4 text-gray-12" data-testid={`price-${t.id}`}>
            {formatPrice(t)}
          </p>
          <p className="mt-2 text-3 text-gray-11">{t.summary}</p>
          <p className="mt-4 text-2 text-gray-11">{siteFacts.trialLabel} through Whop.</p>
        </li>
      ))}
    </ul>
  );
}
