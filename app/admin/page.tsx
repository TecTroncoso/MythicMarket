import Link from "next/link";
import { redirect } from "next/navigation";
import { ShieldCheck, PackageOpen, Search, Filter } from "lucide-react";
import { auth } from "@/auth";
import { Navbar } from "@/components/Navbar";
import { PRODUCTS } from "@/lib/catalog";
import { getAdminOrders, sanitizeAdminFilters } from "@/lib/admin-orders";
import { updateOrderStatus } from "@/lib/actions/admin";
import { formatAmount, ORDER_STATUS_LABELS } from "@/lib/orders";

export const metadata = {
  title: "Panel de Administración | Mythic Market",
};

const STATUS_BADGE_STYLES: Record<string, string> = {
  pending: "bg-amber-500/10 text-amber-400 border-amber-500/40",
  paid: "bg-green-500/10 text-green-400 border-green-500/40",
  cancelled: "bg-red-500/10 text-red-400 border-red-500/40",
};

const INPUT_STYLES =
  "bg-[#0a0f1a] border border-[#2a3441] rounded-lg px-3 py-2 text-sm text-gray-200 " +
  "placeholder:text-gray-600 focus:outline-none focus:border-[#ffaa00]/50 transition-colors";

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("es-AR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

interface StatsCardProps {
  label: string;
  value: string;
  valueClass?: string;
}

function StatsCard({ label, value, valueClass = "text-white" }: StatsCardProps) {
  return (
    <div className="bg-[#121824] rounded-2xl p-5 border border-[#1c2534] shadow-xl">
      <p className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-1">{label}</p>
      <p className={`text-2xl font-black ${valueClass}`}>{value}</p>
    </div>
  );
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    redirect("/");
  }

  const sp = await searchParams;
  const filters = sanitizeAdminFilters(sp);
  const { orders, stats } = await getAdminOrders(filters);

  // Form actions must resolve to void, while setOrderStatus returns a result
  // object consumed by tests — updateOrderStatus wraps it at module level.

  return (
    <main className="min-h-screen bg-[#0a0f1a] text-white font-sans pb-20">
      <Navbar session={session} />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-2 flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 text-[#ffaa00]" />
            Panel de Administración
          </h1>
          <p className="text-gray-400">Todas las compras de los usuarios</p>
        </header>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <StatsCard label="Órdenes" value={String(stats.totalCount)} />
          <StatsCard
            label="Monto total"
            value={formatAmount(stats.totalAmountCents, "USD")}
            valueClass="text-[#ffaa00]"
          />
          <StatsCard
            label="Pendientes"
            value={String(stats.pendingCount)}
            valueClass="text-amber-400"
          />
          <StatsCard label="Pagadas" value={String(stats.paidCount)} valueClass="text-green-400" />
          <StatsCard
            label="Canceladas"
            value={String(stats.cancelledCount)}
            valueClass="text-red-400"
          />
        </div>

        <form
          method="get"
          action="/admin"
          className="bg-[#121824] rounded-2xl p-5 border border-[#1c2534] shadow-xl mb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 items-end"
        >
          <label className="flex flex-col gap-1">
            <span className="text-xs uppercase tracking-wider text-gray-500 font-semibold">
              Estado
            </span>
            <select name="status" defaultValue={filters.status ?? ""} className={INPUT_STYLES}>
              <option value="">Todos</option>
              <option value="pending">Pendiente</option>
              <option value="paid">Pagada</option>
              <option value="cancelled">Cancelada</option>
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs uppercase tracking-wider text-gray-500 font-semibold">
              Producto
            </span>
            <select name="productId" defaultValue={filters.productId ?? ""} className={INPUT_STYLES}>
              <option value="">Todos</option>
              {PRODUCTS.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs uppercase tracking-wider text-gray-500 font-semibold">
              Fecha desde
            </span>
            <input type="date" name="from" defaultValue={filters.from ?? ""} className={INPUT_STYLES} />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs uppercase tracking-wider text-gray-500 font-semibold">
              Fecha hasta
            </span>
            <input type="date" name="to" defaultValue={filters.to ?? ""} className={INPUT_STYLES} />
          </label>
          <label className="flex flex-col gap-1 sm:col-span-2 lg:col-span-1">
            <span className="text-xs uppercase tracking-wider text-gray-500 font-semibold">
              Buscar
            </span>
            <input
              type="text"
              name="q"
              defaultValue={filters.q ?? ""}
              placeholder="Email, Nº orden o ID MLBB"
              className={INPUT_STYLES}
            />
          </label>
          <div className="flex gap-2">
            <button
              type="submit"
              className="inline-flex items-center gap-2 text-sm font-semibold bg-[#ffaa00] hover:bg-[#ffbf33] text-black px-4 py-2 rounded-lg transition-all"
            >
              <Filter className="w-4 h-4" />
              Filtrar
            </button>
            <Link
              href="/admin"
              className="inline-flex items-center gap-2 text-sm font-semibold bg-[#1c2534] hover:bg-[#2a3441] border border-[#2a3441] px-4 py-2 rounded-lg transition-all"
            >
              <Search className="w-4 h-4" />
              Limpiar
            </Link>
          </div>
        </form>

        {orders.length === 0 ? (
          <div className="bg-[#121824] rounded-2xl p-10 border border-[#1c2534] shadow-xl flex flex-col items-center text-center gap-4">
            <PackageOpen className="w-12 h-12 text-gray-600" />
            <p className="text-gray-400 font-medium">No hay órdenes que coincidan con los filtros.</p>
          </div>
        ) : (
          <div className="bg-[#121824] rounded-2xl border border-[#1c2534] shadow-xl overflow-x-auto">
            <table className="w-full text-sm min-w-[950px]">
              <thead>
                <tr className="border-b border-[#1c2534] text-left text-xs uppercase tracking-wider text-gray-500">
                  <th className="px-4 py-3 font-semibold">Fecha</th>
                  <th className="px-4 py-3 font-semibold">Orden</th>
                  <th className="px-4 py-3 font-semibold">Cliente</th>
                  <th className="px-4 py-3 font-semibold">Producto</th>
                  <th className="px-4 py-3 font-semibold">Cuenta MLBB</th>
                  <th className="px-4 py-3 font-semibold text-right">Importe</th>
                  <th className="px-4 py-3 font-semibold">Estado</th>
                  <th className="px-4 py-3 font-semibold">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b border-[#1c2534] last:border-0 hover:bg-[#0a0f1a]/50 transition-colors"
                  >
                    <td className="px-4 py-3 text-gray-400 whitespace-nowrap">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="px-4 py-3 font-mono text-[#ffaa00] whitespace-nowrap">
                      {order.orderNumber}
                    </td>
                    <td className="px-4 py-3 text-gray-300">{order.email}</td>
                    <td className="px-4 py-3 text-gray-300">{order.productName}</td>
                    <td className="px-4 py-3 text-gray-400 whitespace-nowrap">
                      <span className="font-mono text-gray-300">{order.mlbbUserId}</span> · Zona{" "}
                      <span className="font-mono text-gray-300">{order.zoneId}</span>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-[#ffaa00] whitespace-nowrap">
                      {formatAmount(order.amountCents, order.currency)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                          STATUS_BADGE_STYLES[order.status] ??
                          "bg-gray-500/10 text-gray-400 border-gray-500/40"
                        }`}
                      >
                        {ORDER_STATUS_LABELS[order.status] ?? order.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {order.status === "pending" && (
                        <div className="flex gap-2">
                          <form action={updateOrderStatus}>
                            <input type="hidden" name="orderId" value={order.id} />
                            <input type="hidden" name="status" value="paid" />
                            <button
                              type="submit"
                              className="text-xs font-semibold bg-green-500/10 text-green-400 border border-green-500/40 hover:bg-green-500/20 px-3 py-1.5 rounded-lg transition-colors"
                            >
                              Marcar pagada
                            </button>
                          </form>
                          <form action={updateOrderStatus}>
                            <input type="hidden" name="orderId" value={order.id} />
                            <input type="hidden" name="status" value="cancelled" />
                            <button
                              type="submit"
                              className="text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/40 hover:bg-red-500/20 px-3 py-1.5 rounded-lg transition-colors"
                            >
                              Cancelar
                            </button>
                          </form>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}