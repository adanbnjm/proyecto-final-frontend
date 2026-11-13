import api from "../lib/axios";

export interface Caja {
  id: number;
  usuarioId: number;
  montoApertura: number | string;
  fechaApertura: string;
}

interface RespuestaAbrirCaja {
  mensaje: string;
  caja: Caja;
}

export const abrirCaja = async (
  montoApertura: number,
): Promise<RespuestaAbrirCaja> => {
  const respuesta = await api.post<RespuestaAbrirCaja>("/cajas/abrir", {
    montoApertura,
  });

  return respuesta.data;
};

export const obtenerCajaAbierta = async (): Promise<Caja | null> => {
  const respuesta = await api.get<Caja | null>("/cajas/abierta");
  return respuesta.data;
};
