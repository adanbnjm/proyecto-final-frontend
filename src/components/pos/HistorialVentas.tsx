import { useEffect, useState } from "react";
import axios from "axios";

import {
  obtenerHistorialVentas,
  type VentaHistorial,
} from "../../services/ventas.service";

interface HistorialVentasProps {
  actualizar: number;
}

const obtenerFechaLocal = () => {
  const fecha = new Date();

  const año = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const dia = String(fecha.getDate()).padStart(2, "0");

  return `${año}-${mes}-${dia}`;
};

function HistorialVentas({ actualizar }: HistorialVentasProps) {
  const [fechaHistorial, setFechaHistorial] = useState(obtenerFechaLocal());
  const [ventasHistorial, setVentasHistorial] = useState<VentaHistorial[]>([]);
  const [cargandoHistorial, setCargandoHistorial] = useState(true);
  const [errorHistorial, setErrorHistorial] = useState("");

  useEffect(() => {
    let cancelado = false;

    const cargarHistorial = async () => {
      setCargandoHistorial(true);
      setErrorHistorial("");

      try {
        const ventas = await obtenerHistorialVentas(fechaHistorial);

        if (!cancelado) {
          setVentasHistorial(ventas);
        }
      } catch (error) {
        if (!cancelado) {
          setVentasHistorial([]);

          if (axios.isAxiosError(error)) {
            const mensaje = error.response?.data?.message;

            setErrorHistorial(
              Array.isArray(mensaje)
                ? mensaje.join(", ")
                : mensaje || "No se pudo consultar el historial.",
            );
          } else {
            setErrorHistorial("Ocurrió un error al consultar el historial.");
          }
        }
      } finally {
        if (!cancelado) {
          setCargandoHistorial(false);
        }
      }
    };

    cargarHistorial();

    return () => {
      cancelado = true;
    };
  }, [fechaHistorial, actualizar]);

  return (
    <section className="rounded-xl bg-white p-5 shadow">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold">Historial de ventas</h2>

          <p className="mt-1 text-sm text-gray-500">
            Consulta las ventas realizadas en una fecha específica.
          </p>
        </div>

        <div>
          <label
            htmlFor="fechaHistorial"
            className="mb-1 block text-sm font-medium"
          >
            Fecha de consulta
          </label>

          <input
            id="fechaHistorial"
            type="date"
            value={fechaHistorial}
            onChange={(e) => setFechaHistorial(e.target.value)}
            className="rounded-lg border border-gray-300 p-2"
          />
        </div>
      </div>

      {cargandoHistorial ? (
        <p className="py-6 text-center text-gray-500">Cargando historial...</p>
      ) : errorHistorial ? (
        <p className="rounded-lg bg-red-100 p-3 text-red-700">
          {errorHistorial}
        </p>
      ) : ventasHistorial.length === 0 ? (
        <p className="py-6 text-center text-gray-500">
          No hay ventas registradas para esta fecha.
        </p>
      ) : (
        <>
          <p className="mb-4 text-sm font-medium text-gray-600">
            {ventasHistorial.length}{" "}
            {ventasHistorial.length === 1
              ? "venta encontrada"
              : "ventas encontradas"}
          </p>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] border-collapse text-left">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="p-3 text-sm font-semibold">Venta</th>
                  <th className="p-3 text-sm font-semibold">Hora</th>
                  <th className="p-3 text-sm font-semibold">Productos</th>
                  <th className="p-3 text-sm font-semibold">Método de pago</th>
                  <th className="p-3 text-right text-sm font-semibold">
                    Total
                  </th>
                </tr>
              </thead>

              <tbody>
                {ventasHistorial.map((venta) => (
                  <tr
                    key={venta.id}
                    className="border-b border-gray-100 align-top hover:bg-gray-50"
                  >
                    <td className="p-3 font-medium">#{venta.id}</td>

                    <td className="p-3 whitespace-nowrap">
                      {new Date(venta.creadoEn).toLocaleTimeString("es-BO", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>

                    <td className="p-3">
                      <ul className="space-y-1">
                        {venta.detalles.map((detalle) => (
                          <li key={detalle.id} className="text-sm">
                            {detalle.producto.nombre}
                            <span className="text-gray-500">
                              {" "}
                              × {detalle.cantidad}
                            </span>

                            <p className="text-xs text-gray-500">
                              Bs. {Number(detalle.precioUnitario).toFixed(2)}{" "}
                              c/u
                            </p>
                          </li>
                        ))}
                      </ul>
                    </td>

                    <td className="p-3">
                      {venta.metodoPago === "EFECTIVO"
                        ? "Efectivo"
                        : venta.metodoPago === "TARJETA"
                          ? "Tarjeta"
                          : venta.metodoPago === "QR"
                            ? "QR"
                            : venta.metodoPago}
                    </td>

                    <td className="p-3 text-right font-semibold whitespace-nowrap">
                      Bs. {Number(venta.total).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-5 flex justify-end border-t border-gray-200 pt-4">
            <p className="text-lg font-bold">
              Total del día: Bs.{" "}
              {ventasHistorial
                .reduce(
                  (acumulado, venta) => acumulado + Number(venta.total),
                  0,
                )
                .toFixed(2)}
            </p>
          </div>
        </>
      )}
    </section>
  );
}

export default HistorialVentas;
