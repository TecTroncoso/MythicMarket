"use server"

import { revalidatePath } from "next/cache"
import { eq } from "drizzle-orm"
import { auth } from "@/auth"
import { db } from "@/lib/db"
import { orders } from "@/lib/db/schema"

export async function setOrderStatus(
  formData: FormData
): Promise<{ error?: string; success?: boolean }> {
  // 1. Verificar autorización de administrador
  const session = await auth()
  if (!session?.user || session.user.role !== "admin") {
    return { error: "No autorizado." }
  }

  // 2. Extraer y validar los datos del formulario
  const orderId = formData.get("orderId")
  const status = formData.get("status")

  if (status !== "paid" && status !== "cancelled") {
    return { error: "El estado de la orden no es válido." }
  }

  if (typeof orderId !== "string" || orderId.length === 0) {
    return { error: "Falta el identificador de la orden." }
  }

  // 3. Actualizar el estado en la base de datos
  try {
    await db.update(orders).set({ status }).where(eq(orders.id, orderId))
  } catch (error) {
    console.error("Error al actualizar el estado de la orden:", error)
    return { error: "No se pudo actualizar la orden. Intentá de nuevo." }
  }

  // 4. Refrescar la vista del panel (los searchParams se conservan)
  revalidatePath("/admin")
  return { success: true }
}