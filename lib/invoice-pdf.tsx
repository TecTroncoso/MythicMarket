import { Document, Page, Text, View, renderToBuffer } from "@react-pdf/renderer";
import { formatAmount, ORDER_STATUS_LABELS } from "@/lib/orders";
import type { Order } from "@/lib/db/schema";

interface InvoicePDFProps {
  order: Order;
  email: string;
}

export function renderInvoicePDF(order: Order, email: string): Promise<Buffer> {
  return renderToBuffer(<InvoicePDF order={order} email={email} />);
}

export function InvoicePDF({ order, email }: InvoicePDFProps) {
  const date = new Intl.DateTimeFormat("es-AR", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(order.createdAt);

  return (
    <Document>
      <Page
        size="A4"
        style={{
          padding: 40,
          fontFamily: "Helvetica",
          fontSize: 12,
          color: "#111827",
        }}
      >
        {/* Header */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            paddingBottom: 12,
            marginBottom: 24,
            borderBottomWidth: 2,
            borderBottomColor: "#111827",
          }}
        >
          <View>
            <Text style={{ fontSize: 18, fontWeight: "bold", color: "#0f172a" }}>
              MythicMarket
            </Text>
            <Text style={{ fontSize: 10, color: "#6b7280", marginTop: 2 }}>
              Mobile Legends: Bang Bang
            </Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={{ fontSize: 16, fontWeight: "bold", letterSpacing: 1 }}>
              FACTURA
            </Text>
            <Text style={{ fontSize: 10, color: "#6b7280", marginTop: 2 }}>
              Orden {order.orderNumber}
            </Text>
            <Text style={{ fontSize: 10, color: "#6b7280" }}>{date}</Text>
          </View>
        </View>

        {/* Customer */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{ fontSize: 10, fontWeight: "bold", color: "#6b7280", marginBottom: 4 }}>
            CLIENTE
          </Text>
          <Text>{email}</Text>
        </View>

        {/* Line items */}
        <View style={{ borderWidth: 1, borderColor: "#d1d5db", borderRadius: 4 }}>
          <View
            style={{
              flexDirection: "row",
              backgroundColor: "#f3f4f6",
              padding: 8,
              borderBottomWidth: 1,
              borderBottomColor: "#d1d5db",
            }}
          >
            <Text style={{ flex: 3, fontSize: 10, fontWeight: "bold" }}>PRODUCTO</Text>
            <Text style={{ flex: 2, fontSize: 10, fontWeight: "bold" }}>CUENTA MLBB</Text>
            <Text style={{ flex: 1, fontSize: 10, fontWeight: "bold", textAlign: "right" }}>
              IMPORTE
            </Text>
          </View>
          <View style={{ flexDirection: "row", padding: 8 }}>
            <View style={{ flex: 3 }}>
              <Text style={{ fontSize: 11 }}>{order.productName}</Text>
            </View>
            <View style={{ flex: 2 }}>
              <Text style={{ fontSize: 11 }}>{order.mlbbUserId}</Text>
              <Text style={{ fontSize: 9, color: "#6b7280" }}>Zona {order.zoneId}</Text>
            </View>
            <Text style={{ flex: 1, fontSize: 11, textAlign: "right" }}>
              {formatAmount(order.amountCents, order.currency)}
            </Text>
          </View>
        </View>

        {/* Total + status */}
        <View style={{ marginTop: 16, alignItems: "flex-end" }}>
          <View style={{ flexDirection: "row" }}>
            <Text style={{ fontSize: 14, fontWeight: "bold", marginRight: 24 }}>TOTAL</Text>
            <Text style={{ fontSize: 14, fontWeight: "bold" }}>
              {formatAmount(order.amountCents, order.currency)}
            </Text>
          </View>
          <Text style={{ fontSize: 10, color: "#6b7280", marginTop: 4 }}>
            Estado: {ORDER_STATUS_LABELS[order.status] ?? order.status}
          </Text>
        </View>

        {/* Footer */}
        <View
          style={{
            marginTop: 48,
            paddingTop: 12,
            borderTopWidth: 1,
            borderTopColor: "#e5e7eb",
          }}
        >
          <Text style={{ fontSize: 9, color: "#6b7280" }}>
            Gracias por tu compra. Ante cualquier consulta, respondemos por WhatsApp.
          </Text>
        </View>
      </Page>
    </Document>
  );
}