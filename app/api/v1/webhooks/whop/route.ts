import { after, type NextRequest } from "next/server";
import { handleWhopWebhook } from "@/lib/webhooks/whop";
import { whopWebhookVerifier } from "@/lib/whop-sdk";

export function POST(request: NextRequest): Promise<Response> {
  return handleWhopWebhook(request, {
    getVerifier: whopWebhookVerifier,
    schedule: (task) => after(task),
    onEvent: async (event) => {
      // TODO(stage 2): upsert memberships, trial state and entitlements (idempotent by event id).
      console.info("[whop webhook]", event.type);
    },
  });
}
