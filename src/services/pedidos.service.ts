import api from "../lib/axios";

export interface DetallePedido {
  productoId: number;
  cantidad: number;
}

export interface DatosPedido {
  direccionId: number;
  detalles: DetallePedido[];
  origen: "WEB";
}
export interface DetallePedidoManual {
  productoId: number;
  cantidad: number;
}

export interface DatosPedidoManual {
  destinatario: string;
  celularDestinatario: string;
  departamento: string;
  ciudad: string;
  zona: string;
  calle: string;
  numero?: string;
  referencia?: string;
  detalles: DetallePedidoManual[];
  origen: "FACEBOOK" | "WHATSAPP" | "OTRO";
}

export interface ProductoPedido {
  id: number;
  codigo: string;
  nombre: string;
  descripcion: string | null;
  precioActual: number | string;
  stock: number;
  categoriaId: number;
}

export interface DetallePedidoCompleto {
  id: number;
  productoId: number;
  cantidad: number;
  precioUnitario: number | string;
  producto: ProductoPedido;
}

export interface DireccionPedido {
  id: number;
  departamento: string;
  ciudad: string;
  zona: string;
  calle: string;
  numero: string | null;
  referencia: string | null;
}

export interface PagoPedido {
  id: number;
  monto: number | string;
  moneda: "BOB" | "USD";
  estado: "PENDIENTE" | "APROBADO" | "RECHAZADO";
  referencia: string | null;
  creadoEn: string;
}

export interface ReservaPedido {
  id: number;
  creadaEn: string;
  expiraEn: string;
  estado: "ACTIVA" | "CONFIRMADA" | "EXPIRADA" | "CANCELADA";
}

export interface Pedido {
  id: number;
  usuarioId: number;
  direccionId: number | null;

  destinatario: string;
  celularDestinatario: string;

  departamento: string;
  ciudad: string;
  zona: string;
  calle: string;
  numero: string | null;
  referencia: string | null;
  referenciaEntrega: string | null;

  total: number | string;
  estado: "PENDIENTE" | "PAGADO" | "EN_TRANSITO" | "ENTREGADO" | "CANCELADO";
  origen: "WEB" | "FACEBOOK" | "WHATSAPP" | "OTRO";
  creadoEn: string;

  detalles: DetallePedidoCompleto[];
  reservas: ReservaPedido[];
  pagos: PagoPedido[];
  direccion: DireccionPedido | null;
}

export const crearPedido = async (datos: DatosPedido): Promise<Pedido> => {
  const respuesta = await api.post<{ pedido: Pedido }>("/pedidos", datos);
  return respuesta.data.pedido;
};

export const obtenerPedidos = async (): Promise<Pedido[]> => {
  const respuesta = await api.get<Pedido[]>("/pedidos");
  return respuesta.data;
};

export const cancelarPedido = async (pedidoId: number): Promise<void> => {
  await api.post(`/pedidos/${pedidoId}/cancelar`);
};

export const enviarPedido = async (pedidoId: number): Promise<void> => {
  await api.post(`/pedidos/${pedidoId}/enviar`);
};

export const entregarPedido = async (pedidoId: number): Promise<void> => {
  await api.post(`/pedidos/${pedidoId}/entregar`);
};

export const crearPedidoManual = async (
  datos: DatosPedidoManual,
): Promise<Pedido> => {
  const respuesta = await api.post<{ pedido: Pedido }>(
    "/pedidos/manual",
    datos,
  );

  return respuesta.data.pedido;
};
