import type { Caja } from "../../services/cajas.service";

interface CajaSectionProps {
  caja: Caja | null;
  cargandoCaja: boolean;
  montoApertura: string;
  setMontoApertura: (monto: string) => void;
  abriendoCaja: boolean;
  manejarAperturaCaja: () => void;
}

function CajaSection({
  caja,
  cargandoCaja,
  montoApertura,
  setMontoApertura,
  abriendoCaja,
  manejarAperturaCaja,
}: CajaSectionProps) {
  return (
    <section className="rounded-xl bg-white p-5 shadow">
      <h2 className="mb-4 text-xl font-semibold">Caja</h2>

      {cargandoCaja ? (
        <p>Consultando caja...</p>
      ) : caja ? (
        <p className="font-medium text-green-700">
          Caja abierta correctamente. Número de caja: {caja.id}
        </p>
      ) : (
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label
              htmlFor="montoApertura"
              className="mb-1 block text-sm font-medium"
            >
              Monto de apertura
            </label>

            <input
              id="montoApertura"
              type="number"
              min="0"
              step="0.01"
              value={montoApertura}
              onChange={(e) => setMontoApertura(e.target.value)}
              placeholder="Ej. 500"
              className="rounded-lg border border-gray-300 p-2"
            />
          </div>

          <button
            type="button"
            onClick={manejarAperturaCaja}
            disabled={abriendoCaja}
            className="rounded-lg bg-blue-600 px-5 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {abriendoCaja ? "Abriendo..." : "Abrir caja"}
          </button>
        </div>
      )}
    </section>
  );
}

export default CajaSection;
