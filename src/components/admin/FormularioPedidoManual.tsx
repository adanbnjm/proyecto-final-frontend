import { useFormularioPedidoManual } from "../../hooks/useFormularioPedidoManual";

import type { Producto } from "../../services/productos.service";
import type { DatosPedidoManual } from "../../services/pedidos.service";

interface Props {
  productos: Producto[];
  cargandoProductos: boolean;
  errorProductos: string;
  guardando: boolean;
  error: string;
  mensaje: string;
  onRegistrar: (datos: DatosPedidoManual) => Promise<unknown>;
}

export default function FormularioPedidoManual({
  productos,
  cargandoProductos,
  errorProductos,
  guardando,
  error,
  mensaje,
  onRegistrar,
}: Props) {
  const {
    datos,
    origen,
    detalles,
    actualizarCampo,
    actualizarDetalle,
    agregarDetalle,
    eliminarDetalle,
    obtenerProducto,
    calcularTotal,
    manejarEnvio,
    setOrigen,
  } = useFormularioPedidoManual({
    productos,
    onRegistrar,
  });

  return (
    <section className="overflow-hidden rounded-xl bg-white shadow">
      <div className="border-b border-gray-100 p-6">
        <h2 className="text-xl font-bold text-gray-900">
          Registrar pedido manual
        </h2>

        <p className="mt-1 text-sm text-gray-600">
          Registra pedidos recibidos por redes sociales u otros medios.
        </p>
      </div>

      <form onSubmit={manejarEnvio} className="space-y-6 p-6">
        <div>
          <h3 className="mb-4 font-semibold text-gray-800">
            Datos del destinatario
          </h3>

          <div className="grid gap-4 md:grid-cols-2">
            <input
              required
              maxLength={100}
              placeholder="Nombre del destinatario"
              value={datos.destinatario}
              onChange={(e) => actualizarCampo("destinatario", e.target.value)}
              className="rounded-lg border border-gray-300 px-4 py-3"
            />

            <input
              required
              maxLength={20}
              placeholder="Celular"
              value={datos.celularDestinatario}
              onChange={(e) =>
                actualizarCampo("celularDestinatario", e.target.value)
              }
              className="rounded-lg border border-gray-300 px-4 py-3"
            />
          </div>
        </div>

        <div>
          <h3 className="mb-4 font-semibold text-gray-800">
            Dirección de entrega
          </h3>

          <div className="grid gap-4 md:grid-cols-2">
            <input
              required
              placeholder="Departamento"
              value={datos.departamento}
              onChange={(e) => actualizarCampo("departamento", e.target.value)}
              className="rounded-lg border border-gray-300 px-4 py-3"
            />

            <input
              required
              placeholder="Ciudad"
              value={datos.ciudad}
              onChange={(e) => actualizarCampo("ciudad", e.target.value)}
              className="rounded-lg border border-gray-300 px-4 py-3"
            />

            <input
              required
              placeholder="Zona"
              value={datos.zona}
              onChange={(e) => actualizarCampo("zona", e.target.value)}
              className="rounded-lg border border-gray-300 px-4 py-3"
            />

            <input
              required
              placeholder="Calle"
              value={datos.calle}
              onChange={(e) => actualizarCampo("calle", e.target.value)}
              className="rounded-lg border border-gray-300 px-4 py-3"
            />

            <input
              maxLength={50}
              placeholder="Número (opcional)"
              value={datos.numero}
              onChange={(e) => actualizarCampo("numero", e.target.value)}
              className="rounded-lg border border-gray-300 px-4 py-3"
            />

            <input
              maxLength={255}
              placeholder="Referencia (opcional)"
              value={datos.referencia}
              onChange={(e) => actualizarCampo("referencia", e.target.value)}
              className="rounded-lg border border-gray-300 px-4 py-3"
            />
          </div>
        </div>

        <div>
          <h3 className="mb-4 font-semibold text-gray-800">
            Origen del pedido
          </h3>

          <select
            value={origen}
            onChange={(e) =>
              setOrigen(e.target.value as DatosPedidoManual["origen"])
            }
            className="w-full rounded-lg border border-gray-300 px-4 py-3 md:w-1/2"
          >
            <option value="FACEBOOK">Facebook</option>
            <option value="WHATSAPP">WhatsApp</option>
            <option value="OTRO">Otro</option>
          </select>
        </div>

        <div>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h3 className="font-semibold text-gray-800">
              Productos del pedido
            </h3>

            <button
              type="button"
              onClick={agregarDetalle}
              className="rounded-lg border border-blue-600 px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50"
            >
              Agregar producto
            </button>
          </div>

          {cargandoProductos ? (
            <p className="text-sm text-gray-500">Cargando catálogo...</p>
          ) : errorProductos ? (
            <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
              {errorProductos}
            </p>
          ) : productos.length === 0 ? (
            <p className="text-sm text-gray-500">
              No hay productos disponibles.
            </p>
          ) : (
            <div className="space-y-3">
              {detalles.map((detalle, indice) => {
                const producto = obtenerProducto(detalle.productoId);

                return (
                  <div
                    key={indice}
                    className="grid gap-3 rounded-lg border border-gray-200 p-4 md:grid-cols-[2fr_1fr_1fr_auto]"
                  >
                    <select
                      required
                      value={detalle.productoId}
                      onChange={(e) =>
                        actualizarDetalle(
                          indice,
                          "productoId",
                          Number(e.target.value),
                        )
                      }
                      className="rounded-lg border border-gray-300 px-3 py-2"
                    >
                      <option value={0}>Seleccionar producto</option>

                      {productos
                        .filter(
                          (elemento) =>
                            elemento.stock > 0 &&
                            (elemento.id === detalle.productoId ||
                              !detalles.some(
                                (otro, posicion) =>
                                  posicion !== indice &&
                                  otro.productoId === elemento.id,
                              )),
                        )
                        .map((elemento) => (
                          <option key={elemento.id} value={elemento.id}>
                            {elemento.nombre} — Stock: {elemento.stock}
                          </option>
                        ))}
                    </select>

                    <input
                      type="number"
                      required
                      min={1}
                      max={producto?.stock ?? undefined}
                      value={detalle.cantidad}
                      onChange={(e) =>
                        actualizarDetalle(
                          indice,
                          "cantidad",
                          Number(e.target.value),
                        )
                      }
                      className="rounded-lg border border-gray-300 px-3 py-2"
                    />

                    <p className="flex items-center text-sm font-medium text-gray-700">
                      {producto
                        ? `Bs. ${(Number(producto.precioActual) * detalle.cantidad).toFixed(2)}`
                        : "Selecciona un producto"}
                    </p>

                    <button
                      type="button"
                      disabled={detalles.length === 1}
                      onClick={() => eliminarDetalle(indice)}
                      className="rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-30"
                    >
                      Quitar
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          <p className="mt-4 text-right text-lg font-bold text-gray-900">
            Total: Bs. {calcularTotal().toFixed(2)}
          </p>
        </div>

        {error && (
          <p className="rounded-lg bg-red-50 p-4 text-sm text-red-700">
            {error}
          </p>
        )}

        {mensaje && (
          <p className="rounded-lg bg-green-50 p-4 text-sm text-green-700">
            {mensaje}
          </p>
        )}

        <div className="flex justify-end border-t border-gray-100 pt-5">
          <button
            type="submit"
            disabled={guardando || cargandoProductos || productos.length === 0}
            className="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {guardando ? "Registrando..." : "Registrar pedido"}
          </button>
        </div>
      </form>
    </section>
  );
}
