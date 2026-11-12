import { z } from "zod";

export const esquemaProducto = z.object({
  codigo: z.string().min(1, "El código es obligatorio"),

  nombre: z.string().min(1, "El nombre es obligatorio"),

  descripcion: z.string().optional(),

  precioActual: z.number().min(0, "El precio no puede ser negativo"),

  costoAdquisicion: z.number().min(0, "El costo no puede ser negativo"),

  stock: z
    .number()
    .int("El stock debe ser un número entero")
    .min(0, "El stock no puede ser negativo"),

  activo: z.boolean().optional(),

  categoriaId: z
    .number()
    .int("Selecciona una categoría válida")
    .min(1, "Selecciona una categoría"),
});

export type DatosProducto = z.infer<typeof esquemaProducto>;
