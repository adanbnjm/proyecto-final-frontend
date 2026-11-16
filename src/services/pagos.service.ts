import api from "../lib/axios";

export interface Pago {
  id: number;
  pedidoId: number;
  monto: number | string;
  moneda: "BOB" | "USD";
  estado: "PENDIENTE" | "APROBADO" | "RECHAZADO";
  referencia: string;
  creadoEn: string;
}

export interface RespuestaCrearPago {
  mensaje: string;
  pago: Pago;
  checkoutUrl: string;
}

export const crearPago = async (
  pedidoId: number,
  moneda: "BOB" | "USD",
): Promise<RespuestaCrearPago> => {
  const respuesta = await api.post<RespuestaCrearPago>(
    `/pagos/pedido/${pedidoId}`,
    { moneda },
  );

  return respuesta.data;
};

export const aprobarPago = async (pagoId: number): Promise<void> => {
  await api.post(`/pagos/${pagoId}/aprobar`);
};
