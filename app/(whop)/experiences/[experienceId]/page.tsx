import { AccessGate } from "@/components/app/access-gate";
import { WelcomeScreen } from "@/components/app/welcome-screen";
import { guard } from "@/lib/auth/guard";

export default async function ExperiencePage({ params }: { params: Promise<{ experienceId: string }> }) {
  const { experienceId } = await params;
  const auth = await guard("experience", experienceId);
  if (!auth.ok) return <AccessGate failure={auth} surface="member" />;
  // TODO(stage 2): returning users land on Home ("3 drafts ready to approve") instead.
  return <WelcomeScreen experienceId={experienceId} />;
}
