// @vitest-environment happy-dom
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { render, screen, fireEvent, cleanup, act } from "@testing-library/react";

// The component imports the `processCheckout` server action, which transitively
// pulls in next-auth + next/server. Those imports fail under happy-dom. Since the
// lookup tests do not exercise checkout submission, we stub the action entirely.
vi.mock("@/lib/actions/checkout", () => ({
  processCheckout: vi.fn(async () => ({ success: false, message: "" })),
}));

import { CheckoutSection } from "./CheckoutSection";

const SUCCESS_RESPONSE = (nickname: string, country: string) => ({
  ok: true,
  status: 200,
  json: async () => ({
    success: true,
    data: { userId: "12345678", zoneId: "10012", nickname, country, cached: false },
  }),
});

const FAILURE_RESPONSE = {
  ok: true,
  status: 200,
  json: async () => ({ success: false, error: "LOOKUP_FAILED" }),
};

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  cleanup();
});

const userIdInput = () => screen.getByPlaceholderText("Ej. 12345678") as HTMLInputElement;
const zoneIdInput = () => screen.getByPlaceholderText("Ej. (1234)") as HTMLInputElement;

// `act` flushes pending React state updates triggered inside the callback.
// Under fake timers, advancing time fires the debounce callback which awaits
// fetch + json parsing; the resulting setState must run inside `act` to commit
// before the test makes assertions.
async function flush(ms: number) {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(ms);
  });
}

async function typeValid() {
  fireEvent.change(userIdInput(), { target: { value: "12345678" } });
  fireEvent.change(zoneIdInput(), { target: { value: "10012" } });
  await flush(300);
}

