import { describe, it, expect, vi, beforeEach } from "vitest";

// ---------------------------------------------------------------------------
// Mocks: declared at module top so Vitest hoists them before imports.
// ---------------------------------------------------------------------------

const mockAuth = vi.fn();
vi.mock("@/auth", () => ({
  auth: mockAuth,
}));

const mockWhere = vi.fn();
const mockSet = vi.fn(() => ({ where: mockWhere }));
const mockUpdate = vi.fn(() => ({ set: mockSet }));
vi.mock("@/lib/db", () => ({
  db: { update: mockUpdate },
}));

const mockRevalidatePath = vi.fn();
vi.mock("next/cache", () => ({
  revalidatePath: mockRevalidatePath,
}));

// Import after mocks (dynamic, so the factory variables are initialized).
const { setOrderStatus } = await import("./admin");
import { orders } from "@/lib/db/schema";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const fd = (obj: Record<string, string>): FormData => {
  const f = new FormData();
  for (const [k, v] of Object.entries(obj)) f.append(k, v);
  return f;
};

const validForm = () => fd({ orderId: "o1", status: "paid" });

const setSession = (user: { id: string; email: string; role: "user" | "admin" } | null) =>
  mockAuth.mockResolvedValueOnce(user ? { user: { ...user, name: "Ana" } } : null);

beforeEach(() => {
  vi.clearAllMocks();
  mockAuth.mockResolvedValue({
    user: { id: "u1", email: "admin@x.com", name: "Admin", role: "admin" },
  });
  mockWhere.mockResolvedValue(undefined);
});

// ---------------------------------------------------------------------------
// setOrderStatus()
// ---------------------------------------------------------------------------

describe("setOrderStatus()", () => {
  it("returns an auth error when there is no session", async () => {
    setSession(null);
    const result = await setOrderStatus(validForm());
    expect(result).toEqual({ error: "No autorizado." });
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it("rejects non-admin users without touching the database", async () => {
    setSession({ id: "u2", email: "bob@x.com", role: "user" });
    const result = await setOrderStatus(validForm());
    expect(result).toEqual({ error: "No autorizado." });
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it("updates the order status and revalidates the admin page", async () => {
    const result = await setOrderStatus(validForm());

    expect(result).toEqual({ success: true });
    expect(mockUpdate).toHaveBeenCalledWith(orders);
    expect(mockSet).toHaveBeenCalledWith({ status: "paid" });
    expect(mockWhere).toHaveBeenCalledWith(expect.anything());
    expect(mockRevalidatePath).toHaveBeenCalledWith("/admin");
  });

  it("accepts the cancelled status", async () => {
    const result = await setOrderStatus(fd({ orderId: "o1", status: "cancelled" }));
    expect(result).toEqual({ success: true });
    expect(mockSet).toHaveBeenCalledWith({ status: "cancelled" });
  });

  it("rejects an invalid status value without touching the database", async () => {
    const result = await setOrderStatus(fd({ orderId: "o1", status: "shipped" }));
    expect(result).toEqual({ error: "El estado de la orden no es válido." });
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it("rejects a missing order id", async () => {
    const result = await setOrderStatus(fd({ status: "paid" }));
    expect(result).toEqual({ error: "Falta el identificador de la orden." });
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it("returns a friendly failure when the DB update throws", async () => {
    mockWhere.mockRejectedValueOnce(new Error("db down"));
    const result = await setOrderStatus(validForm());
    expect(result).toEqual({ error: "No se pudo actualizar la orden. Intentá de nuevo." });
    expect(mockUpdate).toHaveBeenCalledTimes(1);
  });
});