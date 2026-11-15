import api from "../lib/axios";

export interface Caja {
  id: number;
  usuarioId: number;
  montoApertura: number | string;
  fechaApertura: string;
}

export interface ConciliacionCaja {
  montoApertura: number;
  totalVentas: number;
  totalEfectivo: number;
  totalTarjeta: number;
  totalQR: number;
  efectivoEsperado: number;
  efectivoReportado: number;
  diferencia: number;
}

interface RespuestaAbrirCaja {
  mensaje: string;
  caja: Caja;
}

interface RespuestaCerrarCaja {
  mensaje: string;
  caja: Caja;
  conciliacion: ConciliacionCaja;
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

export const cerrarCaja = async (
  cajaId: number,
  montoCierre: number,
): Promise<RespuestaCerrarCaja> => {
  const respuesta = await api.post<RespuestaCerrarCaja>(
    `/cajas/${cajaId}/cerrar`,
    { montoCierre },
  );

  return respuesta.data;
};
