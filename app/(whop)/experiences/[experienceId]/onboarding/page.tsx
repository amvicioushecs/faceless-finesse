import { AccessGate } from "@/components/app/access-gate";
import { guard } from "@/lib/auth/guard";

// PLACEHOLDER: the onboarding quiz + AI niche finder ship in stage 2.
export default async function OnboardingPage({ params }: { params: Promise<{ experienceId: string }> }) {
  const { experienceId } = await params;
  const auth = await guard("experience", experienceId);
  if (!auth.ok) return <AccessGate failure={auth} surface="member" />;
  return (
    <div className="mx-auto max-w-2xl p-10">
      <h1 className="text-7 font-bold text-gray-12">What do you want from faceless content?</h1>
      <p className="mt-2 text-3 text-gray-11">The quiz is coming in the next update.</p>
    </div>
  );
}
