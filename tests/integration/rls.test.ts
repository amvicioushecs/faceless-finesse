import { readdirSync, readFileSync } from "node:fs";
import { PGlite } from "@electric-sql/pglite";
import { pgcrypto } from "@electric-sql/pglite/contrib/pgcrypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

/**
 * Applies supabase/migrations to an in-process Postgres (PGlite) with a minimal
 * Supabase shim (roles + auth.uid()), then checks RLS as two different users.
 * CI can additionally run these against `supabase start` later.
 */
const SUPABASE_SHIM = `
  create role anon nologin;
  create role authenticated nologin;
  create role service_role nologin bypassrls;
  create schema auth;
  create function auth.uid() returns uuid language sql stable as
    $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
  grant usage on schema auth to anon, authenticated, service_role;
  grant usage on schema public to anon, authenticated, service_role;
  alter default privileges in schema public grant all on tables to anon, authenticated, service_role;
  alter default privileges in schema public grant all on sequences to anon, authenticated, service_role;
  alter default privileges in schema public grant execute on functions to anon, authenticated, service_role;
`;

const A = "00000000-0000-4000-8000-00000000000a";
const B = "00000000-0000-4000-8000-00000000000b";

let db: PGlite;

async function as<T>(user: string | "service", fn: () => Promise<T>): Promise<T> {
  if (user === "service") {
    await db.exec("set role service_role; select set_config('request.jwt.claim.sub', '', false);");
  } else {
    await db.exec(`set role authenticated; select set_config('request.jwt.claim.sub', '${user}', false);`);
  }
  try {
    return await fn();
  } finally {
    await db.exec("reset role;");
  }
}

beforeAll(async () => {
  db = await PGlite.create({ extensions: { pgcrypto } });
  await db.exec(SUPABASE_SHIM);
  const dir = new URL("../../supabase/migrations/", import.meta.url);
  for (const file of readdirSync(dir).filter((f) => f.endsWith(".sql")).sort()) {
    await db.exec(readFileSync(new URL(file, dir), "utf8"));
  }
  // Seed two Whop users and a workspace each (server-side, as service role).
  await as("service", () =>
    db.exec(`
      insert into public.users (id, whop_user_id) values ('${A}', 'user_A'), ('${B}', 'user_B');
      insert into public.workspaces (owner_id, name) values ('${A}', 'A brand'), ('${B}', 'B brand');
      insert into public.social_accounts (workspace_id, owner_id, platform, external_id, access_token_enc)
        select id, owner_id, 'youtube', 'chan_' || name, 'ciphertext' from public.workspaces;
      insert into public.usage_events (owner_id, provider, kind, units, cost_micro)
        values ('${A}', 'treg', 'keyword_volume', 1, 1000);
    `),
  );
}, 60_000);

afterAll(async () => {
  await db?.close();
});

const wsOf = (owner: string) =>
  as("service", async () => (await db.query<{ id: string }>(`select id from public.workspaces where owner_id = $1`, [owner])).rows[0].id);

describe("RLS", () => {
  it("users only see their own workspaces", async () => {
    const rows = await as(A, async () => (await db.query<{ name: string }>("select name from public.workspaces")).rows);
    expect(rows.map((r) => r.name)).toEqual(["A brand"]);
  });

  it("users only see their own user row", async () => {
    const rows = await as(B, async () => (await db.query<{ whop_user_id: string }>("select whop_user_id from public.users")).rows);
    expect(rows).toEqual([{ whop_user_id: "user_B" }]);
  });

  it("anonymous requests see nothing", async () => {
    await db.exec("set role anon;");
    try {
      const { rows } = await db.query("select * from public.workspaces");
      expect(rows).toHaveLength(0);
    } finally {
      await db.exec("reset role;");
    }
  });

  it("users cannot write rows into someone else's workspace", async () => {
    const wsB = await wsOf(B);
    await expect(
      as(A, () => db.query(`insert into public.niches (workspace_id, owner_id, name, level) values ($1, $2, 'x', 'niche')`, [wsB, A])),
    ).rejects.toThrow(/row-level security/);
    await expect(
      as(A, () => db.query(`insert into public.niches (workspace_id, owner_id, name, level) values ($1, $2, 'x', 'niche')`, [wsB, B])),
    ).rejects.toThrow(/row-level security/);
  });

  it("users can create niches in their own workspace", async () => {
    const wsA = await wsOf(A);
    const { rows } = await as(A, () =>
      db.query<{ name: string }>(
        `insert into public.niches (workspace_id, owner_id, name, level, ease_to_rank_score) values ($1, $2, 'Home workouts', 'sub', 72) returning name`,
        [wsA, A],
      ),
    );
    expect(rows).toEqual([{ name: "Home workouts" }]);
  });

  it("encrypted social tokens are not readable with user credentials", async () => {
    await expect(as(A, () => db.query("select access_token_enc from public.social_accounts"))).rejects.toThrow(/permission denied/);
    const { rows } = await as(A, () => db.query<{ platform: string }>("select platform from public.social_accounts"));
    expect(rows).toEqual([{ platform: "youtube" }]);
  });

  it("the usage ledger is readable by its owner but server-write only", async () => {
    const own = await as(A, async () => (await db.query("select * from public.usage_events")).rows);
    expect(own).toHaveLength(1);
    const other = await as(B, async () => (await db.query("select * from public.usage_events")).rows);
    expect(other).toHaveLength(0);
    await expect(
      as(A, () => db.query(`insert into public.usage_events (owner_id, provider, kind) values ($1, 'x', 'y')`, [A])),
    ).rejects.toThrow(/row-level security/);
    await expect(
      as(A, () => db.query(`insert into public.memberships (owner_id, whop_membership_id, plan_id, tier, status) values ($1, 'mem', 'plan', 'pro', 'active')`, [A])),
    ).rejects.toThrow(/row-level security/);
  });

  it("enables RLS on every public table", async () => {
    const { rows } = await db.query<{ relname: string }>(
      `select c.relname from pg_class c join pg_namespace n on n.oid = c.relnamespace
       where n.nspname = 'public' and c.relkind = 'r' and not c.relrowsecurity`,
    );
    expect(rows).toEqual([]);
  });
});
