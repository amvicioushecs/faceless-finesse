import { Button } from "@whop/react/components";
import Link from "next/link";

const EXAMPLE = {
  niche: "Fitness → Home workouts → Postpartum home workouts for busy moms",
  script: {
    hook: "Only 10 minutes while the baby naps? Do this.",
    body: "Three moves, no equipment: glute bridges, wall push-ups, dead bugs. 40 seconds each, twice.",
    cta: "Save this and follow for a new 10-minute routine every day.",
  },
  post: "Tip card: \"10-minute nap-time workout\" in your brand colors, ready to post to YouTube, Facebook and X.",
};

/**
 * Welcome screen (user-flow.md §1): an example niche → script → finished post,
 * then one button. No step counter; the flow itself shows the way.
 */
export function WelcomeScreen({ experienceId, displayName }: { experienceId: string; displayName?: string }) {
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 p-6 sm:p-10">
      <header>
        <h1 className="text-8 font-bold text-gray-12">
          {displayName ? `Welcome, ${displayName}.` : "Welcome."} Let&apos;s build your faceless content business.
        </h1>
        <p className="mt-2 text-4 text-gray-11">Here&apos;s what you&apos;ll make, from niche to finished post.</p>
      </header>

      <ol className="flex flex-col gap-4">
        <li className="rounded-xl border border-gray-a4 bg-gray-a2 p-4">
          <h2 className="text-3 font-semibold uppercase tracking-wide text-gray-11">Micro-niche</h2>
          <p className="mt-1 text-4 text-gray-12">{EXAMPLE.niche}</p>
        </li>
        <li className="rounded-xl border border-gray-a4 bg-gray-a2 p-4">
          <h2 className="text-3 font-semibold uppercase tracking-wide text-gray-11">30-second script</h2>
          <p className="mt-1 text-4 text-gray-12"><strong>Hook:</strong> {EXAMPLE.script.hook}</p>
          <p className="mt-1 text-3 text-gray-12">{EXAMPLE.script.body}</p>
          <p className="mt-1 text-3 text-gray-12"><strong>CTA:</strong> {EXAMPLE.script.cta}</p>
        </li>
        <li className="rounded-xl border border-gray-a4 bg-gray-a2 p-4">
          <h2 className="text-3 font-semibold uppercase tracking-wide text-gray-11">Finished post</h2>
          <p className="mt-1 text-4 text-gray-12">{EXAMPLE.post}</p>
        </li>
      </ol>

      <Button asChild variant="classic" size="4" className="self-start">
        <Link href={`/experiences/${experienceId}/onboarding`}>Get started</Link>
      </Button>
    </div>
  );
}
