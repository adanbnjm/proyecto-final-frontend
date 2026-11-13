import api from "../lib/axios";

export interface DetalleVenta {
  productoId: number;
  cantidad: number;
}

export interface DatosVenta {
  cajaId: number;
  metodoPago: "EFECTIVO" | "TARJETA" | "QR";
  detalles: DetalleVenta[];
}

export interface VentaRegistrada {
  id: number;
  cajaId: number;
  total: number | string;
  metodoPago: string;
  creadoEn: string;
}

interface RespuestaVenta {
  mensaje: string;
  venta: VentaRegistrada;
}
export type MetodoPago = "EFECTIVO" | "TARJETA" | "QR";

export const registrarVenta = async (
  datos: DatosVenta,
): Promise<RespuestaVenta> => {
  const respuesta = await api.post<RespuestaVenta>("/ventas", datos);
  return respuesta.data;
};

export interface ProductoVendido {
  id: number;
  nombre: string;
  codigo: string;
}

export interface DetalleVentaHistorial {
  id: number;
  ventaId: number;
  productoId: number;
  cantidad: number;
  precioUnitario: number | string;
  producto: ProductoVendido;
}

export interface VentaHistorial {
  id: number;
  cajaId: number;
  total: number | string;
  metodoPago: string;
  creadoEn: string;
  detalles: DetalleVentaHistorial[];
}

export const obtenerHistorialVentas = async (
  fecha: string,
): Promise<VentaHistorial[]> => {
  const respuesta = await api.get<VentaHistorial[]>("/ventas/historial", {
    params: { fecha },
  });

  return respuesta.data;
};
