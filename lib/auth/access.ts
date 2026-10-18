/**
 * Whop access checks with a short-lived cache (docs/plan/backend.md §2).
 * Pure logic: no Next.js or SDK imports, so it is unit-testable.
 */

export type AccessLevel = "no_access" | "customer" | "admin";
export type AccessResult = { hasAccess: boolean; accessLevel: AccessLevel };

export type AccessFetcher = (resourceId: string, userId: string) => Promise<AccessResult>;

export interface AccessCache {
  get(key: string): Promise<AccessResult | undefined>;
  set(key: string, value: AccessResult, ttlMs: number): Promise<void>;
}

export const ACCESS_TTL_MS = 5 * 60 * 1000;

/** Per-isolate memory cache. Swap for a Workers KV-backed cache in production. */
export function memoryAccessCache(now: () => number = Date.now): AccessCache {
  const store = new Map<string, { value: AccessResult; expiresAt: number }>();
  return {
    async get(key) {
      const hit = store.get(key);
      if (!hit) return undefined;
      if (hit.expiresAt <= now()) {
        store.delete(key);
        return undefined;
      }
      return hit.value;
    },
    async set(key, value, ttlMs) {
      store.set(key, { value, expiresAt: now() + ttlMs });
    },
  };
}

export function createAccessChecker(fetcher: AccessFetcher, cache: AccessCache, ttlMs = ACCESS_TTL_MS) {
  return async function checkAccess(resourceId: string, userId: string): Promise<AccessResult> {
    const key = `access:${userId}:${resourceId}`;
    const cached = await cache.get(key);
    if (cached) return cached;
    const result = await fetcher(resourceId, userId);
    await cache.set(key, result, ttlMs);
    return result;
  };
}

/** Members need any access to the experience; the owner dashboard needs admin. */
export function isAllowed(result: AccessResult, required: "member" | "admin"): boolean {
  if (!result.hasAccess) return false;
  return required === "admin" ? result.accessLevel === "admin" : result.accessLevel !== "no_access";
}
