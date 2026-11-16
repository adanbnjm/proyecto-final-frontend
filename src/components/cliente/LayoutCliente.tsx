import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/auth.store";

export default function LayoutCliente() {
  const cerrarSesion = useAuthStore((estado) => estado.cerrarSesion);
  const usuario = useAuthStore((estado) => estado.usuario);
  const navegar = useNavigate();

  const manejarCierreSesion = () => {
    cerrarSesion();
    navegar("/", { replace: true });
  };

  const clasesNavegacion = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 rounded-xl px-4 py-3 font-semibold transition-colors ${
      isActive
        ? "bg-orange-600 text-white shadow-sm"
        : "text-slate-600 hover:bg-orange-50 hover:text-orange-700"
    }`;

  return (
    <div className="min-h-screen bg-slate-50">
      <aside className="fixed left-0 top-0 z-50 hidden h-screen w-72 flex-col justify-between border-r border-slate-100 bg-white shadow-sm md:flex">
        <div className="p-6">
          <div className="mb-10 flex items-center gap-3">
            <div>
              <h2 className="text-xl font-extrabold tracking-tight text-slate-900">
                NOVA TECH
              </h2>
              <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                Área del cliente
              </p>
            </div>
          </div>

          <nav className="flex flex-col gap-2">
            <NavLink to="/tienda" end className={clasesNavegacion}>
              <span aria-hidden="true">▣</span>
              Nuestra tienda
            </NavLink>

            <NavLink to="/mis-pedidos" className={clasesNavegacion}>
              <span aria-hidden="true">▤</span>
              Mis pedidos
            </NavLink>
          </nav>
        </div>

        <div className="border-t border-slate-100 bg-orange-50/50 p-6">
          <p className="truncate text-sm font-semibold text-slate-800">
            {usuario?.nombre || "Mi cuenta"}
          </p>

          <button
            type="button"
            onClick={manejarCierreSesion}
            className="mt-5 flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50"
          >
            <span aria-hidden="true"></span>
            Cerrar sesión
          </button>
        </div>
      </aside>

      <div className="min-h-screen md:pl-72">
        <header className="fixed left-0 right-0 top-0 z-40 flex h-16 items-center justify-between border-b border-slate-100 bg-white/95 px-5 shadow-sm backdrop-blur md:left-72 md:px-8">
          <span className="text-sm font-medium text-slate-600">
            portal de clientes
          </span>

          <span className="rounded-lg bg-orange-50 px-3 py-2 text-sm font-semibold text-orange-700">
            Área del cliente
          </span>
        </header>

        <nav className="fixed bottom-0 left-0 right-0 z-50 flex justify-around border-t border-slate-200 bg-white p-2 md:hidden">
          <NavLink to="/tienda" end className={clasesNavegacion}>
            Tienda
          </NavLink>
          <NavLink to="/mis-pedidos" className={clasesNavegacion}>
            Mis pedidos
          </NavLink>
          <button
            type="button"
            onClick={manejarCierreSesion}
            className="rounded-xl px-3 py-3 text-sm font-semibold text-red-600"
          >
            Salir
          </button>
        </nav>

        <main className="min-h-screen px-4 pb-20 pt-20 md:px-8 md:pb-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
