import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
import { withWhopAppConfig } from "@whop/react/next.config";
import type { NextConfig } from "next";

const noindex = [{ key: "X-Robots-Tag", value: "noindex, nofollow" }];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    remotePatterns: [{ hostname: "**" }],
  },
  async headers() {
    // Whop app surfaces and the API are private (docs/plan/aeo.md §8).
    return [
      { source: "/experiences/:path*", headers: noindex },
      { source: "/dashboard/:path*", headers: noindex },
      { source: "/discover", headers: noindex },
      { source: "/api/:path*", headers: noindex },
    ];
  },
};

export default withWhopAppConfig(nextConfig);

// Exposes local Cloudflare bindings (R2, KV, ...) to `next dev`.
if (process.env.NODE_ENV === "development") {
  initOpenNextCloudflareForDev();
}
