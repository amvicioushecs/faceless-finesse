import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// Stage 1: no incremental cache override (public pages are fully static).
// Once the R2 bucket exists, switch to:
//   import r2IncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache";
//   export default defineCloudflareConfig({ incrementalCache: r2IncrementalCache });
export default defineCloudflareConfig({});
