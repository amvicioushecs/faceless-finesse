import { serializeJsonLd } from "@/lib/json-ld";

/** Server-rendered JSON-LD (visible to crawlers that don't run JavaScript). */
export function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
    />
  );
}
