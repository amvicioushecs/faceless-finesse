"use client";
import { createBrowserClient } from "@supabase/ssr";
import { parsePublicEnv } from "../env";
import type { Database } from "./types";

/**
 * Browser Supabase client (anon key). Used for Realtime job-status updates.
 * Row access is enforced by RLS (owner_id = auth.uid()).
 */
export function createSupabaseBrowserClient() {
  const env = parsePublicEnv();
  if (!env.NEXT_PUBLIC_SUPABASE_URL || !env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be set");
  }
  return createBrowserClient<Database>(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}