describe("CheckoutSection MLBB lookup UX", () => {
  it("renders without nickname initially (idle state)", () => {
    render(<CheckoutSection isLoggedIn={false} />);
    expect(screen.queryByText(/Verificando jugador/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/No pudimos verificar el nickname/i)).not.toBeInTheDocument();
  });

  it("types userId+zoneId, after 300ms shows loading then success", async () => {
    const fetchMock = vi.fn().mockResolvedValue(SUCCESS_RESPONSE("*Legend__gamer*", "PH"));
    vi.stubGlobal("fetch", fetchMock);

    render(<CheckoutSection isLoggedIn={false} />);
    await typeValid();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/mlbb/lookup",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ userId: "12345678", zoneId: "10012" }),
      }),
    );

    expect(screen.getByText("*Legend__gamer*")).toBeInTheDocument();
    expect(screen.getByText("(PH)")).toBeInTheDocument();
  });

  it("types invalid userId, does not fire lookup", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    render(<CheckoutSection isLoggedIn={false} />);
    fireEvent.change(userIdInput(), { target: { value: "abc" } });
    fireEvent.change(zoneIdInput(), { target: { value: "10012" } });

    await flush(500);

    expect(fetchMock).not.toHaveBeenCalled();
    expect(screen.queryByText(/Verificando jugador/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/No pudimos verificar el nickname/i)).not.toBeInTheDocument();
  });

  it("types valid input, mock returns failure, shows warning", async () => {
    const fetchMock = vi.fn().mockResolvedValue(FAILURE_RESPONSE);
    vi.stubGlobal("fetch", fetchMock);

    render(<CheckoutSection isLoggedIn={false} />);
    await typeValid();

    const status = screen.getByText(/No pudimos verificar el nickname/i);
    expect(status).toBeInTheDocument();
    expect(status.getAttribute("role")).toBe("status");
  });

  it("submit button is enabled in all states (idle, loading, success, warning)", async () => {
    const fetchSuccess = vi.fn().mockResolvedValue(SUCCESS_RESPONSE("Hero", "PH"));
    const fetchFail = vi.fn().mockResolvedValue(FAILURE_RESPONSE);

    // ---- IDLE: select product, no input typed → button present, enabled
    const { unmount } = render(<CheckoutSection isLoggedIn={true} />);
    fireEvent.click(screen.getByText(/172 Diamonds/));
    const idleButton = screen.getByRole("button", { name: /Comprar Ahora/i }) as HTMLButtonElement;
    expect(idleButton.disabled).toBe(false);
    unmount();

    // ---- LOADING: fetch is pending (we never resolve), button enabled
    const fetchPending = vi.fn().mockReturnValue(new Promise(() => {}));
    vi.stubGlobal("fetch", fetchPending);
    const { unmount: unmountLoading } = render(<CheckoutSection isLoggedIn={true} />);
    fireEvent.click(screen.getByText(/172 Diamonds/));
    fireEvent.change(userIdInput(), { target: { value: "12345678" } });
    fireEvent.change(zoneIdInput(), { target: { value: "10012" } });
    // Advance only 1ms past debounce so the timer fires but the pending fetch
    // never resolves → we stay in `loading`.
    await flush(301);
    expect(screen.getByText(/Verificando jugador/i)).toBeInTheDocument();
    const loadingButton = screen.getByRole("button", {
      name: /Comprar Ahora|Procesando/i,
    }) as HTMLButtonElement;
    expect(loadingButton.disabled).toBe(false);
    unmountLoading();
    vi.unstubAllGlobals();

    // ---- SUCCESS
    vi.stubGlobal("fetch", fetchSuccess);
    const { unmount: unmountSuccess } = render(<CheckoutSection isLoggedIn={true} />);
    fireEvent.click(screen.getByText(/172 Diamonds/));
    await typeValid();
    expect(screen.getByText("Hero")).toBeInTheDocument();
    const successButton = screen.getByRole("button", { name: /Comprar Ahora/i }) as HTMLButtonElement;
    expect(successButton.disabled).toBe(false);
    unmountSuccess();
    vi.unstubAllGlobals();

    // ---- WARNING
    vi.stubGlobal("fetch", fetchFail);
    render(<CheckoutSection isLoggedIn={true} />);
    fireEvent.click(screen.getByText(/172 Diamonds/));
    await typeValid();
    expect(screen.getByText(/No pudimos verificar el nickname/i)).toBeInTheDocument();
    const warningButton = screen.getByRole("button", { name: /Comprar Ahora/i }) as HTMLButtonElement;
    expect(warningButton.disabled).toBe(false);
  });

  it("successful checkout alerts the confirmation and navigates to /dashboard", async () => {
    const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});
    // Record the navigation target; getter keeps a valid absolute base URL so
    // next/image can still resolve image sources during render (happy-dom's
    // real Location.href setter rejects relative paths).
    const locationSetter = vi.fn();
    Object.defineProperty(window, "location", {
      configurable: true,
      value: {
        get href() {
          return "http://localhost/";
        },
        set href(value: string) {
          locationSetter(value);
        },
      },
    });

    const { processCheckout } = await import("@/lib/actions/checkout");
    vi.mocked(processCheckout).mockResolvedValueOnce({
      success: true,
      message: "¡Pedido confirmado! Tu número de orden es MM-TEST1234.",
      orderNumber: "MM-TEST1234",
      redirectUrl: "/dashboard",
    });

    render(<CheckoutSection isLoggedIn={true} />);
    fireEvent.click(screen.getByText(/172 Diamonds/));
    fireEvent.change(userIdInput(), { target: { value: "12345678" } });
    fireEvent.change(zoneIdInput(), { target: { value: "10012" } });
    fireEvent.click(screen.getByRole("button", { name: /Comprar Ahora/i }));

    // Flush the async transition (mock resolves immediately, no timers needed).
    await act(async () => {});

    expect(alertSpy).toHaveBeenCalledWith(
      "¡Pedido confirmado! Tu número de orden es MM-TEST1234."
    );
    expect(locationSetter).toHaveBeenCalledWith("/dashboard");
    alertSpy.mockRestore();
  });
});
