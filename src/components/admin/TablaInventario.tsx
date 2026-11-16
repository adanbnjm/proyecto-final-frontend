import type { ProductoAdministrativo } from "../../services/productos.service";
import type { Categoria } from "../../services/categorias.service";

interface Props {
  productos: ProductoAdministrativo[];
  categorias: Categoria[];
  categoriaSeleccionada: string;
  cargando: boolean;
  error: string;
  esAdministrador: boolean;
  onCambiarCategoria: (categoriaId: string) => void;
  onEditar: (producto: ProductoAdministrativo) => void;
  onDesactivar: (producto: ProductoAdministrativo) => void;
}

export default function TablaInventario({
  productos,
  categorias,
  categoriaSeleccionada,
  cargando,
  error,
  esAdministrador,
  onCambiarCategoria,
  onEditar,
  onDesactivar,
}: Props) {
  return (
    <section className="overflow-x-auto rounded-xl bg-white shadow">
      <div className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-bold text-gray-900">Inventario</h2>

        <select
          value={categoriaSeleccionada}
          onChange={(evento) => onCambiarCategoria(evento.target.value)}
          className="rounded-lg border p-3"
        >
          <option value="todas">Todas las categorías</option>

          {categorias.map((categoria) => (
            <option key={categoria.id} value={categoria.id}>
              {categoria.nombre}
            </option>
          ))}
        </select>
      </div>

      {cargando ? (
        <p className="p-6 text-gray-600">Cargando inventario...</p>
      ) : error ? (
        <p className="m-6 rounded-lg bg-red-50 p-4 text-red-700">{error}</p>
      ) : (
        <>
          <table className="w-full text-left">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-4">Código</th>
                <th className="p-4">Producto</th>
                <th className="p-4">Costo</th>
                <th className="p-4">Precio</th>
                <th className="p-4">Stock físico</th>
                <th className="p-4">Reservado</th>
                <th className="p-4">Disponible</th>
                <th className="p-4">Estado</th>
                <th className="p-4">Acciones</th>
              </tr>
            </thead>

            <tbody>
              {productos.map((producto) => (
                <tr
                  key={producto.id}
                  className="border-t border-slate-900 transition-colors hover:bg-orange-50/50"
                >
                  <td className="p-4">{producto.codigo}</td>
                  <td className="p-4">{producto.nombre}</td>
                  <td className="p-4">
                    Bs. {Number(producto.costoAdquisicion).toFixed(2)}
                  </td>
                  <td className="p-4">
                    Bs. {Number(producto.precioActual).toFixed(2)}
                  </td>
                  <td className="p-4">{producto.stock}</td>
                  <td className="p-4">{producto.stockReservado}</td>
                  <td className="p-4">{producto.stockDisponible}</td>
                  <td className="p-4">
                    {producto.activo ? "Activo" : "Inactivo"}
                  </td>

                  <td className="p-4">
                    {esAdministrador && (
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => onEditar(producto)}
                          className="rounded bg-gray-200 px-3 py-2 text-sm hover:bg-gray-300"
                        >
                          Editar
                        </button>

                        {producto.activo && (
                          <button
                            type="button"
                            onClick={() => onDesactivar(producto)}
                            className="rounded bg-red-100 px-3 py-2 text-sm text-red-700 hover:bg-red-200"
                          >
                            Desactivar
                          </button>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {productos.length === 0 && (
            <p className="p-6 text-center text-gray-500">
              No hay productos registrados en esta categoría.
            </p>
          )}
        </>
      )}
    </section>
  );
}
