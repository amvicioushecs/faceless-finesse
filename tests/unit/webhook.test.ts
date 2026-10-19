import { Webhook } from "standardwebhooks";
import { describe, expect, it, vi } from "vitest";
import { EnvError, requireServerEnv } from "@/lib/env";
import { handleWhopWebhook, type WhopWebhookDeps } from "@/lib/webhooks/whop";
import { createWebhookVerifier } from "@/lib/whop-sdk";

const SECRET = "ws_test_secret_value_1234567890";

function signedRequest(payload: object, secret = SECRET): Request {
  const body = JSON.stringify(payload);
  const id = "msg_test_1";
  const now = new Date();
  const signature = new Webhook(btoa(secret)).sign(id, now, body);
  return new Request("https://app.test/api/v1/webhooks/whop", {
    method: "POST",
    body,
    headers: {
      "content-type": "application/json",
      "webhook-id": id,
      "webhook-timestamp": String(Math.floor(now.getTime() / 1000)),
      "webhook-signature": signature,
    },
  });
}

function deps(overrides: Partial<WhopWebhookDeps> = {}) {
  const tasks: Array<() => Promise<void>> = [];
  const onEvent = vi.fn(async () => {});
  const d: WhopWebhookDeps = {
    getVerifier: () => createWebhookVerifier(SECRET),
    schedule: (t) => tasks.push(t),
    onEvent,
    ...overrides,
  };
  return { d, tasks, onEvent };
}

async function errorCode(res: Response) {
  const body = (await res.json()) as { error: { code: string; details: unknown; requestId: string } };
  expect(body.error.details).toBeNull();
  expect(body.error.requestId).toMatch(/^req_/);
  return body.error.code;
}

describe("Whop webhook handler", () => {
  it("returns 503 not_configured when the secret is missing (not 401)", async () => {
    const { d, onEvent } = deps({ getVerifier: () => requireServerEnv(["WHOP_WEBHOOK_SECRET"], {}) as never });
    const res = await handleWhopWebhook(signedRequest({ type: "membership.went_valid" }), d);
    expect(res.status).toBe(503);
    expect(await errorCode(res)).toBe("not_configured");
    expect(onEvent).not.toHaveBeenCalled();
  });

  it("still verifies signatures when the API key/app ID are absent", async () => {
    // The verifier only needs the webhook secret.
    expect(() => requireServerEnv(["WHOP_API_KEY"], {})).toThrow(EnvError);
    const { d } = deps();
    const res = await handleWhopWebhook(signedRequest({ type: "payment.succeeded" }), d);
    expect(res.status).toBe(200);
  });

  it("returns 401 invalid_signature for a bad or missing signature", async () => {
    const { d, onEvent } = deps();
    const wrongKey = await handleWhopWebhook(signedRequest({ type: "x" }, "some_other_secret_value"), d);
    expect(wrongKey.status).toBe(401);
    expect(await errorCode(wrongKey)).toBe("invalid_signature");

    const unsigned = await handleWhopWebhook(
      new Request("https://app.test/api/v1/webhooks/whop", { method: "POST", body: "{}" }),
      d,
    );
    expect(unsigned.status).toBe(401);
    expect(onEvent).not.toHaveBeenCalled();
  });

  it("rejects a tampered body", async () => {
    const { d } = deps();
    const req = signedRequest({ type: "payment.succeeded", amount: 1 });
    const tampered = new Request(req.url, { method: "POST", headers: req.headers, body: JSON.stringify({ type: "payment.succeeded", amount: 999 }) });
    expect((await handleWhopWebhook(tampered, d)).status).toBe(401);
  });

  it("returns 200 for a valid signature and processes the event after responding", async () => {
    const { d, tasks, onEvent } = deps();
    const res = await handleWhopWebhook(signedRequest({ type: "membership.went_valid", data: { id: "mem_1" } }), d);
    expect(res.status).toBe(200);
    expect(onEvent).not.toHaveBeenCalled();
    await Promise.all(tasks.map((t) => t()));
    expect(onEvent).toHaveBeenCalledWith(expect.objectContaining({ type: "membership.went_valid" }));
  });

  it("rethrows unexpected verifier errors", async () => {
    const { d } = deps({
      getVerifier: () => {
        throw new TypeError("boom");
      },
    });
    await expect(handleWhopWebhook(signedRequest({ type: "x" }), d)).rejects.toThrow("boom");
  });
});
