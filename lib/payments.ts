// Payment regions and method definitions shared by client and server.
// Pure module: no node: imports, no server-only imports — safe for both bundles.
// UI copy is neutral Spanish; currency conversion is a fixed simulation until a
// real FX provider is integrated.

import { formatAmount } from "@/lib/orders";

export type PaymentRegion = "eu" | "latam";

export interface PaymentMethodDef {
  id: string;
  label: string;
  description: string;
  needsField: boolean;
  fieldLabel?: string;
  fieldPlaceholder?: string;
  pattern?: string;
  patternHint?: string;
}

export interface PaymentRegionConfig {
  region: PaymentRegion;
  currency: "EUR" | "USD";
  symbol: string;
  methods: PaymentMethodDef[];
}

// Simulated fixed conversion rate until a real FX provider is integrated.
export const EUR_USD_RATE = 0.92;

const EU_COUNTRIES = new Set([
  "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "DE", "GR",
  "HU", "IE", "IT", "LV", "LT", "LU", "MT", "NL", "PL", "PT", "RO", "SK",
  "SI", "ES", "SE", "GB",
]);

const LATAM_COUNTRIES = new Set([
  "AR", "BO", "BR", "CL", "CO", "CR", "CU", "DO", "EC", "SV", "GT", "HN",
  "MX", "NI", "PA", "PY", "PE", "PR", "UY", "VE",
]);

export function countryToRegion(countryCode?: string | null): PaymentRegion {
  const code = countryCode?.trim().toUpperCase();
  if (code && EU_COUNTRIES.has(code)) return "eu";
  // Anything unknown or missing defaults to latam (the store's primary market).
  return "latam";
}

export const PAYMENT_REGIONS: Record<PaymentRegion, PaymentRegionConfig> = {
  eu: {
    region: "eu",
    currency: "EUR",
    symbol: "€",
    methods: [
      {
        id: "paypal",
        label: "PayPal",
        description: "Pagá con tu cuenta de PayPal al instante.",
        needsField: true,
        fieldLabel: "Email de PayPal",
        fieldPlaceholder: "tucorreo@ejemplo.com",
        pattern: "^\\S+@\\S+\\.\\S+$",
        patternHint: "Ingresá un email válido.",
      },
      {
        id: "card",
        label: "Tarjeta de crédito/débito",
        description: "Pagá con tarjeta VISA o Mastercard.",
        needsField: true,
        fieldLabel: "Número de tarjeta",
        fieldPlaceholder: "4111111111111111",
        pattern: "^\\d{13,19}$",
        patternHint: "Ingresá un número de tarjeta válido (13-19 dígitos).",
      },
      {
        id: "sepa",
        label: "SEPA (Transferencia)",
        description: "Transferí el importe a nuestra cuenta IBAN europea.",
        needsField: true,
        fieldLabel: "IBAN",
        fieldPlaceholder: "DE89370400440532013000",
        pattern: "^[A-Z]{2}\\d{2}[A-Z0-9]{10,30}$",
        patternHint: "Ingresá un IBAN válido.",
      },
      {
        id: "bizum",
        label: "Bizum",
        description: "Pagá desde la app de tu banco con tu teléfono.",
        needsField: true,
        fieldLabel: "Número de teléfono",
        fieldPlaceholder: "34600000000",
        pattern: "^\\+?\\d{9,12}$",
        patternHint: "Ingresá un teléfono válido (9-12 dígitos).",
      },
    ],
  },
  latam: {
    region: "latam",
    currency: "USD",
    symbol: "US$",
    methods: [
      {
        id: "mercadopago",
        label: "Mercado Pago",
        description: "Pagá con saldo, tarjeta o efectivo vía Mercado Pago.",
        needsField: true,
        fieldLabel: "Email de Mercado Pago",
        fieldPlaceholder: "tucorreo@ejemplo.com",
        pattern: "^\\S+@\\S+\\.\\S+$",
        patternHint: "Ingresá un email válido.",
      },
      {
        id: "paypal",
        label: "PayPal",
        description: "Pagá con tu cuenta de PayPal al instante.",
        needsField: true,
        fieldLabel: "Email de PayPal",
        fieldPlaceholder: "tucorreo@ejemplo.com",
        pattern: "^\\S+@\\S+\\.\\S+$",
        patternHint: "Ingresá un email válido.",
      },
      {
        id: "pix",
        label: "Pix",
        description: "Pagá al instante con el código Pix (Brasil).",
        needsField: true,
        fieldLabel: "Clave Pix",
        fieldPlaceholder: "email, CPF o clave aleatoria",
        pattern: "^\\S{1,40}$",
        patternHint: "Ingresá una clave Pix válida.",
      },
      {
        id: "oxxo",
        label: "OXXO",
        description: "Pagá en efectivo en cualquier tienda OXXO (México).",
        needsField: false,
      },
    ],
  },
};

export function getMethod(methodId: string): PaymentMethodDef | undefined {
  return (
    PAYMENT_REGIONS.eu.methods.find((m) => m.id === methodId) ??
    PAYMENT_REGIONS.latam.methods.find((m) => m.id === methodId)
  );
}

export function regionForMethod(methodId: string): PaymentRegion | undefined {
  if (PAYMENT_REGIONS.eu.methods.some((m) => m.id === methodId)) return "eu";
  if (PAYMENT_REGIONS.latam.methods.some((m) => m.id === methodId)) return "latam";
  return undefined;
}

export function validatePaymentDetail(methodId: string, detail: string): string | null {
  const method = getMethod(methodId);
  if (!method) return "El método de pago no es válido.";
  if (!method.needsField) return null;

  const trimmed = detail.trim();
  if (!trimmed) return method.patternHint ?? "Este campo es obligatorio.";
  if (method.pattern && !new RegExp(method.pattern).test(trimmed)) {
    return method.patternHint ?? "Este campo es obligatorio.";
  }
  return null;
}

export function convertPrice(usd: number, currency: "EUR" | "USD"): number {
  if (currency === "USD") return usd;
  return Math.round(usd * EUR_USD_RATE * 100) / 100;
}

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  paypal: "PayPal",
  card: "Tarjeta de crédito/débito",
  sepa: "SEPA (Transferencia)",
  bizum: "Bizum",
  mercadopago: "Mercado Pago",
  pix: "Pix",
  oxxo: "OXXO",
};

export function paymentInstructions(
  methodId: string,
  amount: number,
  currency: "EUR" | "USD",
  orderNumber: string
): string {
  const formatted = formatAmount(Math.round(amount * 100), currency);
  switch (methodId) {
    case "paypal":
      return "Te enviamos la solicitud a tu cuenta de PayPal.";
    case "card":
      return "La tarjeta será cobrada al confirmar el pago.";
    case "sepa":
      return `Transferí ${formatted} al IBAN ES12 3456 7890 1234 5678 90 usando la referencia ${orderNumber}.`;
    case "bizum":
      return "Aceptá la solicitud de pago en tu app bancaria.";
    case "mercadopago":
      return "Te enviamos el link de pago a tu email de Mercado Pago.";
    case "pix":
      return `Escaneá el código Pix que te mostramos al confirmar (referencia ${orderNumber}).`;
    case "oxxo":
      return `Pagá ${formatted} en efectivo en OXXO mostrando la referencia ${orderNumber}.`;
    default:
      return "Procesaremos tu pago por el método seleccionado.";
  }
}