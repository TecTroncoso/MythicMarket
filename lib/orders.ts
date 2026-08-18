import { randomInt } from "node:crypto";

// No ambiguous characters (no I, O, 0, 1) so order numbers are easy to
// read aloud and type from a screenshot or receipt.
const ORDER_NUMBER_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const ORDER_NUMBER_SUFFIX_LENGTH = 8;

export function generateOrderNumber(): string {
  let suffix = "";
  for (let i = 0; i < ORDER_NUMBER_SUFFIX_LENGTH; i++) {
    suffix += ORDER_NUMBER_ALPHABET[randomInt(ORDER_NUMBER_ALPHABET.length)];
  }
  return `MM-${suffix}`;
}

export function formatAmount(cents: number, currency: string): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency,
  }).format(cents / 100);
}

export const ORDER_STATUS_LABELS: Record<string, string> = {
  pending: "Pendiente",
  paid: "Pagada",
  cancelled: "Cancelada",
};