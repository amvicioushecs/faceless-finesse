import type { FaqEntry } from "@/lib/site-facts";

/** FAQ in plain HTML: direct answer under each question (aeo.md §6). */
export function FaqList({ entries }: { entries: readonly FaqEntry[] }) {
  return (
    <dl className="flex flex-col gap-6">
      {entries.map((e) => (
        <div key={e.question}>
          <dt className="text-5 font-semibold text-gray-12">{e.question}</dt>
          <dd className="mt-1 text-3 text-gray-11">{e.answer}</dd>
        </div>
      ))}
    </dl>
  );
}
