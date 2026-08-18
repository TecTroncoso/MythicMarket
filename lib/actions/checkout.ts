"use server"

import { auth } from "@/auth"
import { CheckoutSchema } from "@/lib/validations"
import { checkoutRateLimiter } from "@/lib/rate-limit"
import { db } from "@/lib/db"
import { orders } from "@/lib/db/schema"
import { generateOrderNumber } from "@/lib/orders"
import { getProductById } from "@/lib/catalog"

export async function processCheckout(formData: FormData) {
  // 1. Verificar autenticación obligatoria
  const session = await auth()
  if (!session?.user) {
    return { error: "Debes iniciar sesión para realizar una compra." }
  }

  // 2. Extraer y validar datos de forma estricta con Zod
  const userId = formData.get("userId") as string
  const zoneId = formData.get("zoneId") as string
  const productId = formData.get("productId") as string

  const validatedFields = CheckoutSchema.safeParse({ userId, zoneId, productId })

  if (!validatedFields.success) {
    return { error: validatedFields.error.issues[0].message }
  }

  // 3. Verificar autoridad sobre el precio (el catálogo vive en lib/catalog.ts)
  const secureProduct = getProductById(productId)
  
  if (!secureProduct) {
    return { error: "El producto seleccionado no es válido o ya no existe." }
  }

  // 4. Rate Limiting por usuario
  const { success } = await checkoutRateLimiter.limit(session.user.id || session.user.email || 'guest')
  if (!success) {
    return { error: "Estás intentando crear demasiadas órdenes muy rápido. Espera un minuto." }
  }

  // 5. Registrar la orden en la base de datos
  const orderNumber = generateOrderNumber()
  try {
    await db.insert(orders).values({
      orderNumber,
      userId: session.user.id,
      productId,
      productName: secureProduct.name,
      amountCents: Math.round(secureProduct.price * 100),
      currency: "USD",
      mlbbUserId: userId,
      zoneId,
      status: "pending",
    })
  } catch (error) {
    console.error("Error al registrar la orden en la base de datos:", error)
    return { success: false, message: "No se pudo registrar la orden. Intentá de nuevo." }
  }

  // 6. Simulación de procesamiento de la orden
  try {
    // Aquí iría la integración con Lootbar, Stripe, PayPal, etc.
    // Usando `secureProduct.price` en vez de cualquier precio enviado por el cliente.
    
    console.log(`Procesando orden ${orderNumber} para ${session.user.email}: Producto ${secureProduct.name} ($${secureProduct.price}) a la cuenta MLBB ${userId}(${zoneId})`)
    
    // Simular un delay de API
    await new Promise(resolve => setTimeout(resolve, 1500))

    return { 
      success: true, 
      message: `¡Pedido confirmado! Tu número de orden es ${orderNumber}.`,
      orderNumber,
      redirectUrl: "/dashboard"
    }
  } catch (error) {
    console.error("Error al procesar el checkout:", error)
    return { error: "Hubo un error al procesar tu orden. Inténtalo de nuevo." }
  }
}
