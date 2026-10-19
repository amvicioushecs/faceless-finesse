import "server-only";
import { headers } from "next/headers";
import { whop } from "../whop-sdk";
import { type AccessResult, createAccessChecker, isAllowed, memoryAccessCache } from "./access";

export type WhopSession = { userId: string; access: AccessResult };

export type AuthFailure =
  | { ok: false; reason: "unauthenticated" }
  | { ok: false; reason: "forbidden"; access: AccessResult };

const checkAccess = createAccessChecker(async (resourceId, userId) => {
  const res = await whop().users.checkAccess(resourceId, { id: userId });
  return { hasAccess: res.has_access, accessLevel: res.access_level };
}, memoryAccessCache());

/** Verifies the Whop user token header (`x-whop-user-token`). Returns null if absent/invalid. */
export async function getWhopUserId(h?: Headers): Promise<string | null> {
  const payload = await whop().verifyUserToken(h ?? (await headers()), { dontThrow: true });
  return payload?.userId ?? null;
}

async function authorize(
  resourceId: string,
  required: "member" | "admin",
): Promise<({ ok: true } & WhopSession) | AuthFailure> {
  const userId = await getWhopUserId();
  if (!userId) return { ok: false, reason: "unauthenticated" };
  const access = await checkAccess(resourceId, userId);
  if (!isAllowed(access, required)) return { ok: false, reason: "forbidden", access };
  return { ok: true, userId, access };
}

/** Member App: `/experiences/[experienceId]`. */
export function authorizeExperience(experienceId: string) {
  return authorize(experienceId, "member");
}

/** Owner Dashboard: `/dashboard/[companyId]` requires Whop admin on the company. */
export function authorizeCompanyAdmin(companyId: string) {
  return authorize(companyId, "admin");
}
