import "server-only";
import { Whop } from "@whop/sdk";
import { requireServerEnv } from "./env";

let client: Whop | undefined;

/**
 * Server-side Whop SDK client (lazy, so the public site builds without secrets).
 *
 * Pinned to @whop/sdk 0.0.x: it ships `verifyUserToken`, which the Whop app
 * template and docs rely on. The 2.x rewrite (Sept 2026) does not expose it yet.
 */
export function whop(): Whop {
  if (!client) {
    const env = requireServerEnv(["WHOP_API_KEY", "NEXT_PUBLIC_WHOP_APP_ID"]);
    client = new Whop({
      appID: env.NEXT_PUBLIC_WHOP_APP_ID,
      apiKey: env.WHOP_API_KEY,
      webhookKey: process.env.WHOP_WEBHOOK_SECRET ? btoa(process.env.WHOP_WEBHOOK_SECRET) : null,
    });
  }
  return client;
}
