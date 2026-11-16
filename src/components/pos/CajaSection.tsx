import type { Caja } from "../../services/cajas.service";

interface CajaSectionProps {
  caja: Caja | null;
  cargandoCaja: boolean;
}

function CajaSection({ caja, cargandoCaja }: CajaSectionProps) {
  return (
    <section className="rounded-xl bg-white p-5 shadow">
      <h2 className="mb-4 text-xl font-semibold">Estado de caja</h2>

      {cargandoCaja ? (
        <p className="text-gray-500">Consultando caja...</p>
      ) : caja ? (
        <div className="rounded-lg bg-green-50 p-4">
          <p className="font-semibold text-green-700">
            Caja abierta correctamente. Número: #{caja.id}
          </p>

          <p className="mt-1 text-sm text-gray-600">
            Monto de apertura:{" "}
            <strong>Bs. {Number(caja.montoApertura).toFixed(2)}</strong>
          </p>
        </div>
      ) : (
        <div className="rounded-lg bg-amber-50 p-4">
          <p className="font-medium text-amber-700">No hay una caja abierta.</p>
          <p className="mt-1 text-sm text-amber-700">
            Dirígete a Gestión de Caja para abrir una antes de registrar ventas.
          </p>
        </div>
      )}
    </section>
  );
}

export default CajaSection;
