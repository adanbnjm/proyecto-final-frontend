import { useCarritoStore } from "../../store/carrito.store";

interface Props {
  alContinuar: () => void;
}

function Carrito({ alContinuar }: Props) {
  const productos = useCarritoStore((estado) => estado.productos);
  const quitarProducto = useCarritoStore((estado) => estado.quitarProducto);

  const productosAgrupados = productos.reduce(
    (acumulado, producto) => {
      const existente = acumulado.find(
        (item) => item.producto.id === producto.id,
      );

      if (existente) {
        existente.cantidad += 1;
      } else {
        acumulado.push({
          producto,
          cantidad: 1,
        });
      }

      return acumulado;
    },
    [] as {
      producto: (typeof productos)[number];
      cantidad: number;
    }[],
  );

  const total = productos.reduce(
    (acumulado, producto) => acumulado + Number(producto.precioActual),
    0,
  );

  if (productos.length === 0) {
    return (
      <section className="rounded-xl bg-white p-6 shadow">
        <h2 className="text-xl font-bold">Tu carrito</h2>
        <p className="mt-3 text-gray-500">Todavía no agregaste productos.</p>
      </section>
    );
  }

  return (
    <section className="rounded-xl bg-white p-6 shadow">
      <h2 className="mb-4 text-xl font-bold">Tu carrito</h2>

      <div className="space-y-4">
        {productosAgrupados.map(({ producto, cantidad }) => (
          <div
            key={producto.id}
            className="flex items-center justify-between gap-4 border-b pb-4"
          >
            <div>
              <h3 className="font-semibold">{producto.nombre}</h3>

              <p className="text-sm text-gray-500">
                Bs. {Number(producto.precioActual).toFixed(2)}
              </p>

              <p className="text-sm text-gray-600">Cantidad: {cantidad}</p>

              <p className="text-sm font-medium">
                Subtotal: Bs.{" "}
                {(Number(producto.precioActual) * cantidad).toFixed(2)}
              </p>
            </div>

            <button
              type="button"
              onClick={() => quitarProducto(producto.id)}
              className="text-sm font-medium text-red-600 hover:text-red-800"
            >
              Quitar una unidad
            </button>
          </div>
        ))}
      </div>

      <div className="mt-5 flex justify-between text-lg font-bold">
        <span>Total:</span>
        <span>Bs. {total.toFixed(2)}</span>
      </div>

      <button
        type="button"
        onClick={alContinuar}
        className="mt-5 w-full rounded-lg bg-black px-4 py-3 font-semibold text-white hover:bg-gray-800"
      >
        Continuar con la compra
      </button>
    </section>
  );
}

export default Carrito;
