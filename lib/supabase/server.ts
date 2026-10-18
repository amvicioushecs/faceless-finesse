import "server-only";
import { createClient } from "@supabase/supabase-js";
import { requireServerEnv } from "../env";
import type { Database } from "./types";

/**
 * User-scoped server client. `accessToken` is a Supabase-compatible JWT whose
 * `sub` is our internal `users.id`, minted after Whop verification (stage 2),
 * so RLS policies (`owner_id = auth.uid()`) apply to every query.
 */
export function createSupabaseUserClient(accessToken: string) {
  const env = requireServerEnv(["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY"]);
  return createClient<Database>(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/**
 * Service-role client. Bypasses RLS: only for webhooks and background jobs,
 * and every query must filter by owner explicitly (backend.md §2).
 */
export function createSupabaseAdminClient() {
  const env = requireServerEnv(["NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"]);
  return createClient<Database>(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
