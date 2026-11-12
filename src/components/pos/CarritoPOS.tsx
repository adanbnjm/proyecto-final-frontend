import type { MetodoPago } from "../../services/ventas.service";
import type { Producto } from "../../services/productos.service";

interface ProductoEnCarrito {
  producto: Producto;
  cantidad: number;
}

interface CarritoPOSProps {
  productosCarrito: ProductoEnCarrito[];
  cambiarCantidad: (id: number, cantidad: number) => void;
  quitarProducto: (id: number) => void;
  metodoPago: MetodoPago;
  setMetodoPago: (metodo: MetodoPago) => void;
  total: number;
  confirmandoVenta: boolean;
  manejarConfirmacionVenta: () => void;
  cajaAbierta: boolean;
}

function CarritoPOS({
  productosCarrito,
  cambiarCantidad,
  quitarProducto,
  metodoPago,
  setMetodoPago,
  total,
  confirmandoVenta,
  manejarConfirmacionVenta,
  cajaAbierta,
}: CarritoPOSProps) {
  return (
    <section className="rounded-xl bg-white p-5 shadow">
      <h2 className="mb-4 text-xl font-semibold">Carrito POS</h2>

      {productosCarrito.length === 0 ? (
        <p className="text-gray-500">Todavía no agregaste productos.</p>
      ) : (
        <div className="space-y-4">
          {productosCarrito.map((item) => (
            <article
              key={item.producto.id}
              className="border-b border-gray-200 pb-4"
            >
              <h3 className="font-medium">{item.producto.nombre}</h3>

              <p className="text-sm text-gray-500">
                Bs. {Number(item.producto.precioActual).toFixed(2)}
              </p>

              <div className="mt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    cambiarCantidad(item.producto.id, item.cantidad - 1)
                  }
                  className="rounded bg-gray-200 px-3 py-1"
                >
                  -
                </button>

                <span>{item.cantidad}</span>

                <button
                  type="button"
                  onClick={() =>
                    cambiarCantidad(item.producto.id, item.cantidad + 1)
                  }
                  disabled={item.cantidad >= item.producto.stock}
                  className="rounded bg-gray-200 px-3 py-1 disabled:opacity-40"
                >
                  +
                </button>

                <button
                  type="button"
                  onClick={() => quitarProducto(item.producto.id)}
                  className="ml-auto text-sm text-red-600"
                >
                  Quitar
                </button>
              </div>

              <p className="mt-2 text-right font-medium">
                Bs.{" "}
                {(Number(item.producto.precioActual) * item.cantidad).toFixed(
                  2,
                )}
              </p>
            </article>
          ))}
        </div>
      )}

      <div className="mt-5 border-t border-gray-200 pt-4">
        <label htmlFor="metodoPago" className="mb-2 block font-medium">
          Método de pago
        </label>

        <select
          id="metodoPago"
          value={metodoPago}
          onChange={(e) => setMetodoPago(e.target.value as MetodoPago)}
          className="mb-4 w-full rounded-lg border border-gray-300 p-2"
        >
          <option value="EFECTIVO">Efectivo</option>
          <option value="TARJETA">Tarjeta</option>
          <option value="QR">QR</option>
        </select>

        <p className="text-lg font-bold">Total: Bs. {total.toFixed(2)}</p>

        <button
          type="button"
          onClick={manejarConfirmacionVenta}
          disabled={
            !cajaAbierta || productosCarrito.length === 0 || confirmandoVenta
          }
          className="mt-4 w-full rounded-lg bg-green-600 px-4 py-3 font-semibold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {confirmandoVenta ? "Registrando venta..." : "Confirmar venta"}
        </button>
      </div>
    </section>
  );
}

export default CarritoPOS;
