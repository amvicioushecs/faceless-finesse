import type { AuthFailure } from "@/lib/auth/whop-auth";
import { siteFacts } from "@/lib/site-facts";

/** Shown when the request isn't from a verified Whop member with access. */
export function AccessGate({ failure, surface }: { failure: AuthFailure | { ok: false; reason: "not_configured" }; surface: "member" | "owner" }) {
  const copy =
    failure.reason === "unauthenticated"
      ? {
          title: `Open ${siteFacts.name} inside Whop`,
          body: "This page only works inside the Whop app, where your Whop login is verified.",
        }
      : failure.reason === "not_configured"
        ? {
            title: "App not configured yet",
            body: "Whop credentials are missing on the server. Set NEXT_PUBLIC_WHOP_APP_ID and WHOP_API_KEY (see .env.example).",
          }
        : surface === "owner"
          ? { title: "Admins only", body: "The owner dashboard requires admin access to this Whop company." }
          : {
              title: "Your access has ended",
              body: `Start or renew your plan on Whop to keep going. Every plan starts with a ${siteFacts.trialDays}-day free trial.`,
            };
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col justify-center gap-3 p-8 text-center" role="alert">
      <h1 className="text-7 font-bold text-gray-12">{copy.title}</h1>
      <p className="text-3 text-gray-11">{copy.body}</p>
    </div>
  );
}
