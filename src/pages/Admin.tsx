import { useEffect, useState } from "react";
import axios from "axios";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  obtenerProductosAdministrativos,
  crearProducto,
  actualizarProducto,
  desactivarProducto,
  type ProductoAdministrativo,
} from "../services/productos.service";

import {
  esquemaProducto,
  type DatosProducto,
} from "../schemas/producto.schema";

import {
  obtenerCatalogoCategorias,
  type Categoria,
} from "../services/categorias.service";

import { useAuthStore } from "../store/auth.store";

export default function Admin() {
  const [productos, setProductos] = useState<ProductoAdministrativo[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const usuario = useAuthStore((estado) => estado.usuario);
  const esAdministrador = usuario?.rol === "ADMIN";

  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("todas");
  const productosFiltrados =
    categoriaSeleccionada === "todas"
      ? productos
      : productos.filter(
          (producto) => producto.categoriaId === Number(categoriaSeleccionada),
        );
  const [mensaje, setMensaje] = useState("");
  const [errorFormulario, setErrorFormulario] = useState("");
  const [productoEditando, setProductoEditando] =
    useState<ProductoAdministrativo | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<DatosProducto>({
    resolver: zodResolver(esquemaProducto),
    defaultValues: {
      codigo: "",
      nombre: "",
      descripcion: "",
      precioActual: 0,
      costoAdquisicion: 0,
      stock: 0,
      categoriaId: 0,
      activo: true,
    },
  });

  // Cargar productos.
  useEffect(() => {
    const cargarProductos = async () => {
      try {
        const datos = await obtenerProductosAdministrativos();
        setProductos(datos);
      } catch (error) {
        if (axios.isAxiosError(error)) {
          if (error.response?.status === 403) {
            setError("No tienes permisos para consultar el inventario.");
          } else {
            setError("No se pudo cargar el inventario.");
          }
        } else {
          setError("Ocurrió un error inesperado.");
        }
      } finally {
        setCargando(false);
      }
    };

    cargarProductos();
  }, []);

  // Cargar categorías.
  useEffect(() => {
    const cargarCategorias = async () => {
      try {
        const datos = await obtenerCatalogoCategorias();
        setCategorias(datos);
      } catch {
        setErrorFormulario("No se pudieron cargar las categorías.");
      }
    };

    cargarCategorias();
  }, []);

  // Crear producto.
  const enviarFormulario = async (datos: DatosProducto) => {
    setMensaje("");
    setErrorFormulario("");

    try {
      if (productoEditando) {
        const productoActualizado = await actualizarProducto(
          productoEditando.id,
          datos,
        );

        setProductos((productosActuales) =>
          productosActuales.map((producto) =>
            producto.id === productoActualizado.id
              ? productoActualizado
              : producto,
          ),
        );

        setMensaje("Producto actualizado correctamente.");
        setProductoEditando(null);
      } else {
        const nuevoProducto = await crearProducto(datos);

        setProductos((productosActuales) => [
          ...productosActuales,
          nuevoProducto,
        ]);

        setMensaje("Producto creado correctamente.");
      }

      reset({
        codigo: "",
        nombre: "",
        descripcion: "",
        precioActual: 0,
        costoAdquisicion: 0,
        stock: 0,
        categoriaId: 0,
        activo: true,
      });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 403) {
          setErrorFormulario("No tienes permisos para realizar esta acción.");
        } else if (error.response?.status === 409) {
          setErrorFormulario("Ya existe un producto con ese código.");
        } else {
          setErrorFormulario("No se pudo guardar el producto.");
        }
      } else {
        setErrorFormulario("Ocurrió un error inesperado.");
      }
    }
  };
  const seleccionarProducto = (producto: ProductoAdministrativo) => {
    setMensaje("");
    setErrorFormulario("");
    setProductoEditando(producto);

    reset({
      codigo: producto.codigo,
      nombre: producto.nombre,
      descripcion: producto.descripcion ?? "",
      precioActual: Number(producto.precioActual),
      costoAdquisicion: Number(producto.costoAdquisicion),
      stock: producto.stock,
      categoriaId: producto.categoriaId,
      activo: producto.activo,
    });
  };

  const manejarDesactivacion = async (producto: ProductoAdministrativo) => {
    const confirmar = window.confirm(
      `¿Deseas desactivar el producto ${producto.nombre}?`,
    );

    if (!confirmar) return;

    try {
      await desactivarProducto(producto.id);

      setProductos((productosActuales) =>
        productosActuales.map((elemento) =>
          elemento.id === producto.id
            ? { ...elemento, activo: false }
            : elemento,
        ),
      );

      setMensaje("Producto desactivado correctamente.");
    } catch {
      setErrorFormulario("No se pudo desactivar el producto.");
    }
  };

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold text-gray-900">Panel de operaciones</h1>

      <p className="mb-8 mt-2 text-gray-600">
        Gestión del inventario de productos.
      </p>

      {/* Formulario disponible solamente para ADMIN */}
      {esAdministrador && (
        <section className="mb-8 rounded-xl bg-white p-6 shadow">
          <h2 className="mb-6 text-xl font-bold text-gray-900">
            {productoEditando ? "Editar producto" : "Registrar producto"}
          </h2>

          {mensaje && (
            <p className="mb-4 rounded-lg bg-green-50 p-3 text-green-700">
              {mensaje}
            </p>
          )}

          {errorFormulario && (
            <p className="mb-4 rounded-lg bg-red-50 p-3 text-red-700">
              {errorFormulario}
            </p>
          )}

          <form
            onSubmit={handleSubmit(enviarFormulario)}
            className="grid grid-cols-1 gap-4 md:grid-cols-2"
          >
            <div>
              <label className="mb-1 block text-sm font-medium">Código</label>
              <input
                {...register("codigo")}
                className="w-full rounded-lg border p-3"
                placeholder="Ej. REP-003"
              />
              {errors.codigo && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.codigo.message}
                </p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Nombre</label>
              <input
                {...register("nombre")}
                className="w-full rounded-lg border p-3"
                placeholder="Nombre del producto"
              />
              {errors.nombre && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.nombre.message}
                </p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium">
                Descripción
              </label>
              <textarea
                {...register("descripcion")}
                className="w-full rounded-lg border p-3"
                placeholder="Descripción del producto"
                rows={3}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                Precio de venta (Bs.)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                {...register("precioActual", { valueAsNumber: true })}
                className="w-full rounded-lg border p-3"
              />
              {errors.precioActual && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.precioActual.message}
                </p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                Costo de adquisición (Bs.)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                {...register("costoAdquisicion", { valueAsNumber: true })}
                className="w-full rounded-lg border p-3"
              />
              {errors.costoAdquisicion && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.costoAdquisicion.message}
                </p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                Stock inicial
              </label>
              <input
                type="number"
                min="0"
                step="1"
                {...register("stock", { valueAsNumber: true })}
                className="w-full rounded-lg border p-3"
              />
              {errors.stock && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.stock.message}
                </p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                Categoría
              </label>
              <select
                {...register("categoriaId", { valueAsNumber: true })}
                className="w-full rounded-lg border p-3"
              >
                <option value="0">Selecciona una categoría</option>

                {categorias.map((categoria) => (
                  <option key={categoria.id} value={categoria.id}>
                    {categoria.nombre}
                  </option>
                ))}
              </select>

              {errors.categoriaId && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.categoriaId.message}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2 md:col-span-2">
              <input
                type="checkbox"
                {...register("activo")}
                id="activo"
                className="h-4 w-4"
              />
              <label htmlFor="activo" className="text-sm">
                Producto activo
              </label>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-gray-900 px-5 py-3 font-medium text-white hover:bg-gray-700 disabled:opacity-50 md:col-span-2"
            >
              {isSubmitting
                ? "Guardando..."
                : productoEditando
                  ? "Guardar cambios"
                  : "Registrar producto"}
            </button>

            {productoEditando && (
              <button
                type="button"
                onClick={() => {
                  setProductoEditando(null);
                  reset();
                  setMensaje("");
                  setErrorFormulario("");
                }}
                className="rounded-lg border px-5 py-3 md:col-span-2"
              >
                Cancelar edición
              </button>
            )}
          </form>
        </section>
      )}

      {/* Tabla de inventario */}
      <section className="overflow-x-auto rounded-xl bg-white shadow">
        <h2 className="p-6 text-xl font-bold text-gray-900">Inventario</h2>
        <div className="px-6 pb-4">
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Filtrar por categoría
          </label>

          <select
            value={categoriaSeleccionada}
            onChange={(evento) => setCategoriaSeleccionada(evento.target.value)}
            className="w-full max-w-xs rounded-lg border p-3"
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
                  <th className="p-4">Stock</th>
                  <th className="p-4">Estado</th>
                  <th className="p-4">Acciones</th>
                </tr>
              </thead>

              <tbody>
                {productosFiltrados.map((producto) => (
                  <tr key={producto.id} className="border-t border-gray-100">
                    <td className="p-4">{producto.codigo}</td>
                    <td className="p-4">{producto.nombre}</td>
                    <td className="p-4">
                      Bs. {Number(producto.costoAdquisicion).toFixed(2)}
                    </td>
                    <td className="p-4">
                      Bs. {Number(producto.precioActual).toFixed(2)}
                    </td>
                    <td className="p-4">{producto.stock}</td>
                    <td className="p-4">
                      {producto.activo ? "Activo" : "Inactivo"}
                    </td>

                    <td className="p-4">
                      {esAdministrador && (
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => seleccionarProducto(producto)}
                            className="rounded bg-gray-200 px-3 py-2 text-sm hover:bg-gray-300"
                          >
                            Editar
                          </button>

                          {producto.activo && (
                            <button
                              type="button"
                              onClick={() => manejarDesactivacion(producto)}
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

            {productosFiltrados.length === 0 && (
              <p className="p-6 text-center text-gray-500">
                No hay productos para mostrar.
              </p>
            )}
          </>
        )}
      </section>
    </main>
  );
}
