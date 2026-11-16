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

// Datos para la supervisión administrativa

export interface ProductoCaja {
  id: number;
  nombre: string;
  codigo: string;
}

export interface DetalleVentaCaja {
  id: number;
  ventaId: number;
  productoId: number;
  cantidad: number;
  precioUnitario: number | string;
  producto: ProductoCaja;
}

export interface VentaCaja {
  id: number;
  cajaId: number;
  total: number | string;
  metodoPago: string;
  creadoEn: string;
  detalles: DetalleVentaCaja[];
}

export interface MovimientoCaja {
  id: number;
  cajaId: number;
  solicitadoPor: number;
  autorizadoPor: number | null;
  tipo: string;
  monto: number | string;
  motivo: string;
  estado: string;
  creadoEn: string;
  solicitante: {
    id: number;
    nombre: string;
  };
  autorizador: {
    id: number;
    nombre: string;
  } | null;
}

export interface CajaSupervision {
  id: number;
  usuarioId: number;
  montoApertura: number | string;
  montoCierre: number | string | null;
  fechaApertura: string;
  fechaCierre: string | null;
  usuario: {
    id: number;
    nombre: string;
    celular: string;
    email: string | null;
  };
  ventas: VentaCaja[];
  movimientos: MovimientoCaja[];
}
export interface RespuestaCajasPaginadas {
  datos: CajaSupervision[];
  paginacion: {
    total: number;
    pagina: number;
    limite: number;
    totalPaginas: number;
  };
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

// Consulta global disponible únicamente para ADMIN

export const obtenerTodasLasCajas = async (
  filtros: {
    pagina?: number;
    limite?: number;
    estado?: "ABIERTA" | "CERRADA";
    usuarioId?: number;
    desde?: string;
    hasta?: string;
    nombreUsuario?: string;
  } = {},
): Promise<RespuestaCajasPaginadas> => {
  const respuesta = await api.get<RespuestaCajasPaginadas>("/cajas", {
    params: filtros,
  });

  return respuesta.data;
};
