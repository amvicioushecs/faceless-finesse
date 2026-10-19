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
const B_NICHE = "00000000-0000-4000-8000-0000000000b1";
const B_IDEA = "00000000-0000-4000-8000-0000000000b2";
const B_POST = "00000000-0000-4000-8000-0000000000b3";

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
      insert into public.niches (id, workspace_id, owner_id, name, level)
        select '${B_NICHE}', id, owner_id, 'B niche', 'niche' from public.workspaces where owner_id = '${B}';
      insert into public.ideas (id, workspace_id, owner_id, niche_id, title)
        select '${B_IDEA}', id, owner_id, '${B_NICHE}', 'B idea' from public.workspaces where owner_id = '${B}';
      insert into public.posts (id, workspace_id, owner_id, format)
        select '${B_POST}', id, owner_id, 'text' from public.workspaces where owner_id = '${B}';
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
    await db.exec("set role anon; select set_config('request.jwt.claim.sub', '', false);");
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
    await expect(as(A, () => db.query("select refresh_token_enc from public.social_accounts"))).rejects.toThrow(/permission denied/);
    await expect(as(A, () => db.query("select * from public.social_accounts"))).rejects.toThrow(/permission denied/);
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

  it("users cannot move their own rows into someone else's workspace", async () => {
    const wsA = await wsOf(A);
    const wsB = await wsOf(B);
    await as(A, () =>
      db.query(`insert into public.niches (workspace_id, owner_id, name, level) values ($1, $2, 'Movable', 'niche')`, [wsA, A]),
    );
    await expect(
      as(A, () => db.query(`update public.niches set workspace_id = $1 where name = 'Movable'`, [wsB])),
    ).rejects.toThrow(/row-level security|foreign key/);
    await expect(
      as(A, () => db.query(`update public.niches set owner_id = $1 where name = 'Movable'`, [B])),
    ).rejects.toThrow(/row-level security/);
  });

  it("child rows cannot reference another owner's parent rows", async () => {
    const wsA = await wsOf(A);
    const cases: Array<[string, unknown[]]> = [
      [`insert into public.ideas (workspace_id, owner_id, niche_id, title) values ($1, $2, $3, 'steal')`, [wsA, A, B_NICHE]],
      [`insert into public.niches (workspace_id, owner_id, parent_id, name, level) values ($1, $2, $3, 'child', 'micro')`, [wsA, A, B_NICHE]],
      [`insert into public.niche_keywords (niche_id, owner_id, keyword) values ($1, $2, 'kw')`, [B_NICHE, A]],
      [`insert into public.scripts (idea_id, owner_id, hook, body) values ($1, $2, 'h', 'b')`, [B_IDEA, A]],
      [`insert into public.calendar_entries (post_id, owner_id, scheduled_at, platform) values ($1, $2, now(), 'x')`, [B_POST, A]],
    ];
    for (const [sql, params] of cases) {
      await expect(as(A, () => db.query(sql, params)), sql).rejects.toThrow(/foreign key/);
    }
    // Even the service role cannot create a cross-owner link.
    await expect(
      as("service", () =>
        db.query(`insert into public.calendar_entries (post_id, owner_id, scheduled_at, platform) values ($1, $2, now(), 'x')`, [B_POST, A]),
      ),
    ).rejects.toThrow(/foreign key/);
  });

  it("publish jobs can't pair a post with another brand's social account (same owner)", async () => {
    const ids = await as("service", async () => {
      const ws2 = (await db.query<{ id: string }>(`insert into public.workspaces (owner_id, name) values ($1, 'A brand 2') returning id`, [A])).rows[0].id;
      const ws1 = (await db.query<{ id: string }>(`select id from public.workspaces where owner_id = $1 and name = 'A brand'`, [A])).rows[0].id;
      const post = (await db.query<{ id: string }>(`insert into public.posts (workspace_id, owner_id, format) values ($1, $2, 'text') returning id`, [ws1, A])).rows[0].id;
      const acct1 = (await db.query<{ id: string }>(`select id from public.social_accounts where workspace_id = $1`, [ws1])).rows[0].id;
      const acct2 = (await db.query<{ id: string }>(
        `insert into public.social_accounts (workspace_id, owner_id, platform, external_id, access_token_enc) values ($1, $2, 'x', 'acct2', 'c') returning id`,
        [ws2, A],
      )).rows[0].id;
      return { ws1, ws2, post, acct1, acct2 };
    });
    const insert = (ws: string, acct: string) =>
      as("service", () =>
        db.query(`insert into public.publish_jobs (workspace_id, post_id, owner_id, social_account_id) values ($1, $2, $3, $4)`, [ws, ids.post, A, acct]),
      );
    await expect(insert(ids.ws1, ids.acct2)).rejects.toThrow(/foreign key/);
    await expect(insert(ids.ws2, ids.acct2)).rejects.toThrow(/foreign key/);
    await expect(insert(ids.ws1, ids.acct1)).resolves.toBeDefined();
  });

  it("deleting a niche clears idea.niche_id but keeps the owner", async () => {
    const wsB = await wsOf(B);
    await as(B, () =>
      db.query(`insert into public.niches (id, workspace_id, owner_id, name, level) values ('00000000-0000-4000-8000-0000000000b9', $1, $2, 'tmp', 'niche')`, [wsB, B]),
    );
    await as(B, () => db.query(`update public.ideas set niche_id = '00000000-0000-4000-8000-0000000000b9' where id = $1`, [B_IDEA]));
    await as(B, () => db.query(`delete from public.niches where id = '00000000-0000-4000-8000-0000000000b9'`));
    const { rows } = await as(B, () => db.query<{ niche_id: string | null; owner_id: string }>(`select niche_id, owner_id from public.ideas where id = $1`, [B_IDEA]));
    expect(rows).toEqual([{ niche_id: null, owner_id: B }]);
  });

  it("users can edit profile fields but not their Whop identity", async () => {
    const { rows } = await as(A, () =>
      db.query<{ name: string }>(`update public.users set name = 'Hector', timezone = 'America/Los_Angeles' where id = $1 returning name`, [A]),
    );
    expect(rows).toEqual([{ name: "Hector" }]);
    await expect(as(A, () => db.query(`update public.users set whop_user_id = 'user_B2' where id = $1`, [A]))).rejects.toThrow(/permission denied/);
    await expect(as(A, () => db.query(`update public.users set email = 'x@example.com' where id = $1`, [A]))).rejects.toThrow(/permission denied/);
    await expect(as(A, () => db.query(`insert into public.users (whop_user_id) values ('user_new')`))).rejects.toThrow(/permission denied/);
    // B's row is untouched by A's update attempts.
    const { rows: b } = await as("service", () => db.query<{ name: string | null }>(`select name from public.users where id = $1`, [B]));
    expect(b).toEqual([{ name: null }]);
  });

  it("enables RLS on every public table", async () => {
    const { rows } = await db.query<{ relname: string }>(
      `select c.relname from pg_class c join pg_namespace n on n.oid = c.relnamespace
       where n.nspname = 'public' and c.relkind = 'r' and not c.relrowsecurity`,
    );
    expect(rows).toEqual([]);
  });
});
