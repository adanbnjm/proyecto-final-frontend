import type { Direccion } from "../../services/direcciones.service";
import type { Pedido } from "../../services/pedidos.service";
import FormularioDireccion from "./FormularioDireccion";

interface CheckoutProps {
  checkoutAbierto: boolean;
  direcciones: Direccion[];
  direccionId: number | null;
  mostrarFormulario: boolean;
  cargandoDirecciones: boolean;
  pedidoPendiente: Pedido | null;
  procesandoCompra: boolean;
  errorCompra: string;
  productosEnCarrito: unknown[];
  setDirecciones: React.Dispatch<React.SetStateAction<Direccion[]>>;
  setDireccionId: (id: number | null) => void;
  setMostrarFormulario: (mostrar: boolean) => void;
  setErrorCompra: (error: string) => void;
  manejarCompra: () => void;
}

export default function Checkout({
  checkoutAbierto,
  direcciones,
  direccionId,
  mostrarFormulario,
  cargandoDirecciones,
  pedidoPendiente,
  procesandoCompra,
  errorCompra,
  productosEnCarrito,
  setDirecciones,
  setDireccionId,
  setMostrarFormulario,
  setErrorCompra,
  manejarCompra,
}: CheckoutProps) {
  if (!checkoutAbierto) return null;

  return (
    <section className="space-y-5">
      {cargandoDirecciones ? (
        <p>Cargando direcciones...</p>
      ) : mostrarFormulario ? (
        <FormularioDireccion
          alGuardar={(direccion) => {
            setDirecciones((anteriores) => [direccion, ...anteriores]);
            setDireccionId(direccion.id);
            setMostrarFormulario(false);
            setErrorCompra("");
          }}
          alCancelar={() => setMostrarFormulario(false)}
        />
      ) : (
        <div className="rounded-xl bg-white p-6 shadow">
          <h2 className="mb-4 text-xl font-bold">Dirección de entrega</h2>

          {direcciones.length > 0 ? (
            <div className="space-y-3">
              {direcciones.map((direccion) => (
                <label
                  key={direccion.id}
                  className="flex cursor-pointer gap-3 rounded-lg border p-4"
                >
                  <input
                    type="radio"
                    name="direccion"
                    checked={direccionId === direccion.id}
                    onChange={() => setDireccionId(direccion.id)}
                  />

                  <span>
                    <strong>
                      {direccion.calle} {direccion.numero ?? ""}
                    </strong>

                    <span className="block text-sm text-gray-600">
                      {direccion.zona}, {direccion.ciudad},{" "}
                      {direccion.departamento}
                    </span>

                    {direccion.referencia && (
                      <span className="block text-sm text-gray-500">
                        {direccion.referencia}
                      </span>
                    )}
                  </span>
                </label>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">
              Todavía no tienes direcciones registradas.
            </p>
          )}

          <button
            type="button"
            onClick={() => setMostrarFormulario(true)}
            className="mt-4 text-sm font-semibold text-orange-600"
          >
            + Agregar otra dirección
          </button>
        </div>
      )}

      {errorCompra && (
        <p className="rounded-lg bg-red-100 p-3 text-red-700">{errorCompra}</p>
      )}

      {!mostrarFormulario && !cargandoDirecciones && (
        <button
          type="button"
          onClick={manejarCompra}
          disabled={
            procesandoCompra || productosEnCarrito.length === 0 || !direccionId
          }
          className="w-full rounded-lg bg-orange-600 p-3 font-semibold text-white hover:bg-orange-700 disabled:cursor-not-allowed disabled:bg-gray-400"
        >
          {procesandoCompra
            ? "Procesando compra..."
            : pedidoPendiente
              ? "Reintentar pago"
              : "Confirmar pedido y pagar"}
        </button>
      )}
    </section>
  );
}
