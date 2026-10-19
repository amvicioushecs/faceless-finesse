// @vitest-environment jsdom
import { WhopIframeSdkContext } from "@whop/react/iframe";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { AccessGate, gateCopy } from "@/components/app/access-gate";
import { ChoosePlanButton } from "@/components/app/choose-plan-button";

type Sdk = NonNullable<React.ContextType<typeof WhopIframeSdkContext>>;

function withSdk(sdk: Partial<Sdk> | null, ui: ReactNode) {
  return <WhopIframeSdkContext.Provider value={sdk as Sdk | null}>{ui}</WhopIframeSdkContext.Provider>;
}

describe("paywall", () => {
  it("opens Whop in-app checkout for the plan inside Whop", async () => {
    const inAppPurchase = vi.fn().mockResolvedValue({ status: "error", error: "cancelled" });
    render(withSdk({ inAppPurchase } as never, <ChoosePlanButton planId="plan_123" storeUrl="https://whop.com/PLACEHOLDER" />));
    fireEvent.click(screen.getByRole("button", { name: "Choose a plan" }));
    await waitFor(() => expect(inAppPurchase).toHaveBeenCalledWith({ planId: "plan_123" }));
    expect(await screen.findByText(/Checkout didn't finish/)).toBeInTheDocument();
  });

  it("falls back to the Whop store page when no plan ID is set", async () => {
    const openExternalUrl = vi.fn().mockResolvedValue("ok");
    render(withSdk({ openExternalUrl } as never, <ChoosePlanButton planId={null} storeUrl="https://whop.com/faceless-finesse" />));
    fireEvent.click(screen.getByRole("button", { name: "Choose a plan" }));
    await waitFor(() => expect(openExternalUrl).toHaveBeenCalledWith({ url: "https://whop.com/faceless-finesse" }));
  });

  it("renders no button while both the plan ID and store URL are placeholders", () => {
    render(withSdk(null, <ChoosePlanButton planId={null} storeUrl="https://whop.com/PLACEHOLDER" />));
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("uses neutral copy for members without access and no alert role", () => {
    const { container } = render(withSdk(null, <AccessGate failure={{ ok: false, reason: "forbidden", access: { hasAccess: false, accessLevel: "no_access" } }} surface="member" />));
    expect(screen.getByRole("heading")).toHaveTextContent("Choose a plan to continue");
    expect(container.textContent).not.toMatch(/ended|renew/i);
    expect(container.querySelector('[role="alert"]')).toBeNull();
  });

  it("hides setup details from visitors in production", () => {
    const prod = gateCopy({ ok: false, reason: "not_configured" }, "member", true);
    expect(`${prod.title} ${prod.body}`).not.toMatch(/WHOP_|\.env/);
    const dev = gateCopy({ ok: false, reason: "not_configured" }, "member", false);
    expect(dev.body).toContain("WHOP_API_KEY");
  });
});
