import "server-only";
import { EnvError } from "../env";
import { authorizeCompanyAdmin, authorizeExperience } from "./whop-auth";

/** Wraps authorization so missing Whop config renders a clear message instead of a 500. */
export async function guard(kind: "experience" | "company", id: string) {
  try {
    return kind === "experience" ? await authorizeExperience(id) : await authorizeCompanyAdmin(id);
  } catch (err) {
    if (err instanceof EnvError) return { ok: false as const, reason: "not_configured" as const };
    throw err;
  }
}
