import { after, type NextRequest } from "next/server";
import { apiError } from "@/lib/api/errors";
import { whop } from "@/lib/whop-sdk";

/**
 * Whop webhooks (api.md). Stage 1 verifies the signature and acknowledges.
 * Stage 2 syncs memberships/trials into Supabase (idempotent by event id).
 */
export async function POST(request: NextRequest): Promise<Response> {
  if (!process.env.WHOP_WEBHOOK_SECRET) {
    return apiError(503, "not_configured", "Webhook secret is not configured");
  }
  const body = await request.text();
  let event: ReturnType<ReturnType<typeof whop>["webhooks"]["unwrap"]>;
  try {
    event = whop().webhooks.unwrap(body, { headers: Object.fromEntries(request.headers) });
  } catch {
    return apiError(401, "invalid_signature", "Webhook signature verification failed");
  }
  after(async () => {
    // TODO(stage 2): upsert memberships, trial state and entitlements.
    console.info("[whop webhook]", event.type);
  });
  return new Response("OK", { status: 200 });
}
