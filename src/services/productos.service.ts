import api from "../lib/axios";
import type { DatosProducto } from "../schemas/producto.schema";

export interface Producto {
  id: number;
  codigo: string;
  nombre: string;
  descripcion: string;
  precioActual: number | string;
  stock: number;
  categoriaId: number;
}

export const obtenerCatalogo = async (): Promise<Producto[]> => {
  const respuesta = await api.get<Producto[]>("/productos/catalogo");

  return respuesta.data;
};
export interface ProductoAdministrativo extends Producto {
  costoAdquisicion: number | string;
  activo: boolean;
}

export const obtenerProductosAdministrativos = async (): Promise<
  ProductoAdministrativo[]
> => {
  const respuesta = await api.get<ProductoAdministrativo[]>("/productos");

  return respuesta.data;
};
export const crearProducto = async (
  datos: DatosProducto,
): Promise<ProductoAdministrativo> => {
  const respuesta = await api.post<ProductoAdministrativo>("/productos", datos);

  return respuesta.data;
};
export const actualizarProducto = async (
  id: number,
  datos: Partial<DatosProducto>,
): Promise<ProductoAdministrativo> => {
  const respuesta = await api.patch<ProductoAdministrativo>(
    `/productos/${id}`,
    datos,
  );

  return respuesta.data;
};

export const desactivarProducto = async (id: number): Promise<void> => {
  await api.delete(`/productos/${id}`);
};
