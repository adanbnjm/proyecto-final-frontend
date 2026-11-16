import { useMemo } from "react";

import GraficoVentas from "./GraficoVentas";

import type { ProductoAdministrativo } from "../../services/productos.service";
import type { Pedido } from "../../services/pedidos.service";
import type { VentaHistorial } from "../../services/ventas.service";

interface PropsResumenDashboard {
  productos: ProductoAdministrativo[];
  pedidos: Pedido[];
  ventas: VentaHistorial[];
  ventasSemana: VentaHistorial[];
  cargandoVentas: boolean;
  errorVentas: string | null;
}

const formatearDinero = (monto: number) =>
  new Intl.NumberFormat("es-BO", {
    style: "currency",
    currency: "BOB",
  }).format(monto);

const obtenerMonto = (monto: number | string) => Number(monto) || 0;

const obtenerFechaBolivia = (fecha: string | Date) => {
  const partes = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/La_Paz",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date(fecha));

  const valores = Object.fromEntries(
    partes.map((parte) => [parte.type, parte.value]),
  );

  return `${valores.year}-${valores.month}-${valores.day}`;
};

const clasesTarjeta =
  "rounded-xl border border-slate-300 bg-white p-5 shadow-sm";

export default function ResumenDashboard({
  productos,
  pedidos,
  ventas,
  ventasSemana,
  cargandoVentas,
  errorVentas,
}: PropsResumenDashboard) {
  const resumen = useMemo(() => {
    const fechaHoy = obtenerFechaBolivia(new Date());

    const pedidosHoy = pedidos.filter(
      (pedido) => obtenerFechaBolivia(pedido.creadoEn) === fechaHoy,
    );

    const productosActivos = productos.filter((producto) => producto.activo);

    const productosStockBajo = productosActivos.filter(
      (producto) => producto.stockDisponible <= 5,
    );

    const pedidosPendientes = pedidosHoy.filter(
      (pedido) => pedido.estado === "PENDIENTE",
    );

    const ventasPorMetodo = {
      EFECTIVO: 0,
      TARJETA: 0,
      QR: 0,
    };

    let ingresosPOS = 0;

    ventas.forEach((venta) => {
      const total = obtenerMonto(venta.total);
      ingresosPOS += total;

      if (venta.metodoPago in ventasPorMetodo) {
        ventasPorMetodo[venta.metodoPago as keyof typeof ventasPorMetodo] +=
          total;
      }
    });

    let ingresosOnlineBOB = 0;
    let ingresosOnlineUSD = 0;

    pedidos.forEach((pedido) => {
      pedido.pagos.forEach((pago) => {
        if (
          pago.estado !== "APROBADO" ||
          obtenerFechaBolivia(pago.creadoEn) !== fechaHoy
        ) {
          return;
        }

        const monto = obtenerMonto(pago.monto);

        if (pago.moneda === "BOB") {
          ingresosOnlineBOB += monto;
        } else if (pago.moneda === "USD") {
          ingresosOnlineUSD += monto;
        }
      });
    });

    const pedidosPorEstado = {
      PENDIENTE: pedidosHoy.filter((pedido) => pedido.estado === "PENDIENTE")
        .length,

      PAGADO: pedidosHoy.filter((pedido) => pedido.estado === "PAGADO").length,

      EN_TRANSITO: pedidosHoy.filter(
        (pedido) => pedido.estado === "EN_TRANSITO",
      ).length,

      ENTREGADO: pedidosHoy.filter((pedido) => pedido.estado === "ENTREGADO")
        .length,

      CANCELADO: pedidosHoy.filter((pedido) => pedido.estado === "CANCELADO")
        .length,
    };

    const pedidosRecientes = [...pedidos]
      .sort(
        (a, b) =>
          new Date(b.creadoEn).getTime() - new Date(a.creadoEn).getTime(),
      )
      .slice(0, 5);

    return {
      productosActivos: productosActivos.length,
      productosStockBajo: productosStockBajo.length,
      listaProductosStockBajo: productosStockBajo,
      pedidosPendientes: pedidosPendientes.length,
      ingresosPOS,
      ingresosOnlineBOB,
      ingresosOnlineUSD,
      ventasPorMetodo,
      pedidosPorEstado,
      pedidosRecientes,
    };
  }, [productos, pedidos, ventas]);

  return (
    <section className="mb-8 space-y-6">
      <div>
        <h2 className="mb-4 text-xl font-bold text-gray-900">
          Resumen general
        </h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <article className={clasesTarjeta}>
            <p className="text-sm text-gray-500">Productos activos</p>
            <p className="mt-2 text-2xl font-bold text-gray-900">
              {resumen.productosActivos}
            </p>
          </article>

          <article className={clasesTarjeta}>
            <p className="text-sm text-gray-500">Productos con stock bajo</p>
            <p className="mt-2 text-2xl font-bold text-red-600">
              {resumen.productosStockBajo}
            </p>
            <p className="mt-1 text-xs text-gray-500">
              5 unidades disponibles o menos
            </p>
          </article>

          <article className={clasesTarjeta}>
            <p className="text-sm text-gray-500">Pedidos pendientes</p>
            <p className="mt-2 text-2xl font-bold text-gray-900">
              {resumen.pedidosPendientes}
            </p>
          </article>

          <article className={clasesTarjeta}>
            <p className="text-sm text-gray-500">Ingresos POS de hoy</p>
            <p className="mt-2 text-2xl font-bold text-green-700">
              {formatearDinero(resumen.ingresosPOS)}
            </p>
          </article>
        </div>
      </div>

      <div>
        <h2 className="mb-4 text-xl font-bold text-gray-900">
          Ingresos cobrados
        </h2>

        {cargandoVentas ? (
          <p className="text-gray-500">Cargando ventas del día...</p>
        ) : errorVentas ? (
          <p className="text-red-600">{errorVentas}</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <article className={clasesTarjeta}>
              <p className="text-sm text-gray-500">Ventas POS (BOB)</p>
              <p className="mt-2 text-xl font-bold text-gray-900">
                {formatearDinero(resumen.ingresosPOS)}
              </p>
            </article>

            <article className={clasesTarjeta}>
              <p className="text-sm text-gray-500">
                Pagos online aprobados (BOB)
              </p>
              <p className="mt-2 text-xl font-bold text-gray-900">
                {formatearDinero(resumen.ingresosOnlineBOB)}
              </p>
            </article>

            <article className={clasesTarjeta}>
              <p className="text-sm text-gray-500">
                Pagos online aprobados (USD)
              </p>
              <p className="mt-2 text-xl font-bold text-gray-900">
                {new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: "USD",
                }).format(resumen.ingresosOnlineUSD)}
              </p>
            </article>
          </div>
        )}
      </div>

      {!cargandoVentas && !errorVentas && (
        <GraficoVentas ventas={ventasSemana} />
      )}

      <div>
        <h2 className="mb-4 text-xl font-bold text-gray-900">
          Ventas POS por método de pago
        </h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {Object.entries(resumen.ventasPorMetodo).map(([metodo, monto]) => (
            <article key={metodo} className={clasesTarjeta}>
              <p className="text-sm text-gray-500">{metodo}</p>
              <p className="mt-2 text-xl font-bold text-gray-900">
                {formatearDinero(monto)}
              </p>
            </article>
          ))}
        </div>
      </div>

      <div>
        <h2 className="mb-4 text-xl font-bold text-gray-900">
          Pedidos por estado
        </h2>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {Object.entries(resumen.pedidosPorEstado).map(
            ([estado, cantidad]) => (
              <article key={estado} className={clasesTarjeta}>
                <p className="text-sm text-gray-500">
                  {estado.replaceAll("_", " ")}
                </p>
                <p className="mt-2 text-2xl font-bold text-gray-900">
                  {cantidad}
                </p>
              </article>
            ),
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <article className={clasesTarjeta}>
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                Alertas de inventario
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Productos que necesitan reposición
              </p>
            </div>

            <span className="rounded-full bg-red-100 px-3 py-1 text-sm font-semibold text-red-700">
              {resumen.productosStockBajo}
            </span>
          </div>

          {resumen.listaProductosStockBajo.length === 0 ? (
            <p className="rounded-lg bg-green-50 p-4 text-sm text-green-700">
              Todos los productos tienen stock suficiente.
            </p>
          ) : (
            <div className="space-y-3">
              {resumen.listaProductosStockBajo.slice(0, 5).map((producto) => (
                <div
                  key={producto.id}
                  className="flex items-center justify-between gap-3 border-b border-slate-300 pb-3 last:border-0"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-gray-800">
                      {producto.nombre}
                    </p>
                    <p className="text-xs text-gray-500">
                      Código: {producto.codigo}
                    </p>
                  </div>

                  <span className="shrink-0 rounded-lg bg-red-50 px-3 py-2 text-sm font-bold text-red-700">
                    {producto.stockDisponible} disponibles
                  </span>
                </div>
              ))}
            </div>
          )}
        </article>

        <article className={clasesTarjeta}>
          <div className="mb-5">
            <h2 className="text-lg font-bold text-gray-900">
              Pedidos recientes
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Últimos cinco pedidos registrados
            </p>
          </div>

          {resumen.pedidosRecientes.length === 0 ? (
            <p className="rounded-lg bg-gray-50 p-4 text-sm text-gray-500">
              Todavía no hay pedidos registrados.
            </p>
          ) : (
            <div className="space-y-3">
              {resumen.pedidosRecientes.map((pedido) => (
                <div
                  key={pedido.id}
                  className="flex items-center justify-between gap-3 border-b border-slate-300 pb-3 last:border-0"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-800">
                      Pedido #{pedido.id}
                    </p>
                    <p className="truncate text-xs text-gray-500">
                      {pedido.destinatario} · {pedido.origen}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(pedido.creadoEn).toLocaleString("es-BO", {
                        timeZone: "America/La_Paz",
                        dateStyle: "short",
                        timeStyle: "short",
                      })}
                    </p>
                  </div>

                  <div className="shrink-0 text-right">
                    <p className="text-sm font-bold text-gray-900">
                      {formatearDinero(obtenerMonto(pedido.total))}
                    </p>
                    <span className="text-xs text-gray-500">
                      {pedido.estado.replaceAll("_", " ")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </article>
      </div>
    </section>
  );
}
