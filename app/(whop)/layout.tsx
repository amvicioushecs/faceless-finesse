import { Theme, WhopApp } from "@whop/react/components";
import type { Metadata } from "next";

// Whop app surfaces are private and never indexed (also sent X-Robots-Tag).
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default function WhopLayout({ children }: { children: React.ReactNode }) {
  // The iframe SDK needs the app ID. Without it (local build, CI) we still
  // render with the Frosted theme; pages then show "App not configured yet".
  if (!process.env.NEXT_PUBLIC_WHOP_APP_ID) return <Theme>{children}</Theme>;
  return <WhopApp>{children}</WhopApp>;
}
