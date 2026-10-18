/** Standard API error envelope (api.md §2): `{ error: { code, message, details } }`. */
export type ApiErrorBody = { error: { code: string; message: string; details?: unknown } };

export function apiError(status: number, code: string, message: string, details?: unknown): Response {
  const body: ApiErrorBody = { error: { code, message, ...(details === undefined ? {} : { details }) } };
  return Response.json(body, { status });
}
