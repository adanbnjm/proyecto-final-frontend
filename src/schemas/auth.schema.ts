import { z } from "zod";

export const esquemaLogin = z.object({
  email: z.email("Ingresa un correo electrónico válido"),
  password: z.string().min(1, "La contraseña es obligatoria"),
});

export type DatosLogin = z.infer<typeof esquemaLogin>;

export const esquemaRegistro = z.object({
  nombre: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(100, "El nombre no puede superar los 100 caracteres"),

  celular: z
    .string()
    .min(7, "El celular debe tener al menos 7 caracteres")
    .max(20, "El celular no puede superar los 20 caracteres"),

  ci: z.union([z.string().min(1).max(30), z.literal("")]).optional(),

  email: z.email("Ingresa un correo electrónico válido"),

  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
});

export type DatosRegistro = z.infer<typeof esquemaRegistro>;
