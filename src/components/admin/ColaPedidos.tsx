import type { Pedido } from "../../services/pedidos.service";

interface Props {
  pedidos: Pedido[];
  cargando: boolean;
  error: string;
  mensaje: string;
  pedidoProcesando: number | null;
  onEnviar: (pedidoId: number) => void;
  onEntregar: (pedidoId: number) => void;
  onConfirmarPago: (pedidoId: number, pagoId: number) => void;
}

const obtenerClaseEstado = (estado: Pedido["estado"]) => {
  const clases = {
    PENDIENTE: "bg-yellow-100 text-yellow-800",
    PAGADO: "bg-green-100 text-green-800",
    EN_TRANSITO: "bg-blue-100 text-blue-800",
    ENTREGADO: "bg-gray-100 text-gray-700",
    CANCELADO: "bg-red-100 text-red-800",
  };

  return clases[estado];
};

const obtenerNombreOrigen = (origen: Pedido["origen"]) => {
  const nombres = {
    WEB: "Tienda web",
    FACEBOOK: "Facebook",
    WHATSAPP: "WhatsApp",
    OTRO: "Otro",
  };

  return nombres[origen];
};

export default function ColaPedidos({
  pedidos,
  cargando,
  error,
  mensaje,
  pedidoProcesando,
  onEnviar,
  onEntregar,
  onConfirmarPago,
}: Props) {
  return (
    <section className="overflow-hidden rounded-xl bg-white shadow">
      <div className="border-b border-gray-100 p-6">
        <h2 className="text-xl font-bold text-gray-900">Cola de pedidos</h2>

        <p className="mt-1 text-sm text-gray-600">
          Seguimiento de pedidos de la tienda y ventas por redes sociales.
        </p>
      </div>

      {mensaje && (
        <p className="m-6 rounded-lg bg-green-50 p-4 text-green-700">
          {mensaje}
        </p>
      )}

      {error && (
        <p className="m-6 rounded-lg bg-red-50 p-4 text-red-700">{error}</p>
      )}

      {cargando ? (
        <p className="p-6 text-gray-600">Cargando pedidos...</p>
      ) : pedidos.length === 0 ? (
        <p className="p-6 text-center text-gray-500">
          Todavía no hay pedidos registrados.
        </p>
      ) : (
        <div className="space-y-4 p-6">
          {pedidos.map((pedido) => (
            <article
              key={pedido.id}
              className="rounded-lg border border-gray-200 p-5"
            >
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <div>
                  <h3 className="font-bold text-gray-900">
                    Pedido #{pedido.id}
                  </h3>

                  <p className="text-sm text-gray-500">
                    {new Date(pedido.creadoEn).toLocaleString("es-BO")}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                    {obtenerNombreOrigen(pedido.origen)}
                  </span>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${obtenerClaseEstado(pedido.estado)}`}
                  >
                    {pedido.estado.replace("_", " ")}
                  </span>
                </div>
              </div>

              <div className="mt-4 grid gap-5 md:grid-cols-2">
                <div>
                  <h4 className="font-semibold text-gray-800">
                    Datos del destinatario
                  </h4>

                  <p className="mt-2 text-sm text-gray-700">
                    {pedido.destinatario}
                  </p>

                  <p className="text-sm text-gray-600">
                    Celular: {pedido.celularDestinatario}
                  </p>

                  <p className="mt-2 text-sm text-gray-700">
                    {pedido.calle}
                    {pedido.numero ? `, ${pedido.numero}` : ""}
                    {" - "}
                    {pedido.zona}, {pedido.ciudad}, {pedido.departamento}
                  </p>

                  {pedido.referencia && (
                    <p className="mt-1 text-sm text-gray-600">
                      Referencia: {pedido.referencia}
                    </p>
                  )}

                  {pedido.referenciaEntrega && (
                    <p className="mt-1 text-sm text-gray-600">
                      Indicaciones de entrega: {pedido.referenciaEntrega}
                    </p>
                  )}
                </div>

                <div>
                  <h4 className="font-semibold text-gray-800">Productos</h4>

                  <ul className="mt-2 space-y-2">
                    {pedido.detalles.map((detalle) => (
                      <li
                        key={detalle.id}
                        className="flex justify-between gap-3 text-sm text-gray-700"
                      >
                        <span>
                          {detalle.producto.nombre} × {detalle.cantidad}
                        </span>

                        <span className="whitespace-nowrap">
                          Bs.{" "}
                          {(
                            Number(detalle.precioUnitario) * detalle.cantidad
                          ).toFixed(2)}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <p className="mt-4 border-t border-gray-100 pt-3 font-bold text-gray-900">
                    Total: Bs. {Number(pedido.total).toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap justify-end gap-2">
                {pedido.estado === "PENDIENTE" &&
                  pedido.pagos.some((pago) => pago.estado === "PENDIENTE") && (
                    <button
                      type="button"
                      disabled={pedidoProcesando === pedido.id}
                      onClick={() => {
                        const pagoPendiente = pedido.pagos.find(
                          (pago) => pago.estado === "PENDIENTE",
                        );

                        if (pagoPendiente) {
                          onConfirmarPago(pedido.id, pagoPendiente.id);
                        }
                      }}
                      className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {pedidoProcesando === pedido.id
                        ? "Procesando..."
                        : "Confirmar pago"}
                    </button>
                  )}
                {pedido.estado === "PAGADO" && (
                  <button
                    type="button"
                    disabled={pedidoProcesando === pedido.id}
                    onClick={() => onEnviar(pedido.id)}
                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {pedidoProcesando === pedido.id
                      ? "Procesando..."
                      : "Enviar pedido"}
                  </button>
                )}

                {pedido.estado === "EN_TRANSITO" && (
                  <button
                    type="button"
                    disabled={pedidoProcesando === pedido.id}
                    onClick={() => onEntregar(pedido.id)}
                    className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {pedidoProcesando === pedido.id
                      ? "Procesando..."
                      : "Marcar como entregado"}
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
