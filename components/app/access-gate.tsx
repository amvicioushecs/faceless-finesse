import type { AuthFailure } from "@/lib/auth/whop-auth";
import { siteFacts } from "@/lib/site-facts";
import { ChoosePlanButton } from "./choose-plan-button";

type GateFailure = AuthFailure | { ok: false; reason: "not_configured" };

export function gateCopy(failure: GateFailure, surface: "member" | "owner", isProduction: boolean) {
  switch (failure.reason) {
    case "unauthenticated":
      return {
        title: `Open ${siteFacts.name} inside Whop`,
        body: "This page only works inside the Whop app, where your Whop login is verified.",
      };
    case "not_configured":
      return isProduction
        ? { title: "We'll be right back", body: `${siteFacts.name} is temporarily unavailable. Please try again soon.` }
        : {
            title: "App not configured yet",
            body: "Whop credentials are missing on the server. Set NEXT_PUBLIC_WHOP_APP_ID and WHOP_API_KEY (see .env.example).",
          };
    case "forbidden":
      return surface === "owner"
        ? { title: "Admins only", body: "The owner dashboard requires admin access to this Whop company." }
        : {
            title: "Choose a plan to continue",
            body: `You need an active ${siteFacts.name} plan to use the app. Every plan starts with a ${siteFacts.trialLabel}.`,
          };
  }
}

/** Shown when the request isn't from a verified Whop member with access. */
export function AccessGate({ failure, surface }: { failure: GateFailure; surface: "member" | "owner" }) {
  const copy = gateCopy(failure, surface, process.env.NODE_ENV === "production");
  const showCheckout = failure.reason === "forbidden" && surface === "member";
  const starter = siteFacts.tiers.find((t) => t.id === "starter");
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col justify-center gap-4 p-8 text-center">
      <h1 className="text-7 font-bold text-gray-12">{copy.title}</h1>
      <p className="text-3 text-gray-11">{copy.body}</p>
      {showCheckout ? <ChoosePlanButton planId={starter?.whopPlanId ?? null} storeUrl={siteFacts.whopStoreUrl} /> : null}
    </div>
  );
}
