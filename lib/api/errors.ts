/**
 * Standard API error envelope (api.md §2):
 * `{ error: { code, message, details, requestId } }`. `details` is always
 * present (null when empty) so clients see one stable shape. `requestId` uses
 * Cloudflare's `cf-ray` when available, otherwise a random id.
 */
export type ApiErrorBody = {
  error: { code: string; message: string; details: unknown; requestId: string };
};

export function newRequestId(headers?: Headers): string {
  const ray = headers?.get("cf-ray");
  return ray ? `req_${ray}` : `req_${crypto.randomUUID().replace(/-/g, "")}`;
}

export function apiError(
  status: number,
  code: string,
  message: string,
  details: unknown = null,
  requestId: string = newRequestId(),
): Response {
  const body: ApiErrorBody = { error: { code, message, details, requestId } };
  return Response.json(body, { status, headers: { "X-Request-Id": requestId } });
}
