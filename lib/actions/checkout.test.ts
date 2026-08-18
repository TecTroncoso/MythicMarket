import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// ---------------------------------------------------------------------------
// Mocks: declared at module top so Vitest hoists them before imports.
// lib/orders (generateOrderNumber) stays REAL — it only needs node:crypto.
// ---------------------------------------------------------------------------

const mockAuth = vi.fn();
vi.mock("@/auth", () => ({
  auth: mockAuth,
}));

const mockCheckoutRateLimit = vi.fn();
vi.mock("@/lib/rate-limit", () => ({
  checkoutRateLimiter: { limit: mockCheckoutRateLimit },
  authRateLimiter: { limit: vi.fn() },
  mlbbLookupRateLimiter: { limit: vi.fn() },
}));

const mockInsertValues = vi.fn();
const mockInsert = vi.fn(() => ({ values: mockInsertValues }));
vi.mock("@/lib/db", () => ({
  db: {
    insert: mockInsert,
  },
}));

// Import after mocks.
const { processCheckout } = await import("./checkout");

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const fd = (obj: Record<string, string>): FormData => {
  const f = new FormData();
  for (const [k, v] of Object.entries(obj)) f.append(k, v);
  return f;
};

const validForm = () => fd({ userId: "12345678", zoneId: "10012", productId: "1" });

const setUser = (user: { id: string; email: string }) =>
  mockAuth.mockResolvedValueOnce({ user: { ...user, name: "Ana", role: "user" } });

beforeEach(() => {
  vi.clearAllMocks();
  mockAuth.mockResolvedValue({ user: { id: "u1", email: "ana@x.com", name: "Ana", role: "user" } });
  mockCheckoutRateLimit.mockResolvedValue({ success: true, reset: 0 });
  mockInsertValues.mockResolvedValue(undefined);
});

afterEach(() => {
  vi.useRealTimers();
});

// ---------------------------------------------------------------------------
// processCheckout()
// ---------------------------------------------------------------------------

describe("processCheckout()", () => {
  it("returns an auth error when there is no session", async () => {
    mockAuth.mockResolvedValueOnce(null);
    const result = await processCheckout(validForm());
    expect(result).toEqual({
      error: "Debes iniciar sesión para realizar una compra.",
    });
    expect(mockInsert).not.toHaveBeenCalled();
  });

  it("persists a pending order and returns success with the order number", async () => {
    vi.useFakeTimers();
    try {
      const promise = processCheckout(validForm());
      await vi.advanceTimersByTimeAsync(1500);
      const result = await promise;

      expect(result).toMatchObject({
        success: true,
        redirectUrl: "/dashboard",
      });
      expect(result.orderNumber).toMatch(/^MM-[A-HJ-NP-Z2-9]{8}$/);
      expect(result.message).toContain("Tu número de orden es");

      expect(mockInsert).toHaveBeenCalledTimes(1);
      const rowArg = mockInsertValues.mock.calls[0]?.[0];
      expect(rowArg).toMatchObject({
        orderNumber: result.orderNumber,
        userId: "u1",
        productId: "1",
        productName: "86 Diamonds",
        amountCents: 149,
        currency: "USD",
        mlbbUserId: "12345678",
        zoneId: "10012",
        status: "pending",
      });
    } finally {
      vi.useRealTimers();
    }
  });

  it("returns a friendly failure when the DB insert throws", async () => {
    mockInsertValues.mockRejectedValueOnce(new Error("db down"));
    const result = await processCheckout(validForm());
    expect(result).toEqual({
      success: false,
      message: "No se pudo registrar la orden. Intentá de nuevo.",
    });
    expect(mockInsert).toHaveBeenCalledTimes(1);
  });
});