import { apiError } from "../api/errors";
import { EnvError } from "../env";

export type WhopWebhookEvent = { type: string; data?: unknown; id?: string };

export type WhopWebhookDeps = {
  /** Returns a verifier; throws `EnvError` when the webhook secret isn't configured. */
  getVerifier: () => { webhooks: { unwrap(body: string, opts: { headers: Record<string, string> }): unknown } };
  /** Runs after the response (Next.js `after`). */
  schedule: (task: () => Promise<void>) => void;
  onEvent: (event: WhopWebhookEvent) => Promise<void>;
};

/**
 * POST /api/v1/webhooks/whop (api.md §5).
 * - 503 `not_configured`: server misconfiguration (Whop will redeliver later).
 * - 401 `invalid_signature`: signature missing/invalid.
 * - 200: verified; processing continues after the response.
 */
export async function handleWhopWebhook(request: Request, deps: WhopWebhookDeps): Promise<Response> {
  let verifier: ReturnType<WhopWebhookDeps["getVerifier"]>;
  try {
    verifier = deps.getVerifier();
  } catch (err) {
    if (err instanceof EnvError) return apiError(503, "not_configured", "Webhook verification is not configured");
    throw err;
  }

  const body = await request.text();
  let event: WhopWebhookEvent;
  try {
    event = verifier.webhooks.unwrap(body, { headers: Object.fromEntries(request.headers) }) as WhopWebhookEvent;
  } catch {
    return apiError(401, "invalid_signature", "Webhook signature verification failed");
  }

  deps.schedule(() => deps.onEvent(event));
  return new Response("OK", { status: 200 });
}
