import { useEffect, useState } from "react";

import {
  obtenerTodasLasCajas,
  type CajaSupervision,
} from "../../services/cajas.service";

export default function SupervisionCajas() {
  const [cajas, setCajas] = useState<CajaSupervision[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  // Paginación
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(0);
  const [totalCajas, setTotalCajas] = useState(0);

  // Filtros
  const [estado, setEstado] = useState<"" | "ABIERTA" | "CERRADA">("");
  const [nombreUsuario, setNombreUsuario] = useState("");
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");

  useEffect(() => {
    let cancelado = false;

    const cargarCajas = async () => {
      setCargando(true);
      setError("");

      try {
        const respuesta = await obtenerTodasLasCajas({
          pagina,
          limite: 10,
          estado: estado || undefined,
          nombreUsuario: nombreUsuario.trim() || undefined,
          desde: desde || undefined,
          hasta: hasta || undefined,
        });

        if (!cancelado) {
          setCajas(respuesta.datos);
          setTotalPaginas(respuesta.paginacion.totalPaginas);
          setTotalCajas(respuesta.paginacion.total);
        }
      } catch {
        if (!cancelado) {
          setError("No se pudieron cargar las cajas.");
          setCajas([]);
        }
      } finally {
        if (!cancelado) {
          setCargando(false);
        }
      }
    };

    cargarCajas();

    return () => {
      cancelado = true;
    };
  }, [pagina, estado, nombreUsuario, desde, hasta]);

  const formatoDinero = (valor: number | string | null) =>
    `Bs. ${Number(valor ?? 0).toFixed(2)}`;

  const formatoFecha = (fecha: string) =>
    new Date(fecha).toLocaleString("es-BO");

  return (
    <section className="mb-8 rounded-xl bg-white p-6 shadow">
      <h2 className="mb-2 text-2xl font-bold text-gray-900">
        Supervisión de cajas
      </h2>

      <p className="mb-6 text-gray-600">
        Consulta las cajas abiertas y cerradas de todos los empleados.
      </p>
      {/* Filtros */}
      <div className="mb-6 grid gap-4 rounded-lg bg-gray-50 p-4 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Buscar empleado
          </label>
          <input
            type="text"
            value={nombreUsuario}
            onChange={(e) => {
              setNombreUsuario(e.target.value);
              setPagina(1);
            }}
            placeholder="Nombre del empleado"
            className="w-full rounded-lg border border-gray-300 p-2"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Estado de caja
          </label>
          <select
            value={estado}
            onChange={(e) => {
              setEstado(e.target.value as "" | "ABIERTA" | "CERRADA");
              setPagina(1);
            }}
            className="w-full rounded-lg border border-gray-300 p-2"
          >
            <option value="">Todas</option>
            <option value="ABIERTA">Abiertas</option>
            <option value="CERRADA">Cerradas</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Desde
          </label>
          <input
            type="date"
            value={desde}
            onChange={(e) => {
              setDesde(e.target.value);
              setPagina(1);
            }}
            className="w-full rounded-lg border border-gray-300 p-2"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Hasta
          </label>
          <input
            type="date"
            value={hasta}
            min={desde || undefined}
            onChange={(e) => {
              setHasta(e.target.value);
              setPagina(1);
            }}
            className="w-full rounded-lg border border-gray-300 p-2"
          />
        </div>
      </div>

      <p className="mb-4 text-sm text-gray-600">
        Total de cajas encontradas: <strong>{totalCajas}</strong>
      </p>
      {cargando && (
        <p className="mb-4 text-sm text-gray-500">Actualizando resultados...</p>
      )}

      {error && (
        <p className="rounded-lg bg-red-100 p-3 text-red-700">{error}</p>
      )}

      {!cargando && !error && cajas.length === 0 && (
        <p className="text-gray-500">No hay cajas registradas.</p>
      )}

      <div className="space-y-5">
        {cajas.map((caja) => {
          const totalVentas = caja.ventas.reduce(
            (total, venta) => total + Number(venta.total),
            0,
          );

          const totalEfectivo = caja.ventas
            .filter((venta) => venta.metodoPago === "EFECTIVO")
            .reduce((total, venta) => total + Number(venta.total), 0);

          const totalTarjeta = caja.ventas
            .filter((venta) => venta.metodoPago === "TARJETA")
            .reduce((total, venta) => total + Number(venta.total), 0);

          const totalQR = caja.ventas
            .filter((venta) => venta.metodoPago === "QR")
            .reduce((total, venta) => total + Number(venta.total), 0);

          const estaAbierta = caja.fechaCierre === null;

          return (
            <article
              key={caja.id}
              className="rounded-xl border border-slate-400 p-5"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="text-lg font-bold text-gray-900">
                  Caja #{caja.id}
                </h3>

                <span
                  className={`rounded-full px-3 py-1 text-sm font-semibold ${
                    estaAbierta
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {estaAbierta ? "Abierta" : "Cerrada"}
                </span>
              </div>

              <div className="mt-4 grid gap-4 border-t border-slate-400 pt-4 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <p className="text-sm text-gray-500">Responsable</p>
                  <p className="font-semibold text-gray-900">
                    {caja.usuario.nombre}
                  </p>
                  <p className="text-sm text-gray-500">
                    {caja.usuario.email ?? "Sin correo"}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Monto de apertura</p>
                  <p className="font-semibold">
                    {formatoDinero(caja.montoApertura)}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Monto de cierre</p>
                  <p className="font-semibold">
                    {caja.montoCierre === null
                      ? "Pendiente"
                      : formatoDinero(caja.montoCierre)}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Total de ventas</p>
                  <p className="font-semibold">{formatoDinero(totalVentas)}</p>
                </div>
              </div>

              <div className="mt-4 grid gap-3 border-t border-slate-400 pt-4 text-sm sm:grid-cols-2">
                <p>
                  <span className="text-gray-500">Apertura: </span>
                  {formatoFecha(caja.fechaApertura)}
                </p>

                <p>
                  <span className="text-gray-500">Cierre: </span>
                  {caja.fechaCierre
                    ? formatoFecha(caja.fechaCierre)
                    : "Todavía abierta"}
                </p>
              </div>

              <div className="mt-5 border-t-2 border-slate-400 pt-4">
                <h4 className="mb-3 font-semibold text-gray-800">
                  Resumen de ventas
                </h4>

                <div className="grid gap-3 sm:grid-cols-3">
                  <p>
                    Efectivo: <strong>{formatoDinero(totalEfectivo)}</strong>
                  </p>
                  <p>
                    Tarjeta: <strong>{formatoDinero(totalTarjeta)}</strong>
                  </p>
                  <p>
                    QR: <strong>{formatoDinero(totalQR)}</strong>
                  </p>
                </div>

                <p className="mt-2 text-sm text-gray-500">
                  {caja.ventas.length} venta(s) registrada(s).
                </p>
              </div>

              <details className="mt-5 border-t-2 border-slate-400 pt-4">
                <summary className="cursor-pointer font-semibold text-blue-700">
                  Ver detalles de ventas y movimientos
                </summary>

                <div className="mt-4 space-y-4">
                  <div>
                    <h4 className="mb-3 font-semibold">Ventas</h4>

                    {caja.ventas.length === 0 ? (
                      <p className="text-sm text-gray-500">
                        Esta caja no tiene ventas.
                      </p>
                    ) : (
                      caja.ventas.map((venta) => (
                        <div
                          key={venta.id}
                          className="mb-3 rounded-lg bg-gray-50 p-4"
                        >
                          <div className="flex flex-wrap justify-between gap-2">
                            <strong>Venta #{venta.id}</strong>
                            <strong>{formatoDinero(venta.total)}</strong>
                          </div>

                          <p className="mt-1 text-sm text-gray-600">
                            Pago: {venta.metodoPago} ·{" "}
                            {formatoFecha(venta.creadoEn)}
                          </p>

                          <ul className="mt-2 list-inside list-disc text-sm text-gray-600">
                            {venta.detalles.map((detalle) => (
                              <li key={detalle.id}>
                                {detalle.producto.nombre} × {detalle.cantidad}
                                {" — "}
                                {formatoDinero(
                                  Number(detalle.precioUnitario) *
                                    detalle.cantidad,
                                )}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="border-t border-slate-300 pt-4">
                    <h4 className="mb-3 font-semibold">Movimientos de caja</h4>

                    {caja.movimientos.length === 0 ? (
                      <p className="text-sm text-gray-500">
                        No hay movimientos registrados.
                      </p>
                    ) : (
                      caja.movimientos.map((movimiento) => (
                        <div
                          key={movimiento.id}
                          className="mb-3 rounded-lg bg-gray-50 p-4 text-sm"
                        >
                          <p className="font-semibold">
                            {movimiento.tipo} ·{" "}
                            {formatoDinero(movimiento.monto)}
                          </p>
                          <p>{movimiento.motivo}</p>
                          <p className="text-gray-500">
                            Estado: {movimiento.estado}
                          </p>
                          <p className="text-gray-500">
                            Solicitado por: {movimiento.solicitante.nombre}
                          </p>
                          <p className="text-gray-500">
                            Autorizado por:{" "}
                            {movimiento.autorizador?.nombre ??
                              "Sin autorización"}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </details>
            </article>
          );
        })}
      </div>
      {/* Paginación */}
      {!cargando && totalCajas > 0 && (
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-gray-200 pt-5">
          <p className="text-sm text-gray-600">
            Página {pagina} de {totalPaginas}
          </p>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setPagina((actual) => actual - 1)}
              disabled={pagina <= 1}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Anterior
            </button>

            <button
              type="button"
              onClick={() => setPagina((actual) => actual + 1)}
              disabled={pagina >= totalPaginas}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
