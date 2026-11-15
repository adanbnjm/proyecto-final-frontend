import { useEffect, useState } from "react";

import {
  abrirCaja,
  obtenerCajaAbierta,
  cerrarCaja,
  type Caja,
  type ConciliacionCaja,
} from "../../services/cajas.service";

export default function GestionCaja() {
  const [caja, setCaja] = useState<Caja | null>(null);
  const [monto, setMonto] = useState("");
  const [conciliacion, setConciliacion] = useState<ConciliacionCaja | null>(
    null,
  );

  const [cargando, setCargando] = useState(true);
  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    const cargarCaja = async () => {
      try {
        const cajaAbierta = await obtenerCajaAbierta();
        setCaja(cajaAbierta);
      } catch {
        setError("No se pudo consultar la caja abierta.");
      } finally {
        setCargando(false);
      }
    };

    cargarCaja();
  }, []);

  const manejarApertura = async (evento: React.FormEvent) => {
    evento.preventDefault();

    const montoInicial = Number(monto);

    if (!monto || !Number.isFinite(montoInicial) || montoInicial < 0) {
      setError("Ingresa un monto de apertura válido.");
      return;
    }

    setProcesando(true);
    setError("");
    setMensaje("");
    setConciliacion(null);

    try {
      const respuesta = await abrirCaja(montoInicial);

      setCaja(respuesta.caja);
      setMonto("");
      setMensaje(respuesta.mensaje);
    } catch {
      setError("No se pudo abrir la caja.");
    } finally {
      setProcesando(false);
    }
  };

  const manejarCierre = async (evento: React.FormEvent) => {
    evento.preventDefault();

    const montoFinal = Number(monto);

    if (!monto || !Number.isFinite(montoFinal) || montoFinal < 0) {
      setError("Ingresa el efectivo contado correctamente.");
      return;
    }

    if (!caja) return;

    setProcesando(true);
    setError("");
    setMensaje("");

    try {
      const respuesta = await cerrarCaja(caja.id, montoFinal);

      setConciliacion(respuesta.conciliacion);
      setCaja(null);
      setMonto("");
      setMensaje(respuesta.mensaje);
    } catch {
      setError("No se pudo cerrar la caja.");
    } finally {
      setProcesando(false);
    }
  };

  const formatoDinero = (valor: number) => `Bs. ${valor.toFixed(2)}`;

  if (cargando) {
    return <p>Cargando información de caja...</p>;
  }

  return (
    <section className="mb-8 rounded-xl bg-white p-6 shadow">
      <h2 className="mb-4 text-2xl font-bold text-gray-900">Gestión de caja</h2>

      {error && (
        <p className="mb-4 rounded bg-red-100 p-3 text-red-700">{error}</p>
      )}

      {mensaje && (
        <p className="mb-4 rounded bg-green-100 p-3 text-green-700">
          {mensaje}
        </p>
      )}

      {!caja ? (
        <form onSubmit={manejarApertura} className="space-y-4">
          <h3 className="font-semibold text-gray-800">Abrir caja</h3>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Monto inicial (Bs.)
            </label>

            <input
              type="number"
              min="0"
              step="0.01"
              value={monto}
              onChange={(evento) => setMonto(evento.target.value)}
              className="w-full rounded-lg border border-gray-300 p-3"
              placeholder="Ej. 500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={procesando}
            className="rounded-lg bg-blue-600 px-5 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {procesando ? "Abriendo..." : "Abrir caja"}
          </button>
        </form>
      ) : (
        <form onSubmit={manejarCierre} className="space-y-4">
          <h3 className="font-semibold text-green-700">
            Caja abierta #{caja.id}
          </h3>

          <p className="text-gray-600">
            Monto de apertura:{" "}
            <strong>{formatoDinero(Number(caja.montoApertura))}</strong>
          </p>

          <p className="text-sm text-gray-500">
            Apertura: {new Date(caja.fechaApertura).toLocaleString()}
          </p>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Efectivo físico contado (Bs.)
            </label>

            <input
              type="number"
              min="0"
              step="0.01"
              value={monto}
              onChange={(evento) => setMonto(evento.target.value)}
              className="w-full rounded-lg border border-gray-300 p-3"
              placeholder="Ej. 800"
              required
            />
          </div>

          <button
            type="submit"
            disabled={procesando}
            className="rounded-lg bg-red-600 px-5 py-2 text-white hover:bg-red-700 disabled:opacity-50"
          >
            {procesando ? "Cerrando..." : "Cerrar caja y conciliar"}
          </button>
        </form>
      )}

      {conciliacion && (
        <div className="mt-6 rounded-lg border border-gray-200 p-5">
          <h3 className="mb-4 text-xl font-bold text-gray-900">
            Resultado de conciliación
          </h3>

          <div className="space-y-2 text-gray-700">
            <p>
              Monto de apertura:{" "}
              <strong>{formatoDinero(conciliacion.montoApertura)}</strong>
            </p>

            <p>
              Total de ventas:{" "}
              <strong>{formatoDinero(conciliacion.totalVentas)}</strong>
            </p>

            <p>
              Ventas en efectivo:{" "}
              <strong>{formatoDinero(conciliacion.totalEfectivo)}</strong>
            </p>

            <p>
              Ventas con tarjeta:{" "}
              <strong>{formatoDinero(conciliacion.totalTarjeta)}</strong>
            </p>

            <p>
              Ventas con QR:{" "}
              <strong>{formatoDinero(conciliacion.totalQR)}</strong>
            </p>

            <hr className="my-3" />

            <p>
              Efectivo esperado:{" "}
              <strong>{formatoDinero(conciliacion.efectivoEsperado)}</strong>
            </p>

            <p>
              Efectivo reportado:{" "}
              <strong>{formatoDinero(conciliacion.efectivoReportado)}</strong>
            </p>

            <p className="text-lg font-bold">
              Diferencia:{" "}
              <span
                className={
                  conciliacion.diferencia === 0
                    ? "text-green-700"
                    : "text-red-700"
                }
              >
                {formatoDinero(conciliacion.diferencia)}
              </span>
            </p>

            <p className="text-sm text-gray-500">
              {conciliacion.diferencia === 0
                ? "La caja está cuadrada."
                : conciliacion.diferencia < 0
                  ? "Falta efectivo respecto al monto esperado."
                  : "Hay un sobrante de efectivo."}
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
