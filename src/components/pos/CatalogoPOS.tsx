import type { Producto } from "../../services/productos.service";

interface CatalogoPOSProps {
  productosCatalogo: Producto[];
  cargandoProductos: boolean;
  agregarProducto: (producto: Producto) => void;
}

function CatalogoPOS({
  productosCatalogo,
  cargandoProductos,
  agregarProducto,
}: CatalogoPOSProps) {
  return (
    <section className="rounded-xl bg-white p-5 shadow lg:col-span-2">
      <h2 className="mb-4 text-xl font-semibold">Productos</h2>

      {cargandoProductos ? (
        <p>Cargando productos...</p>
      ) : productosCatalogo.length === 0 ? (
        <p>No hay productos disponibles.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {productosCatalogo.map((producto) => (
            <article
              key={producto.id}
              className="rounded-lg border border-gray-200 p-4"
            >
              <h3 className="font-semibold">{producto.nombre}</h3>

              <p className="mt-1 text-sm text-gray-500">
                Código: {producto.codigo}
              </p>

              <p className="mt-2 font-bold">
                Bs. {Number(producto.precioActual).toFixed(2)}
              </p>

              <p className="text-sm text-gray-500">Stock: {producto.stock}</p>

              <button
                type="button"
                onClick={() => agregarProducto(producto)}
                disabled={producto.stock <= 0}
                className="mt-3 w-full rounded-lg bg-gray-900 px-3 py-2 text-white hover:bg-gray-700 disabled:cursor-not-allowed disabled:bg-gray-400"
              >
                {producto.stock <= 0 ? "Sin stock" : "Agregar al carrito"}
              </button>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export default CatalogoPOS;
