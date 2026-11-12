import { useEffect, useState } from "react";
import axios from "axios";

import { obtenerCatalogo, type Producto } from "../services/productos.service";
import { useCarritoStore } from "../store/carrito.store";

export default function Tienda() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const agregarProducto = useCarritoStore((estado) => estado.agregarProducto);

  const productosEnCarrito = useCarritoStore((estado) => estado.productos);

  useEffect(() => {
    const cargarProductos = async () => {
      try {
        const datos = await obtenerCatalogo();
        setProductos(datos);
      } catch (error) {
        if (axios.isAxiosError(error)) {
          setError("No se pudo cargar el catálogo de productos.");
        } else {
          setError("Ocurrió un error inesperado.");
        }
      } finally {
        setCargando(false);
      }
    };

    cargarProductos();
  }, []);

  if (cargando) {
    return (
      <main className="min-h-screen bg-gray-100 p-8">
        <p className="text-center text-gray-600">Cargando productos...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-gray-100 p-8">
        <p className="text-center text-red-600">{error}</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <h1 className="mb-2 text-3xl font-bold text-gray-900">Nuestra tienda</h1>

      <p className="mb-8 text-gray-600">Explora nuestros productos.</p>

      {productos.length === 0 ? (
        <p className="text-gray-600">No hay productos disponibles.</p>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {productos.map((producto) => (
            <article
              key={producto.id}
              className="rounded-xl bg-white p-6 shadow"
            >
              <h2 className="text-xl font-semibold text-gray-900">
                {producto.nombre}
              </h2>

              <p className="mt-2 text-sm text-gray-600">
                {producto.descripcion}
              </p>

              <p className="mt-4 text-lg font-bold text-orange-600">
                Bs. {Number(producto.precioActual).toFixed(2)}
              </p>

              <p className="mt-2 text-sm text-gray-500">
                Stock disponible: {producto.stock}
              </p>
              <button
                onClick={() => agregarProducto(producto)}
                disabled={
                  producto.stock <= 0 ||
                  productosEnCarrito.some((item) => item.id === producto.id)
                }
                className="mt-4 w-full rounded-lg bg-orange-600 px-4 py-2 text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:bg-gray-400"
              >
                {producto.stock <= 0
                  ? "Sin stock"
                  : productosEnCarrito.some((item) => item.id === producto.id)
                    ? "Agregado al carrito"
                    : "Agregar al carrito"}
              </button>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
