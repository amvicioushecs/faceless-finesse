import type { Metadata, Viewport } from "next";
import { siteFacts } from "@/lib/site-facts";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteFacts.url),
  title: { default: siteFacts.name, template: `%s · ${siteFacts.name}` },
  description: siteFacts.description,
  applicationName: siteFacts.name,
  openGraph: { siteName: siteFacts.name, type: "website" },
  // Switch to summary_large_image once an OG share image ships.
  twitter: { card: "summary" },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">{children}</body>
    </html>
  );
}
