import { z } from "zod";

export const RegisterSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  email: z.string().email("Correo electrónico inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

export const LoginSchema = z.object({
  email: z.string().email("Correo electrónico inválido"),
  password: z.string().min(1, "La contraseña es requerida"),
});

export const CheckoutSchema = z.object({
  userId: z.string()
    .min(5, "El User ID es inválido")
    .max(15, "El User ID es inválido")
    .regex(/^[0-9]+$/, "El User ID solo debe contener números"),
  zoneId: z.string()
    .min(3, "El Zone ID es inválido")
    .max(6, "El Zone ID es inválido")
    .regex(/^[0-9]+$/, "El Zone ID solo debe contener números"),
  productId: z.string().min(1, "Debes seleccionar un producto válido"),
});
