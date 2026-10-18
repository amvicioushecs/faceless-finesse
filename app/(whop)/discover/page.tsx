import { siteFacts } from "@/lib/site-facts";

// Whop Discover listing. Only real facts: no invented stats or testimonials.
export default function DiscoverPage() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-16">
      <h1 className="text-8 font-bold text-gray-12">{siteFacts.name}</h1>
      <p className="text-5 text-gray-12">{siteFacts.description}</p>
      <ul className="list-disc pl-5 text-3 text-gray-11">
        {siteFacts.whatYouGet.map((w) => (
          <li key={w}>{w}</li>
        ))}
      </ul>
      <p className="text-3 text-gray-11">Every plan starts with a {siteFacts.trialDays}-day free trial.</p>
    </div>
  );
}
