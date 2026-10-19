import "server-only";
import { Whop } from "@whop/sdk";
import { requireServerEnv } from "./env";

let client: Whop | undefined;
let verifier: Whop | undefined;

/**
 * Server-side Whop SDK client (lazy, so the public site builds without secrets).
 *
 * Pinned to @whop/sdk 0.0.x: it ships `verifyUserToken`, which the Whop app
 * template and docs rely on. The 2.x rewrite (Sept 2026) does not expose it yet.
 */
export function whop(): Whop {
  if (!client) {
    const env = requireServerEnv(["WHOP_API_KEY", "NEXT_PUBLIC_WHOP_APP_ID"]);
    client = new Whop({ appID: env.NEXT_PUBLIC_WHOP_APP_ID, apiKey: env.WHOP_API_KEY, webhookKey: null });
  }
  return client;
}

/**
 * Webhook-only client: needs nothing but `WHOP_WEBHOOK_SECRET`, so a missing
 * API key can't break signature verification.
 */
export function whopWebhookVerifier(): Pick<Whop, "webhooks"> {
  if (!verifier) {
    const { WHOP_WEBHOOK_SECRET } = requireServerEnv(["WHOP_WEBHOOK_SECRET"]);
    verifier = createWebhookVerifier(WHOP_WEBHOOK_SECRET);
  }
  return verifier;
}

/**
 * The SDK verifies with Standard Webhooks, which expects a base64 key. Whop's
 * secrets are plain strings, so they are base64-encoded first; this matches
 * the official Whop app template (`webhookKey: btoa(WHOP_WEBHOOK_SECRET)`).
 */
export function createWebhookVerifier(secret: string): Whop {
  return new Whop({ apiKey: "webhook-verification-only", appID: null, webhookKey: btoa(secret) });
}
