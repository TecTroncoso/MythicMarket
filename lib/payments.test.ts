import { describe, it, expect } from "vitest";
import {
  BIZUM_RECIPIENT_PHONE,
  buildBizumComprobanteUrl,
  convertPrice,
  countryToRegion,
  getMethod,
  PAYMENT_METHOD_LABELS,
  PAYMENT_REGIONS,
  paymentInstructions,
  regionForMethod,
  validatePaymentDetail,
} from "./payments";
import { formatAmount } from "./orders";

describe("payment method logos", () => {
  it("every method in every region declares a local logo asset", () => {
    for (const region of Object.values(PAYMENT_REGIONS)) {
      for (const method of region.methods) {
        expect(method.logo, `${region.region}/${method.id}`).toBeTruthy();
        expect(method.logo, `${region.region}/${method.id}`).toMatch(/^\/logos\/.+\.svg$/);
      }
    }
  });
});

describe("countryToRegion", () => {
  it("maps EU country codes to 'eu'", () => {
    expect(countryToRegion("DE")).toBe("eu");
    expect(countryToRegion("ES")).toBe("eu");
    expect(countryToRegion("GB")).toBe("eu");
  });

  it("maps LatAm country codes to 'latam'", () => {
    expect(countryToRegion("AR")).toBe("latam");
    expect(countryToRegion("MX")).toBe("latam");
    expect(countryToRegion("BR")).toBe("latam");
  });

  it("is case-insensitive", () => {
    expect(countryToRegion("de")).toBe("eu");
    expect(countryToRegion("ar")).toBe("latam");
  });

  it("falls back to 'latam' for missing or unknown codes", () => {
    expect(countryToRegion(undefined)).toBe("latam");
    expect(countryToRegion(null)).toBe("latam");
    expect(countryToRegion("")).toBe("latam");
    expect(countryToRegion("US")).toBe("latam");
    expect(countryToRegion("JP")).toBe("latam");
    expect(countryToRegion("XX")).toBe("latam");
  });
});

describe("convertPrice", () => {
  it("passes USD through unchanged", () => {
    expect(convertPrice(1.49, "USD")).toBe(1.49);
    expect(convertPrice(9.99, "USD")).toBe(9.99);
  });

  it("converts USD to EUR at the simulated rate with 2-decimal rounding", () => {
    // 1.49 * 0.92 = 1.3708 -> round to 1.37; 9.99 * 0.92 = 9.1908 -> 9.19
    expect(convertPrice(1.49, "EUR")).toBe(1.37);
    expect(convertPrice(9.99, "EUR")).toBe(9.19);
  });
});

describe("getMethod / regionForMethod", () => {
  it("finds methods across both regions", () => {
    expect(getMethod("paypal")?.label).toBe("PayPal");
    expect(getMethod("card")?.label).toBe("Tarjeta de crédito/débito");
    expect(getMethod("sepa")?.label).toBe("SEPA (Transferencia)");
    expect(getMethod("bizum")?.label).toBe("Bizum");
    expect(getMethod("n26")?.label).toBe("N26");
    expect(getMethod("revolut")?.label).toBe("Revolut");
    expect(getMethod("mercadopago")?.label).toBe("Mercado Pago");
    expect(getMethod("pix")?.label).toBe("Pix");
    expect(getMethod("oxxo")?.label).toBe("OXXO");
  });

  it("returns undefined for unknown methods", () => {
    expect(getMethod("bitcoin")).toBeUndefined();
  });

  it("reports the region that owns each method", () => {
    expect(regionForMethod("paypal")).toBe("eu");
    expect(regionForMethod("sepa")).toBe("eu");
    expect(regionForMethod("mercadopago")).toBe("latam");
    expect(regionForMethod("pix")).toBe("latam");
    expect(regionForMethod("oxxo")).toBe("latam");
    expect(regionForMethod("bitcoin")).toBeUndefined();
  });
});

