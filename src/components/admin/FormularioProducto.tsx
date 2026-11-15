import type { FormEventHandler } from "react";
import type { FieldErrors, UseFormRegister } from "react-hook-form";

import type { DatosProducto } from "../../schemas/producto.schema";
import type { ProductoAdministrativo } from "../../services/productos.service";
import type { Categoria } from "../../services/categorias.service";

interface Props {
  categorias: Categoria[];
  productoEditando: ProductoAdministrativo | null;
  mensaje: string;
  errorFormulario: string;
  register: UseFormRegister<DatosProducto>;
  errors: FieldErrors<DatosProducto>;
  isSubmitting: boolean;
  onSubmit: FormEventHandler<HTMLFormElement>;
  onCancel: () => void;
}

export default function FormularioProducto({
  categorias,
  productoEditando,
  mensaje,
  errorFormulario,
  register,
  errors,
  isSubmitting,
  onSubmit,
  onCancel,
}: Props) {
  return (
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
        onSubmit={onSubmit}
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
            <p className="mt-1 text-sm text-red-600">{errors.codigo.message}</p>
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
            <p className="mt-1 text-sm text-red-600">{errors.nombre.message}</p>
          )}
        </div>

        <div className="md:col-span-2">
          <label className="mb-1 block text-sm font-medium">Descripción</label>
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
            <p className="mt-1 text-sm text-red-600">{errors.stock.message}</p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Categoría</label>
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
            onClick={onCancel}
            className="rounded-lg border px-5 py-3 md:col-span-2"
          >
            Cancelar edición
          </button>
        )}
      </form>
    </section>
  );
}
