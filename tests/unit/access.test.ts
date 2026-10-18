import { describe, expect, it, vi } from "vitest";
import { ACCESS_TTL_MS, createAccessChecker, isAllowed, memoryAccessCache } from "@/lib/auth/access";

describe("Whop access checks", () => {
  it("caches results for 5 minutes per user + resource", async () => {
    let now = 0;
    const fetcher = vi.fn(async () => ({ hasAccess: true, accessLevel: "customer" as const }));
    const check = createAccessChecker(fetcher, memoryAccessCache(() => now));

    await check("exp_1", "user_1");
    await check("exp_1", "user_1");
    expect(fetcher).toHaveBeenCalledTimes(1);

    await check("exp_2", "user_1");
    expect(fetcher).toHaveBeenCalledTimes(2);

    now += ACCESS_TTL_MS + 1;
    await check("exp_1", "user_1");
    expect(fetcher).toHaveBeenCalledTimes(3);
  });

  it("members need access; the owner dashboard needs admin", () => {
    expect(isAllowed({ hasAccess: true, accessLevel: "customer" }, "member")).toBe(true);
    expect(isAllowed({ hasAccess: true, accessLevel: "admin" }, "member")).toBe(true);
    expect(isAllowed({ hasAccess: false, accessLevel: "no_access" }, "member")).toBe(false);
    expect(isAllowed({ hasAccess: true, accessLevel: "customer" }, "admin")).toBe(false);
    expect(isAllowed({ hasAccess: true, accessLevel: "admin" }, "admin")).toBe(true);
  });
});
