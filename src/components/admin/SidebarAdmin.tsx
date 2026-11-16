import { useAuthStore } from "../../store/auth.store";
import { useNavigate } from "react-router-dom";

export type SeccionAdmin =
  | "inicio"
  | "inventario"
  | "pedidos"
  | "caja"
  | "supervision"
  | "pos";

interface PropsSidebarAdmin {
  seccionActiva: SeccionAdmin;
  onCambiarSeccion: (seccion: SeccionAdmin) => void;
  esAdministrador: boolean;
}

export default function SidebarAdmin({
  seccionActiva,
  onCambiarSeccion,
  esAdministrador,
}: PropsSidebarAdmin) {
  const cerrarSesion = useAuthStore((estado) => estado.cerrarSesion);

  const navegar = useNavigate();
  const manejarCierreSesion = () => {
    cerrarSesion();
    navegar("/", { replace: true });
  };

  const opciones: {
    id: SeccionAdmin;
    nombre: string;
    icono: string;
  }[] = [
    { id: "inicio", nombre: "Inicio", icono: "⌂" },
    { id: "inventario", nombre: "Inventario", icono: "▦" },
    { id: "pedidos", nombre: "Pedidos", icono: "▤" },
    { id: "caja", nombre: "Gestión de caja", icono: "▣" },
    ...(esAdministrador
      ? [
          {
            id: "supervision" as const,
            nombre: "Supervisión de cajas",
            icono: "▥",
          },
        ]
      : []),
  ];

  const estaEnPuntoVenta = seccionActiva === "pos";

  return (
    <aside className="flex min-h-screen w-64 shrink-0 flex-col bg-[#17243A] px-4 py-6 text-white">
      <div className="mb-10 px-3">
        <h2 className="text-xl font-bold tracking-wide">NOVA TECH</h2>
        <p className="mt-1 text-xs text-slate-400">POS & Commerce</p>
      </div>

      <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
        Menú principal
      </p>

      <nav className="flex flex-col gap-2">
        {opciones.map((opcion) => {
          const activa = seccionActiva === opcion.id;

          return (
            <button
              key={opcion.id}
              type="button"
              onClick={() => onCambiarSeccion(opcion.id)}
              aria-current={activa ? "page" : undefined}
              className={`flex items-center gap-3 rounded-lg px-3 py-3 text-left text-sm font-medium transition-all duration-200 ${
                activa
                  ? "bg-[#F97316] text-white shadow-md"
                  : "text-slate-300 hover:bg-slate-700 hover:text-white"
              }`}
            >
              <span className="w-6 text-center text-lg" aria-hidden="true">
                {opcion.icono}
              </span>

              {opcion.nombre}
            </button>
          );
        })}
      </nav>

      <div className="mt-6 border-t border-slate-500 pt-5">
        <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
          Ventas
        </p>

        <button
          type="button"
          onClick={() => onCambiarSeccion("pos")}
          aria-current={estaEnPuntoVenta ? "page" : undefined}
          className={`flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm font-medium transition-all duration-200 ${
            estaEnPuntoVenta
              ? "bg-[#F97316] text-white shadow-md"
              : "text-slate-300 hover:bg-slate-700 hover:text-white"
          }`}
        >
          <span className="w-6 text-center text-lg" aria-hidden="true">
            🛒
          </span>
          Punto de Venta
        </button>
      </div>

      <div className="mt-auto border-t border-slate-500 px-3 pt-5">
        <button
          type="button"
          onClick={manejarCierreSesion}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-red-300 transition-colors hover:bg-red-500/10 hover:text-red-200"
        >
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
