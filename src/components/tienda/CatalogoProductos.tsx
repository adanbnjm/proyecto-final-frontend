import { useCarritoStore } from "../../store/carrito.store";
import type { Producto } from "../../services/productos.service";

interface CatalogoProductosProps {
  productos: Producto[];
}

export function obtenerImagenProducto(nombre: string): string | null {
  const nombreNormalizado = nombre.toLowerCase();

  if (nombreNormalizado.includes("aceite mineral")) {
    return "https://cerma.mx/cdn/shop/files/S_ECOMMERCE_images_erp_rezised_MOT200020W50L_001.png?v=1742972852";
  }

  if (
    nombreNormalizado.includes("aceite sintético") ||
    nombreNormalizado.includes("aceite sintetico")
  ) {
    return "https://www.static-src.com/wcsstore/Indraprastha/images/catalog/full/catalog-image/111/MTA-147055979/stp_oli_synthetic_stp_motor_oil_10w-40_-_oli_mesin_sintetik_946_ml_full01_epsz9ntk.jpg";
  }

  if (nombreNormalizado.includes("casco")) {
    return "https://commons.wikimedia.org/wiki/Special:Redirect/file/Full-Face_Helmet_9274.jpg";
  }

  if (nombreNormalizado.includes("filtro de aceite")) {
    return "https://owari.com.mx/storage/productos/19210284/17363_19210284_A_.jpg";
  }

  if (nombreNormalizado.includes("guantes")) {
    return "https://www.reisemoto.com/cdn/shop/files/Reise_Austra_Gloves_Sand_7431003023_.1.jpg?v=1734416858";
  }

  if (nombreNormalizado.includes("pastillas de freno")) {
    return "https://commons.wikimedia.org/wiki/Special:Redirect/file/Automobile_brake_pad.jpg";
  }

  return null;
}

export default function CatalogoProductos({
  productos,
}: CatalogoProductosProps) {
  const agregarProducto = useCarritoStore((estado) => estado.agregarProducto);
  const productosEnCarrito = useCarritoStore((estado) => estado.productos);

  if (productos.length === 0) {
    return <p className="text-gray-600">No hay productos disponibles.</p>;
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {productos.map((producto) => {
        const cantidadEnCarrito = productosEnCarrito.filter(
          (item) => item.id === producto.id,
        ).length;

        const stockMaximoAlcanzado = producto.stock <= cantidadEnCarrito;
        const imagen = obtenerImagenProducto(producto.nombre);

        return (
          <article key={producto.id} className="rounded-xl bg-white p-6 shadow">
            {imagen && (
              <div className="mb-4 flex h-48 items-center justify-center overflow-hidden rounded-lg bg-gray-50">
                <img
                  src={imagen}
                  alt={producto.nombre}
                  className="h-full w-full object-contain"
                  loading="lazy"
                />
              </div>
            )}

            <h2 className="text-xl font-semibold text-gray-900">
              {producto.nombre}
            </h2>

            <p className="mt-2 text-sm text-gray-600">{producto.descripcion}</p>

            <p className="mt-4 text-lg font-bold text-orange-600">
              Bs. {Number(producto.precioActual).toFixed(2)}
            </p>

            <p className="mt-2 text-sm text-gray-500">
              Stock disponible: {producto.stock}
            </p>

            <button
              onClick={() => agregarProducto(producto)}
              disabled={stockMaximoAlcanzado}
              className="mt-4 w-full rounded-lg bg-orange-600 px-4 py-2 text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:bg-gray-400"
            >
              {stockMaximoAlcanzado
                ? "Stock máximo agregado"
                : "Agregar al carrito"}
            </button>
          </article>
        );
      })}
    </div>
  );
}
