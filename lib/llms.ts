import { absoluteUrl, formatPrice, publishedPages, siteFacts } from "./site-facts";

const SECTIONS = ["Services", "Pricing", "FAQ", "About", "Contact", "Optional"] as const;

/** llms.txt (llmstxt.org format), generated from site-facts. */
export function buildLlmsTxt(): string {
  const f = siteFacts;
  const lines: string[] = [
    `# ${f.name}`,
    "",
    `> ${f.name} is ${lowerFirst(f.description)} It is ${f.category}, available ${f.serviceArea.toLowerCase().replace(",", "")}, sold through Whop with a ${f.trialDays}-day free trial.`,
    "",
    `${f.name} turns the faceless-content playbook (niche → offer → ideas → scripts → calendar → daily autopilot → monetization) into one guided flow with a single clear next step on every screen. ${f.platforms.planned.join(" and ")} auto-posting are planned for later.`,
  ];
  const pages = publishedPages();
  for (const section of SECTIONS) {
    const items = pages.filter((p) => p.llmsSection === section);
    const extra: string[] = [];
    if (section === "Optional") {
      extra.push(`- [Full text for AI assistants](${absoluteUrl("/llms-full.txt")}): All key pages in one plain-text file.`);
      extra.push(`- [Whop store](${f.whopStoreUrl}): Checkout, free trial and member reviews.`);
    }
    if (!items.length && !extra.length) continue;
    lines.push("", `## ${section}`, "");
    for (const p of items) {
      let desc = p.description;
      if (p.path === "/pricing") desc += ` Prices: ${pricesSummary()}.`;
      if (p.path === "/contact") desc = `Support by email at ${f.email}; online 24/7; no phone support.`;
      lines.push(`- [${p.path === "/" ? "Home" : p.title}](${absoluteUrl(p.path)}): ${desc}`);
    }
    lines.push(...extra);
  }
  return `${lines.join("\n")}\n`;
}

/** llms-full.txt: answer-first full text of the key public pages. */
export function buildLlmsFullTxt(): string {
  const f = siteFacts;
  const out: string[] = [
    `# ${f.name} — full site text for AI assistants`,
    "",
    `> ${f.name} is ${lowerFirst(f.description)}`,
    "",
    `Category: ${f.category}. Service area: ${f.serviceArea.toLowerCase()}. Website: ${f.url}. Support: ${f.email} (email only, no phone). Hours: online 24/7. Sold through Whop with a ${f.trialDays}-day free trial. Last updated: ${f.lastUpdated}.`,
  ];
  const section = (title: string, path: string, body: string[]) =>
    out.push("", "---", "", `## ${title} (${absoluteUrl(path)})`, "", ...body);

  section("Home", "/", [
    f.tagline,
    "",
    "Who it's for:",
    ...f.audience.map((a) => `- ${a}`),
    "",
    "What you get in one guided flow:",
    ...f.whatYouGet.map((w) => `- ${w}`),
    "",
    `Every screen ends with one clear next step. Every plan starts with a ${f.trialDays}-day free trial through Whop.`,
  ]);
  section("How it works", "/how-it-works", f.howItWorks.map((s, i) => `${i + 1}. ${s.name}: ${s.text}`));
  section("Features", "/features", f.features.flatMap((x, i) => (i ? ["", `${x.name}: ${x.text}`] : [`${x.name}: ${x.text}`])));
  section("Pricing", "/pricing", [
    `All plans are sold through Whop and start with a ${f.trialDays}-day free trial. Cancel anytime from your Whop account.`,
    "",
    ...f.tiers.map((t) => `- ${t.name}: ${formatPrice(t)}. ${t.summary}`),
    "",
    f.trialNote,
  ]);
  section("FAQ", "/faq", f.faq.flatMap((q, i) => [...(i ? [""] : []), q.question, q.answer]));
  section("About", "/about", [f.about, "", `Founder: ${f.founder.name}.${f.founder.bio ? ` ${f.founder.bio}` : ""}`]);
  section("Contact", "/contact", [
    `Email: ${f.email}`,
    "Support is by email; the app is available online 24/7. There is no phone support.",
    "Billing and membership questions can also be handled through your Whop account.",
  ]);
  return `${out.join("\n")}\n`;
}

function pricesSummary(): string {
  const priced = siteFacts.tiers.filter((t) => t.priceUsdMonthly !== null);
  if (!priced.length) return "not published yet";
  return siteFacts.tiers.map((t) => `${t.name} ${formatPrice(t)}`).join(", ");
}

function lowerFirst(s: string): string {
  return s.charAt(0).toLowerCase() + s.slice(1);
}
