"use client";

import { Button } from "@whop/react/components";
import { WhopIframeSdkContext } from "@whop/react/iframe";
import { use, useState } from "react";
import { isPlaceholder } from "@/lib/site-facts";

/**
 * Paywall action (user-flow.md §1). Inside Whop it opens in-app checkout for
 * the plan (falling back to the store page); outside Whop it opens the store.
 * Renders nothing until a real plan ID or store URL exists.
 */
export function ChoosePlanButton({ planId, storeUrl }: { planId: string | null; storeUrl: string }) {
  const sdk = use(WhopIframeSdkContext);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const hasStore = !isPlaceholder(storeUrl);
  if (!planId && !hasStore) return null;

  async function onClick() {
    setBusy(true);
    setError(null);
    try {
      if (sdk && planId) {
        const res = await sdk.inAppPurchase({ planId });
        if (res.status === "ok") window.location.reload();
        else setError("Checkout didn't finish. You can try again anytime.");
      } else if (sdk) {
        await sdk.openExternalUrl({ url: storeUrl });
      } else {
        window.open(storeUrl, "_blank", "noopener,noreferrer");
      }
    } catch {
      setError("Couldn't open checkout. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <Button variant="classic" size="4" onClick={onClick} disabled={busy}>
        Choose a plan
      </Button>
      {error ? (
        <p role="alert" className="text-2 text-red-11">
          {error}
        </p>
      ) : null}
    </div>
  );
}
