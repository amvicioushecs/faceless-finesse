import { expect, test } from "@playwright/test";

test("home page renders facts in HTML with valid JSON-LD", async ({ page }) => {
  const res = await page.goto("/");
  expect(res?.status()).toBe(200);
  await expect(page).toHaveTitle(/Faceless Finesse/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Faceless Finesse");
  await expect(page.getByText(/AI-guided web app that helps beginners/).first()).toBeVisible();

  const blocks = await page.locator('script[type="application/ld+json"]').allTextContents();
  const types = blocks.map((b) => JSON.parse(b)["@type"]);
  expect(types).toEqual(expect.arrayContaining(["Organization", "SoftwareApplication"]));

  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", /^https:\/\/facelessfinesse\.com\/?$/);
});

test("main navigation reaches pricing", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: "Pricing" }).click();
  await expect(page).toHaveURL(/\/pricing$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Pricing");
  await expect(page.getByText(/3-day free trial/).first()).toBeVisible();
});

test("AI discoverability files are served", async ({ request }) => {
  const llms = await request.get("/llms.txt");
  expect(llms.status()).toBe(200);
  expect(await llms.text()).toMatch(/^# Faceless Finesse\n/);

  const robots = await request.get("/robots.txt");
  expect(await robots.text()).toMatch(/^User-agent: GPTBot$/im);

  const sitemap = await request.get("/sitemap.xml");
  expect(await sitemap.text()).toContain("https://facelessfinesse.com/pricing");
});

test("Whop app and API paths are noindex", async ({ request }) => {
  for (const path of ["/experiences/exp_test", "/dashboard/biz_test", "/discover", "/api/health"]) {
    const res = await request.get(path);
    expect(res.headers()["x-robots-tag"], path).toContain("noindex");
  }
});

test("Whop app pages are gated outside Whop", async ({ request }) => {
  for (const path of ["/experiences/exp_test", "/dashboard/biz_test"]) {
    const html = await (await request.get(path)).text();
    expect(html, path).toMatch(/Open Faceless Finesse inside Whop|We&#x27;ll be right back|We'll be right back|App not configured yet/);
  }
});

test("Whop webhook rejects unconfigured or unsigned deliveries without a 2xx", async ({ request }) => {
  const res = await request.post("/api/v1/webhooks/whop", { data: "{}" });
  expect([401, 503]).toContain(res.status());
  const body = await res.json();
  expect(body.error).toMatchObject({ code: expect.any(String), details: null, requestId: expect.stringMatching(/^req_/) });
});
