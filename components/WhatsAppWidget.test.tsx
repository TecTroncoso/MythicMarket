// @vitest-environment happy-dom
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import {
  render,
  screen,
  fireEvent,
  cleanup,
  waitFor,
} from "@testing-library/react";
import {
  SUPPORT_FALLBACK_NUMBER,
  SUPPORT_PREFILLED_MESSAGE,
} from "@/lib/support-schedule";
import { WhatsAppWidget } from "./WhatsAppWidget";

const waUrl = (number: string) =>
  `https://wa.me/${number}?text=${encodeURIComponent(SUPPORT_PREFILLED_MESSAGE)}`;

const openSpy = () => vi.spyOn(window, "open").mockImplementation(() => null);

beforeEach(() => {
  vi.stubGlobal("fetch", vi.fn());
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  cleanup();
});

describe("WhatsAppWidget", () => {
  it("renders the floating button with the WhatsApp aria-label", () => {
    render(<WhatsAppWidget />);
    expect(
      screen.getByRole("button", { name: "Contactar por WhatsApp" })
    ).toBeInTheDocument();
  });

  it("opens wa.me with the on-duty number after a successful fetch", async () => {
    const open = openSpy();
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ number: "5491136799182", label: "A", isOpen: true }),
    });
    vi.stubGlobal("fetch", fetchMock);

    render(<WhatsAppWidget />);
    fireEvent.click(screen.getByRole("button", { name: "Contactar por WhatsApp" }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    expect(fetchMock).toHaveBeenCalledWith("/api/support/on-duty");

    await waitFor(() => expect(open).toHaveBeenCalledTimes(1));
    expect(open).toHaveBeenCalledWith(
      waUrl("5491136799182"),
      "_blank",
      "noopener,noreferrer"
    );
  });

  it("falls back to the fallback number when fetch fails", async () => {
    const open = openSpy();
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network down")));

    render(<WhatsAppWidget />);
    fireEvent.click(screen.getByRole("button", { name: "Contactar por WhatsApp" }));

    await waitFor(() => expect(open).toHaveBeenCalledTimes(1));
    expect(open).toHaveBeenCalledWith(
      waUrl(SUPPORT_FALLBACK_NUMBER),
      "_blank",
      "noopener,noreferrer"
    );
  });

  it("still opens wa.me when the response says isOpen is false", async () => {
    const open = openSpy();
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ number: "5491136799182", label: null, isOpen: false }),
      })
    );

    render(<WhatsAppWidget />);
    fireEvent.click(screen.getByRole("button", { name: "Contactar por WhatsApp" }));

    await waitFor(() => expect(open).toHaveBeenCalledTimes(1));
    expect(open).toHaveBeenCalledWith(
      waUrl("5491136799182"),
      "_blank",
      "noopener,noreferrer"
    );
  });
});