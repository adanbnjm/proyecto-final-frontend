import { useEffect, useMemo, useState } from "react";
import axios from "axios";

import {
  obtenerPedidos,
  cancelarPedido,
  type Pedido,
} from "../services/pedidos.service";

import { obtenerImagenProducto } from "../components/tienda/CatalogoProductos";

type FiltroEstado = Pedido["estado"] | "TODOS";

export default function MisPedidos() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState<FiltroEstado>("TODOS");
  const [cancelando, setCancelando] = useState<number | null>(null);

  const cargarPedidos = async () => {
    try {
      const datos = await obtenerPedidos();
      setPedidos(datos);
      setError("");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setError("No se pudieron cargar tus pedidos.");
      } else {
        setError("Ocurrió un error inesperado.");
      }
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarPedidos();
  }, []);

  const manejarCancelacion = async (pedidoId: number) => {
    const confirmar = window.confirm(
      `¿Estás seguro de cancelar el pedido #${pedidoId}?`,
    );

    if (!confirmar) return;

    try {
      setCancelando(pedidoId);
      await cancelarPedido(pedidoId);
      await cargarPedidos();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setError(
          error.response?.data?.message || "No se pudo cancelar el pedido.",
        );
      } else {
        setError("Ocurrió un error inesperado.");
      }
    } finally {
      setCancelando(null);
    }
  };

  const pedidosFiltrados = useMemo(() => {
    const termino = busqueda.trim().toLowerCase();

    return pedidos.filter((pedido) => {
      const coincideEstado =
        filtroEstado === "TODOS" || pedido.estado === filtroEstado;

      const coincideBusqueda =
        !termino ||
        String(pedido.id).includes(termino) ||
        pedido.destinatario.toLowerCase().includes(termino) ||
        pedido.detalles.some((detalle) =>
          detalle.producto.nombre.toLowerCase().includes(termino),
        );

      return coincideEstado && coincideBusqueda;
    });
  }, [pedidos, busqueda, filtroEstado]);

  const pedidosPendientes = pedidos.filter(
    (pedido) => pedido.estado === "PENDIENTE",
  ).length;

  const pedidosEntregados = pedidos.filter(
    (pedido) => pedido.estado === "ENTREGADO",
  ).length;

  const gastoRealizado = pedidos
    .filter((pedido) =>
      ["PAGADO", "EN_TRANSITO", "ENTREGADO"].includes(pedido.estado),
    )
    .reduce((total, pedido) => total + Number(pedido.total), 0);

  const formatearTotal = (total: number | string) =>
    Number(total).toLocaleString("es-BO", {
      style: "currency",
      currency: "BOB",
    });

  const formatearFecha = (fecha: string) =>
    new Date(fecha).toLocaleDateString("es-BO", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

  const estilosEstado: Record<Pedido["estado"], string> = {
    PENDIENTE: "bg-amber-100 text-amber-800",
    PAGADO: "bg-emerald-100 text-emerald-800",
    EN_TRANSITO: "bg-blue-100 text-blue-800",
    ENTREGADO: "bg-green-100 text-green-800",
    CANCELADO: "bg-red-100 text-red-800",
  };

  const nombresEstado: Record<Pedido["estado"], string> = {
    PENDIENTE: "Pendiente",
    PAGADO: "Pagado",
    EN_TRANSITO: "En camino",
    ENTREGADO: "Entregado",
    CANCELADO: "Cancelado",
  };

  if (cargando) {
    return (
      <div className="py-16 text-center text-slate-500">
        Cargando tus pedidos...
      </div>
    );
  }

  if (error && pedidos.length === 0) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">
        {error}
        <button
          onClick={cargarPedidos}
          className="ml-3 font-semibold underline"
        >
          Intentar nuevamente
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-7">
      <section>
        <p className="text-sm font-semibold uppercase tracking-wider text-orange-600">
          Tu cuenta
        </p>
        <h1 className="mt-1 text-3xl font-extrabold text-slate-900">
          Mis pedidos
        </h1>
        <p className="mt-2 text-slate-500">
          Consulta tus compras y revisa el estado de cada pedido.
        </p>
      </section>

      {error && (
        <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>
      )}

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Total de pedidos</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            {pedidos.length}
          </p>
        </article>

        <article className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Pendientes</p>
          <p className="mt-2 text-2xl font-bold text-amber-600">
            {pedidosPendientes}
          </p>
        </article>

        <article className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Entregados</p>
          <p className="mt-2 text-2xl font-bold text-green-600">
            {pedidosEntregados}
          </p>
        </article>

        <article className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Compras realizadas</p>
          <p className="mt-2 text-xl font-bold text-orange-600">
            {formatearTotal(gastoRealizado)}
          </p>
        </article>
      </section>

      <section className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row">
          <input
            type="search"
            value={busqueda}
            onChange={(evento) => setBusqueda(evento.target.value)}
            placeholder="Buscar por número de pedido o producto..."
            className="min-w-0 flex-1 rounded-lg border border-slate-200 px-4 py-3 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
          />

          <select
            value={filtroEstado}
            onChange={(evento) =>
              setFiltroEstado(evento.target.value as FiltroEstado)
            }
            className="rounded-lg border border-slate-200 px-4 py-3 outline-none focus:border-orange-500"
          >
            <option value="TODOS">Todos los estados</option>
            <option value="PENDIENTE">Pendientes</option>
            <option value="PAGADO">Pagados</option>
            <option value="EN_TRANSITO">En camino</option>
            <option value="ENTREGADO">Entregados</option>
            <option value="CANCELADO">Cancelados</option>
          </select>
        </div>
      </section>

      <section className="space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">
            Historial de compras
          </h2>
          <span className="text-sm text-slate-500">
            {pedidosFiltrados.length} pedidos
          </span>
        </div>

        {pedidosFiltrados.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
            <h3 className="font-semibold text-slate-800">
              {pedidos.length === 0
                ? "Todavía no tienes pedidos"
                : "No encontramos pedidos"}
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              {pedidos.length === 0
                ? "Cuando realices una compra, aparecerá aquí."
                : "Prueba con otro término de búsqueda o estado."}
            </p>
          </div>
        ) : (
          pedidosFiltrados.map((pedido) => (
            <article
              key={pedido.id}
              className="overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm"
            >
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 p-5">
                <div>
                  <h3 className="font-bold text-slate-900">
                    Pedido #{pedido.id}
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    {formatearFecha(pedido.creadoEn)}
                  </p>
                </div>

                <span
                  className={`rounded-full px-3 py-1.5 text-xs font-bold ${
                    estilosEstado[pedido.estado]
                  }`}
                >
                  {nombresEstado[pedido.estado]}
                </span>
              </div>

              <div className="space-y-4 p-5">
                {pedido.detalles.map((detalle) => {
                  const imagen = obtenerImagenProducto(detalle.producto.nombre);

                  return (
                    <div key={detalle.id} className="flex items-center gap-4">
                      <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-slate-50">
                        {imagen ? (
                          <img
                            src={imagen}
                            alt={detalle.producto.nombre}
                            loading="lazy"
                            className="h-full w-full object-contain"
                          />
                        ) : (
                          <span className="text-xs text-slate-400">
                            Sin imagen
                          </span>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-slate-800">
                          {detalle.producto.nombre}
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                          Cantidad: {detalle.cantidad}
                        </p>
                      </div>

                      <p className="shrink-0 text-sm font-semibold text-slate-800">
                        {formatearTotal(
                          Number(detalle.precioUnitario) * detalle.cantidad,
                        )}
                      </p>
                    </div>
                  );
                })}
              </div>

              <div className="flex flex-col gap-4 border-t border-slate-100 bg-slate-50/70 p-5 sm:flex-row sm:items-end sm:justify-between">
                <div className="space-y-2">
                  <p className="text-sm text-slate-500">
                    Entrega para:{" "}
                    <span className="font-medium text-slate-700">
                      {pedido.destinatario}
                    </span>
                  </p>

                  <p className="text-sm text-slate-500">
                    {pedido.ciudad}, {pedido.departamento}
                  </p>

                  {pedido.pagos.length > 0 && (
                    <p className="text-sm text-slate-500">
                      Pago:{" "}
                      <span className="font-semibold text-slate-700">
                        {pedido.pagos[0].estado === "APROBADO"
                          ? "Aprobado"
                          : pedido.pagos[0].estado === "RECHAZADO"
                            ? "Rechazado"
                            : "Pendiente"}
                      </span>
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-4 sm:justify-end">
                  {pedido.estado === "PENDIENTE" && (
                    <button
                      type="button"
                      disabled={cancelando === pedido.id}
                      onClick={() => manejarCancelacion(pedido.id)}
                      className="rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                    >
                      {cancelando === pedido.id
                        ? "Cancelando..."
                        : "Cancelar pedido"}
                    </button>
                  )}

                  <div className="text-right">
                    <p className="text-xs text-slate-500">Total del pedido</p>
                    <p className="text-xl font-extrabold text-orange-600">
                      {formatearTotal(pedido.total)}
                    </p>
                  </div>
                </div>
              </div>
            </article>
          ))
        )}
      </section>
    </div>
  );
}
