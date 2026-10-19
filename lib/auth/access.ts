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

/**
 * Per-isolate memory cache, bounded: expired entries are swept on write and the
 * oldest entry is evicted past `maxEntries`. Swap for Workers KV in production.
 */
export function memoryAccessCache(now: () => number = Date.now, maxEntries = 1000): AccessCache {
  if (!Number.isInteger(maxEntries) || maxEntries < 1) throw new RangeError("maxEntries must be a positive integer");
  const store = new Map<string, { value: AccessResult; expiresAt: number }>();
  const sweep = () => {
    const t = now();
    for (const [k, v] of store) if (v.expiresAt <= t) store.delete(k);
  };
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
      sweep();
      store.delete(key);
      while (store.size >= maxEntries) {
        const oldest = store.keys().next().value;
        if (oldest === undefined) break;
        store.delete(oldest);
      }
      store.set(key, { value, expiresAt: now() + ttlMs });
    },
    get size() {
      return store.size;
    },
  } as AccessCache & { readonly size: number };
}

/**
 * Only positive results are cached, so someone who buys on Whop right after
 * seeing the paywall gets in on the next request.
 */
export function createAccessChecker(fetcher: AccessFetcher, cache: AccessCache, ttlMs = ACCESS_TTL_MS) {
  return async function checkAccess(resourceId: string, userId: string): Promise<AccessResult> {
    const key = `access:${userId}:${resourceId}`;
    const cached = await cache.get(key);
    if (cached) return cached;
    const result = await fetcher(resourceId, userId);
    if (result.hasAccess) await cache.set(key, result, ttlMs);
    return result;
  };
}

/** Members need any access to the experience; the owner dashboard needs admin. */
export function isAllowed(result: AccessResult, required: "member" | "admin"): boolean {
  if (!result.hasAccess) return false;
  return required === "admin" ? result.accessLevel === "admin" : result.accessLevel !== "no_access";
}