describe("validatePaymentDetail", () => {
  it("rejects unknown methods", () => {
    expect(validatePaymentDetail("bitcoin", "x")).toBe("El método de pago no es válido.");
  });

  it("validates paypal emails", () => {
    expect(validatePaymentDetail("paypal", "x")).toBe("Ingresá un email válido.");
    expect(validatePaymentDetail("paypal", "a@b.co")).toBeNull();
  });

  it("validates card numbers (13-19 digits)", () => {
    expect(validatePaymentDetail("card", "411111111111")).toBe(
      "Ingresá un número de tarjeta válido (13-19 dígitos)."
    );
    expect(validatePaymentDetail("card", "4111111111111111")).toBeNull();
  });

  it("validates IBANs", () => {
    expect(validatePaymentDetail("sepa", "DE89370400440532013000")).toBeNull();
    expect(validatePaymentDetail("sepa", "1234")).toBe("Ingresá un IBAN válido.");
  });

  it("validates n26 and revolut IBANs", () => {
    expect(validatePaymentDetail("n26", "DE89370400440532013000")).toBeNull();
    expect(validatePaymentDetail("n26", "1234")).toBe("Ingresá un IBAN válido.");
    expect(validatePaymentDetail("revolut", "DE89370400440532013000")).toBeNull();
    expect(validatePaymentDetail("revolut", "1234")).toBe("Ingresá un IBAN válido.");
  });

  it("validates phone numbers for bizum", () => {
    expect(validatePaymentDetail("bizum", "34600000000")).toBeNull();
    expect(validatePaymentDetail("bizum", "123")).toBe("Ingresá un teléfono válido (9-12 dígitos).");
  });

  it("validates pix keys", () => {
    expect(validatePaymentDetail("pix", "clave")).toBeNull();
    expect(validatePaymentDetail("pix", "")).toBe("Ingresá una clave Pix válida.");
  });

  it("accepts oxxo without any detail (no field needed)", () => {
    expect(validatePaymentDetail("oxxo", "")).toBeNull();
  });

  it("trims the detail before validating", () => {
    expect(validatePaymentDetail("paypal", "  a@b.co  ")).toBeNull();
    expect(validatePaymentDetail("paypal", "  x  ")).toBe("Ingresá un email válido.");
  });
});

describe("PAYMENT_METHOD_LABELS", () => {
  it("labels all nine methods for the admin table", () => {
    expect(Object.keys(PAYMENT_METHOD_LABELS)).toHaveLength(9);
    expect(PAYMENT_METHOD_LABELS.paypal).toBe("PayPal");
    expect(PAYMENT_METHOD_LABELS.n26).toBe("N26");
    expect(PAYMENT_METHOD_LABELS.revolut).toBe("Revolut");
    expect(PAYMENT_METHOD_LABELS.mercadopago).toBe("Mercado Pago");
    expect(PAYMENT_METHOD_LABELS.oxxo).toBe("OXXO");
  });
});

describe("paymentInstructions", () => {
  it("embeds the order number in sepa instructions", () => {
    const out = paymentInstructions("sepa", 1.37, "EUR", "MM-ABC12345");
    expect(out).toContain("MM-ABC12345");
    expect(out).toContain("IBAN");
  });

  it("embeds the formatted amount in oxxo instructions", () => {
    const out = paymentInstructions("oxxo", 9.19, "USD", "MM-XYZ78901");
    expect(out).toContain(formatAmount(919, "USD"));
    expect(out).toContain("MM-XYZ78901");
  });

  it("embeds the method name and reference in n26 and revolut instructions", () => {
    const n26 = paymentInstructions("n26", 1.37, "EUR", "ABC123");
    expect(n26).toContain("N26");
    expect(n26).toContain("ABC123");
    const revolut = paymentInstructions("revolut", 1.37, "EUR", "ABC123");
    expect(revolut).toContain("Revolut");
    expect(revolut).toContain("ABC123");
  });

  it("returns a generic message for unknown methods", () => {
    expect(paymentInstructions("bitcoin", 1, "USD", "MM-X")).toBe(
      "Procesaremos tu pago por el método seleccionado."
    );
  });
});

describe("buildBizumComprobanteUrl", () => {
  it("builds a wa.me link whose decoded text carries the receipt details", () => {
    const url = buildBizumComprobanteUrl({
      orderNumber: "MM-ABC12345",
      productName: "172 Diamonds",
      amountCents: 137,
      currency: "EUR",
      mlbbUserId: "12345678",
      zoneId: "10012",
      buyerPhone: "34600000000",
      buyerName: "Juan Pérez",
      methodLabel: "Bizum",
    });

    expect(url.startsWith(`https://wa.me/${BIZUM_RECIPIENT_PHONE}?text=`)).toBe(true);
    const text = decodeURIComponent(url.split("?text=")[1]);
    expect(text).toContain("MM-ABC12345");
    expect(text).toContain("172 Diamonds");
    expect(text).toContain(formatAmount(137, "EUR"));
    expect(text).toContain("34600000000");
    expect(text).toContain("Juan Pérez");
    expect(text).toContain("Método: Bizum.");
  });
});