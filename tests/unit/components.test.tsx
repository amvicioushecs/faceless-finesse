// @vitest-environment jsdom
import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { FaqList } from "@/components/marketing/faq-list";
import { PricingTable } from "@/components/marketing/pricing-table";
import { siteFacts } from "@/lib/site-facts";

describe("FaqList", () => {
  it("renders every question with its direct answer as plain HTML", () => {
    const { container } = render(<FaqList entries={siteFacts.faq} />);
    const terms = container.querySelectorAll("dt");
    expect(terms).toHaveLength(siteFacts.faq.length);
    expect(screen.getByText("Is there a free trial?").nextElementSibling).toHaveTextContent(
      "Yes, every plan starts with a 3-day free trial through Whop.",
    );
  });
});

describe("PricingTable", () => {
  it("shows all tiers, an honest unset price and the trial", () => {
    render(<PricingTable />);
    for (const t of siteFacts.tiers) {
      const card = screen.getByRole("heading", { name: t.name }).closest("li") as HTMLElement;
      expect(within(card).getByTestId(`price-${t.id}`)).toHaveTextContent("Price not published yet");
      expect(within(card).getByText(/3-day free trial/)).toBeInTheDocument();
    }
  });
});
