import { z } from "zod";

/**
 * Environment validation (docs/plan/backend.md §8, devops.md §2).
 *
 * Every variable is declared here and documented in `.env.example`. Values are
 * optional at parse time so the public marketing site can build and run with no
 * secrets; code that needs a secret calls `requireServerEnv(...)`, which fails
 * loudly with the missing variable names. In production, set secrets with
 * `wrangler secret put <NAME>`; never commit them.
 */

const optionalString = z.string().trim().min(1).optional();
const optionalUrl = z.url().optional();

/** 32 random bytes, base64-encoded (AES-256-GCM key for social tokens). */
const base64Key32 = z
  .string()
  .trim()
  .refine((v) => {
    try {
      return atob(v).length === 32;
    } catch {
      return false;
    }
  }, "must be 32 bytes, base64-encoded (openssl rand -base64 32)")
  .optional();

export const publicEnvSchema = z.object({
  NEXT_PUBLIC_WHOP_APP_ID: z
    .string()
    .trim()
    .regex(/^app_[A-Za-z0-9]+$/, "must look like app_xxx")
    .optional(),
  NEXT_PUBLIC_SUPABASE_URL: optionalUrl,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: optionalString,
  NEXT_PUBLIC_APP_URL: optionalUrl,
  NEXT_PUBLIC_SENTRY_DSN: optionalUrl,
});

export const serverEnvSchema = publicEnvSchema.extend({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  // Whop
  WHOP_API_KEY: optionalString,
  WHOP_WEBHOOK_SECRET: optionalString,
  // Supabase (server-only)
  SUPABASE_SERVICE_ROLE_KEY: optionalString,
  SUPABASE_JWT_SECRET: optionalString,
  // Search data
  TREG_API_KEY: optionalString,
  TREG_DAILY_CAP_USD: z.coerce.number().positive().default(5),
  TREG_PER_CALL_CAP_USD: z.coerce.number().positive().default(0.05),
  // AI providers (via internal AI Gateway)
  GEMINI_API_KEY: optionalString,
  GROQ_API_KEY: optionalString,
  FAL_KEY: optionalString,
  XAI_API_KEY: optionalString,
  // Social publishing
  YOUTUBE_CLIENT_ID: optionalString,
  YOUTUBE_CLIENT_SECRET: optionalString,
  META_APP_ID: optionalString,
  META_APP_SECRET: optionalString,
  X_CLIENT_ID: optionalString,
  X_CLIENT_SECRET: optionalString,
  // Security
  TOKEN_ENCRYPTION_KEY: base64Key32,
  CRON_SECRET: z.string().trim().min(32, "must be at least 32 characters").optional(),
  // Email + monitoring
  RESEND_API_KEY: optionalString,
  /** Bare address or display-name form: `Faceless Finesse <support@example.com>`. */
  EMAIL_FROM: z
    .string()
    .trim()
    .refine((v) => {
      const m = /^(?:[^<>]+<([^<>\s]+)>|([^<>\s]+))$/.exec(v);
      const addr = m?.[1] ?? m?.[2];
      return !!addr && z.email().safeParse(addr).success;
    }, "must be an email address or `Name <address>`")
    .optional(),
  SENTRY_DSN: optionalUrl,
});

export type PublicEnv = z.infer<typeof publicEnvSchema>;
export type ServerEnv = z.infer<typeof serverEnvSchema>;
export type ServerEnvKey = keyof ServerEnv;

type EnvSource = Record<string, string | undefined>;

/** Treat empty strings as unset so `.env` files with `KEY=` behave. */
function clean(source: EnvSource): EnvSource {
  return Object.fromEntries(Object.entries(source).filter(([, v]) => v !== undefined && v !== ""));
}

export class EnvError extends Error {
  constructor(message: string, readonly issues: string[]) {
    super(message);
    this.name = "EnvError";
  }
}

export function parseServerEnv(source: EnvSource = process.env): ServerEnv {
  const result = serverEnvSchema.safeParse(clean(source));
  if (!result.success) {
    const issues = result.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`);
    throw new EnvError(`Invalid environment variables:\n  ${issues.join("\n  ")}`, issues);
  }
  return result.data;
}

/**
 * Default env source. `NEXT_PUBLIC_*` vars are referenced literally so Next.js
 * can inline them at build time (dynamic `process.env[key]` reads are not
 * inlined, and on Workers they would otherwise be missing at runtime).
 */
function defaultSource(): EnvSource {
  return {
    ...process.env,
    NEXT_PUBLIC_WHOP_APP_ID: process.env.NEXT_PUBLIC_WHOP_APP_ID,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
  };
}

/** Public env (safe for client components). */
export function parsePublicEnv(): PublicEnv {
  return publicEnvSchema.parse(clean(defaultSource()));
}

let cached: ServerEnv | undefined;

/** Fully validated server env (cached). Server-only: never import into client components. */
export function getServerEnv(): ServerEnv {
  cached ??= parseServerEnv(defaultSource());
  return cached;
}

/** Test helper. */
export function resetEnvCache(): void {
  cached = undefined;
}

/**
 * Returns the requested variables, validating only those keys (so a malformed,
 * unrelated optional variable can't take down this code path). Throws one clear
 * error listing every missing or invalid name. Use where a secret is needed.
 */
export function requireServerEnv<K extends ServerEnvKey>(
  keys: readonly K[],
  source: EnvSource = defaultSource(),
): { [P in K]: NonNullable<ServerEnv[P]> } {
  const mask = Object.fromEntries(keys.map((k) => [k, true])) as Record<K, true>;
  const result = serverEnvSchema.pick(mask).safeParse(clean(source));
  if (!result.success) {
    const issues = result.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`);
    throw new EnvError(`Invalid environment variables:\n  ${issues.join("\n  ")}`, issues);
  }
  const values = result.data as Partial<ServerEnv>;
  const missing = keys.filter((k) => values[k] === undefined || values[k] === null);
  if (missing.length) {
    throw new EnvError(
      `Missing required environment variables: ${missing.join(", ")}. See .env.example.`,
      missing.map((m) => `${m}: required`),
    );
  }
  return values as { [P in K]: NonNullable<ServerEnv[P]> };
}
