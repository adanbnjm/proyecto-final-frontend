import { useMemo } from "react";
import type { VentaHistorial } from "../../services/ventas.service";

interface PropsGraficoVentas {
  ventas: VentaHistorial[];
}

const obtenerFechaBolivia = (fecha: string | Date) => {
  const partes = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/La_Paz",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date(fecha));

  const valores = Object.fromEntries(
    partes.map((parte) => [parte.type, parte.value]),
  );

  return `${valores.year}-${valores.month}-${valores.day}`;
};

const formatearMonto = (monto: number) =>
  new Intl.NumberFormat("es-BO", {
    maximumFractionDigits: 0,
  }).format(monto);

export default function GraficoVentas({ ventas }: PropsGraficoVentas) {
  const datos = useMemo(() => {
    const hoy = obtenerFechaBolivia(new Date());
    const [anio, mes, dia] = hoy.split("-").map(Number);
    const fechaBase = new Date(Date.UTC(anio, mes - 1, dia));

    const fechas = Array.from({ length: 7 }, (_, indice) => {
      const fecha = new Date(fechaBase);
      fecha.setUTCDate(fechaBase.getUTCDate() - (6 - indice));

      return fecha.toISOString().slice(0, 10);
    });

    return fechas.map((fecha) => {
      const total = ventas
        .filter((venta) => obtenerFechaBolivia(venta.creadoEn) === fecha)
        .reduce((suma, venta) => suma + (Number(venta.total) || 0), 0);

      const fechaLocal = new Date(`${fecha}T12:00:00-04:00`);

      const diaSemana = new Intl.DateTimeFormat("es-BO", {
        timeZone: "America/La_Paz",
        weekday: "short",
      }).format(fechaLocal);

      return {
        fecha,
        diaSemana: diaSemana.replace(".", ""),
        dia: fecha.slice(8, 10),
        total,
      };
    });
  }, [ventas]);

  const maximo = Math.max(...datos.map((dato) => dato.total), 1);
  const totalSemana = datos.reduce((suma, dato) => suma + dato.total, 0);

  return (
    <article className="rounded-xl bg-white p-5 shadow-sm">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-gray-900">
            Ventas de los últimos 7 días
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Ingresos diarios registrados en el POS
          </p>
        </div>

        <div className="text-right">
          <p className="text-xs text-gray-500">Total de la semana</p>
          <p className="text-xl font-bold text-gray-900">
            Bs {formatearMonto(totalSemana)}
          </p>
        </div>
      </div>

      <div className="w-full overflow-x-auto">
        <svg
          viewBox="0 0 700 230"
          className="w-full min-w-[500px]"
          role="img"
          aria-label="Gráfico de ventas POS de los últimos siete días"
        >
          <line
            x1="25"
            y1="170"
            x2="675"
            y2="170"
            stroke="#E5E7EB"
            strokeWidth="1"
          />

          {datos.map((dato, indice) => {
            const x = 48 + indice * 95;
            const altura = dato.total > 0 ? (dato.total / maximo) * 125 : 0;
            const y = 170 - altura;

            return (
              <g key={dato.fecha}>
                <rect
                  x={x}
                  y={y}
                  width="42"
                  height={altura}
                  rx="6"
                  fill="#F97316"
                />

                <text
                  x={x + 21}
                  y={Math.max(y - 9, 14)}
                  textAnchor="middle"
                  fontSize="11"
                  fill="#374151"
                >
                  {dato.total > 0 ? formatearMonto(dato.total) : "0"}
                </text>

                <text
                  x={x + 21}
                  y="193"
                  textAnchor="middle"
                  fontSize="11"
                  fill="#6B7280"
                >
                  {dato.diaSemana}
                </text>

                <text
                  x={x + 21}
                  y="210"
                  textAnchor="middle"
                  fontSize="11"
                  fill="#9CA3AF"
                >
                  {dato.dia}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <p className="mt-2 text-xs text-gray-400">
        Montos expresados en bolivianos (BOB).
      </p>
    </article>
  );
}
