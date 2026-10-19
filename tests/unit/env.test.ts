import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { EnvError, parseServerEnv, requireServerEnv, serverEnvSchema } from "@/lib/env";

describe("env validation", () => {
  it("parses an empty environment so the public site can build without secrets", () => {
    const env = parseServerEnv({});
    expect(env.NODE_ENV).toBe("development");
    expect(env.TREG_DAILY_CAP_USD).toBe(5);
    expect(env.WHOP_API_KEY).toBeUndefined();
  });

  it("treats empty strings as unset", () => {
    expect(parseServerEnv({ WHOP_API_KEY: "", NEXT_PUBLIC_SUPABASE_URL: "" }).WHOP_API_KEY).toBeUndefined();
  });

  it("rejects malformed values with a readable message", () => {
    expect(() => parseServerEnv({ NEXT_PUBLIC_SUPABASE_URL: "not a url" })).toThrow(EnvError);
    expect(() => parseServerEnv({ NEXT_PUBLIC_WHOP_APP_ID: "biz_123" })).toThrow(/NEXT_PUBLIC_WHOP_APP_ID/);
    expect(() => parseServerEnv({ CRON_SECRET: "short" })).toThrow(/CRON_SECRET/);
    expect(() => parseServerEnv({ TREG_DAILY_CAP_USD: "-1" })).toThrow(/TREG_DAILY_CAP_USD/);
  });

  it("requires TOKEN_ENCRYPTION_KEY to be 32 base64 bytes", () => {
    const good = btoa(String.fromCharCode(...new Uint8Array(32).fill(7)));
    expect(parseServerEnv({ TOKEN_ENCRYPTION_KEY: good }).TOKEN_ENCRYPTION_KEY).toBe(good);
    expect(() => parseServerEnv({ TOKEN_ENCRYPTION_KEY: btoa("too short") })).toThrow(/32 bytes/);
    expect(() => parseServerEnv({ TOKEN_ENCRYPTION_KEY: "%%%not-base64%%%" })).toThrow(/32 bytes/);
  });

  it("requireServerEnv lists every missing variable at once", () => {
    const source = { WHOP_API_KEY: "key" };
    expect(requireServerEnv(["WHOP_API_KEY"], source)).toEqual({ WHOP_API_KEY: "key" });
    expect(() => requireServerEnv(["WHOP_API_KEY", "TREG_API_KEY", "GEMINI_API_KEY"], source)).toThrow(
      "Missing required environment variables: TREG_API_KEY, GEMINI_API_KEY",
    );
  });

  it("requireServerEnv validates only the requested keys", () => {
    const source = { WHOP_API_KEY: "key", NEXT_PUBLIC_WHOP_APP_ID: "app_abc", CRON_SECRET: "short" };
    expect(requireServerEnv(["WHOP_API_KEY", "NEXT_PUBLIC_WHOP_APP_ID"], source)).toEqual({
      WHOP_API_KEY: "key",
      NEXT_PUBLIC_WHOP_APP_ID: "app_abc",
    });
    expect(() => requireServerEnv(["CRON_SECRET"], source)).toThrow(/CRON_SECRET/);
    expect(() => requireServerEnv(["NEXT_PUBLIC_WHOP_APP_ID"], { NEXT_PUBLIC_WHOP_APP_ID: "biz_1" })).toThrow(EnvError);
  });

  it("requireServerEnv applies schema defaults", () => {
    expect(requireServerEnv(["NODE_ENV", "TREG_DAILY_CAP_USD"], {})).toEqual({ NODE_ENV: "development", TREG_DAILY_CAP_USD: 5 });
  });

  it("requireServerEnv reports missing and invalid keys together", () => {
    try {
      requireServerEnv(["WHOP_API_KEY", "CRON_SECRET"], { CRON_SECRET: "short" });
      expect.unreachable();
    } catch (err) {
      expect(err).toBeInstanceOf(EnvError);
      expect((err as EnvError).message).toMatch(/Missing required environment variables: WHOP_API_KEY\./);
      expect((err as EnvError).message).toMatch(/CRON_SECRET: must be at least 32 characters/);
    }
  });

  it("accepts bare and display-name sender addresses for EMAIL_FROM", () => {
    expect(parseServerEnv({ EMAIL_FROM: "support@example.com" }).EMAIL_FROM).toBe("support@example.com");
    expect(parseServerEnv({ EMAIL_FROM: "Faceless Finesse <support@example.com>" }).EMAIL_FROM).toBe(
      "Faceless Finesse <support@example.com>",
    );
    expect(() => parseServerEnv({ EMAIL_FROM: "not-an-email" })).toThrow(/EMAIL_FROM/);
    expect(() => parseServerEnv({ EMAIL_FROM: "Name <nope>" })).toThrow(/EMAIL_FROM/);
  });

  it(".env.example documents exactly the variables in the schema", () => {
    const example = readFileSync(new URL("../../.env.example", import.meta.url), "utf8");
    const documented = example
      .split("\n")
      .filter((l) => /^[A-Z0-9_]+=/.test(l))
      .map((l) => l.split("=")[0])
      .sort();
    const schemaKeys = Object.keys(serverEnvSchema.shape)
      .filter((k) => k !== "NODE_ENV")
      .sort();
    expect(documented).toEqual(schemaKeys);
    // Example values must not look like real secrets.
    expect(example).not.toMatch(/=(sk_|whsec_|eyJ)/);
  });
});
