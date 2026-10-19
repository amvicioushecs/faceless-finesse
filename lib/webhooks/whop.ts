import { apiError, newRequestId } from "../api/errors";
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
  const requestId = newRequestId(request.headers);
  let verifier: ReturnType<WhopWebhookDeps["getVerifier"]>;
  try {
    verifier = deps.getVerifier();
  } catch (err) {
    if (err instanceof EnvError) {
      console.error("[whop webhook] not configured", { requestId, issues: err.issues });
      return apiError(503, "not_configured", "Webhook verification is not configured", null, requestId);
    }
    throw err;
  }

  const body = await request.text();
  let event: WhopWebhookEvent;
  try {
    event = verifier.webhooks.unwrap(body, { headers: Object.fromEntries(request.headers) }) as WhopWebhookEvent;
  } catch (err) {
    // Log the error type only: messages (e.g. JSON.parse) can echo body data.
    console.warn("[whop webhook] signature verification failed", {
      requestId,
      reason: err instanceof Error ? err.name : "unknown",
      hasSignature: request.headers.has("webhook-signature"),
    });
    return apiError(401, "invalid_signature", "Webhook signature verification failed", null, requestId);
  }

  deps.schedule(() => deps.onEvent(event));
  return new Response("OK", { status: 200 });
}
