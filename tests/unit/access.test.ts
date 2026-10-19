import { describe, expect, it, vi } from "vitest";
import {
  ACCESS_TTL_MS,
  type AccessResult,
  createAccessChecker,
  isAllowed,
  memoryAccessCache,
} from "@/lib/auth/access";

const customer: AccessResult = { hasAccess: true, accessLevel: "customer" };
const denied: AccessResult = { hasAccess: false, accessLevel: "no_access" };

describe("Whop access checks", () => {
  it("caches positive results for 5 minutes per user + resource", async () => {
    let now = 0;
    const fetcher = vi.fn(async () => customer);
    const check = createAccessChecker(fetcher, memoryAccessCache(() => now));

    await check("exp_1", "user_1");
    await check("exp_1", "user_1");
    expect(fetcher).toHaveBeenCalledTimes(1);

    await check("exp_2", "user_1");
    expect(fetcher).toHaveBeenCalledTimes(2);

    // A different user on the same resource never shares a cache entry.
    await check("exp_1", "user_2");
    expect(fetcher).toHaveBeenCalledTimes(3);
    expect(fetcher).toHaveBeenLastCalledWith("exp_1", "user_2");

    now += ACCESS_TTL_MS + 1;
    await check("exp_1", "user_1");
    expect(fetcher).toHaveBeenCalledTimes(4);
  });

  it("does not cache denials, so a fresh purchase is seen immediately", async () => {
    const fetcher = vi.fn<() => Promise<AccessResult>>().mockResolvedValueOnce(denied).mockResolvedValueOnce(customer);
    const check = createAccessChecker(fetcher, memoryAccessCache());
    expect(await check("exp_1", "user_1")).toEqual(denied);
    expect(await check("exp_1", "user_1")).toEqual(customer);
    expect(fetcher).toHaveBeenCalledTimes(2);
  });

  it("sweeps expired entries and stays bounded", async () => {
    let now = 0;
    const cache = memoryAccessCache(() => now, 3) as ReturnType<typeof memoryAccessCache> & { size: number };
    await cache.set("a", customer, 10);
    await cache.set("b", customer, 10);
    now = 11;
    await cache.set("c", customer, 10);
    expect(cache.size).toBe(1);
    await cache.set("d", customer, 100);
    await cache.set("e", customer, 100);
    await cache.set("f", customer, 100);
    expect(cache.size).toBe(3);
    expect(await cache.get("c")).toBeUndefined(); // oldest evicted
    expect(await cache.get("f")).toEqual(customer);
  });

  it("rejects a non-positive capacity", () => {
    expect(() => memoryAccessCache(Date.now, 0)).toThrow(RangeError);
  });

  it("members need access; the owner dashboard needs admin", () => {
    expect(isAllowed(customer, "member")).toBe(true);
    expect(isAllowed({ hasAccess: true, accessLevel: "admin" }, "member")).toBe(true);
    expect(isAllowed(denied, "member")).toBe(false);
    expect(isAllowed(customer, "admin")).toBe(false);
    expect(isAllowed({ hasAccess: true, accessLevel: "admin" }, "admin")).toBe(true);
  });
});
