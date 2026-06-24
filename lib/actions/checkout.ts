"use server"

import { auth } from "@/auth"
import { CheckoutSchema } from "@/lib/validations"
import { checkoutRateLimiter } from "@/lib/rate-limit"

const SERVER_PRODUCTS = {
  '1': { name: '86 Diamonds', price: 1.49 },
  '2': { name: '172 Diamonds', price: 2.99 },
  '3': { name: '257 Diamonds', price: 4.49 },
  '4': { name: '429 Diamonds', price: 7.49 },
  '5': { name: '706 Diamonds', price: 11.99 },
  '6': { name: '2195 Diamonds', price: 34.99 },
  '7': { name: 'Twilight Pass', price: 9.99 },
  '8': { name: 'Weekly Diamond Pass', price: 1.99 },
}

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
    return { error: validatedFields.error.errors[0].message }
  }

  // 3. Verificar autoridad sobre el precio
  const secureProduct = SERVER_PRODUCTS[productId as keyof typeof SERVER_PRODUCTS]
  
  if (!secureProduct) {
    return { error: "El producto seleccionado no es válido o ya no existe." }
  }

  // 4. Rate Limiting por usuario
  const { success } = await checkoutRateLimiter.limit(session.user.id || session.user.email || 'guest')
  if (!success) {
    return { error: "Estás intentando crear demasiadas órdenes muy rápido. Espera un minuto." }
  }

  // 5. Simulación de creación de orden
  try {
    // Aquí iría la integración con Lootbar, Stripe, PayPal, etc.
    // Usando `secureProduct.price` en vez de cualquier precio enviado por el cliente.
    
    console.log(`Procesando orden para ${session.user.email}: Producto ${secureProduct.name} ($${secureProduct.price}) a la cuenta MLBB ${userId}(${zoneId})`)
    
    // Simular un delay de API
    await new Promise(resolve => setTimeout(resolve, 1500))

    return { 
      success: true, 
      message: "Orden generada con éxito. Redirigiendo a la pasarela...",
      redirectUrl: "/checkout/gateway-simulation" // Esto redirigiría a la URL de pago real
    }
  } catch (error) {
    console.error("Error al procesar el checkout:", error)
    return { error: "Hubo un error al procesar tu orden. Inténtalo de nuevo." }
  }
}
