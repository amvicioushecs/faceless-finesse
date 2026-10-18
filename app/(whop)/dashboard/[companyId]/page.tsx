import { AccessGate } from "@/components/app/access-gate";
import { guard } from "@/lib/auth/guard";
import { siteFacts } from "@/lib/site-facts";

const PANELS = [
  { title: "Members", body: "Trials, active members and plan tiers synced from Whop webhooks." },
  { title: "Usage & costs", body: "AI, treg.to and render spend per member from the usage ledger." },
  { title: "Plan limits", body: "Monthly budgets per tier, enforced before every paid call." },
  { title: "Alerts", body: "Failed publishes/renders, expiring social tokens and cost thresholds." },
];

export default async function DashboardPage({ params }: { params: Promise<{ companyId: string }> }) {
  const { companyId } = await params;
  const auth = await guard("company", companyId);
  if (!auth.ok) return <AccessGate failure={auth} surface="owner" />;
  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 p-8">
      <h1 className="text-8 font-bold text-gray-12">{siteFacts.name} owner dashboard</h1>
      {/* PLACEHOLDER panels: real data arrives in stage 6. */}
      <div className="grid gap-4 sm:grid-cols-2">
        {PANELS.map((p) => (
          <section key={p.title} className="rounded-xl border border-gray-a4 bg-gray-a2 p-5">
            <h2 className="text-5 font-semibold text-gray-12">{p.title}</h2>
            <p className="mt-1 text-3 text-gray-11">{p.body}</p>
          </section>
        ))}
      </div>
    </div>
  );
}
