import { Navigate, Route, Routes } from "react-router-dom";
import LayoutCliente from "./components/cliente/LayoutCliente";

import Login from "./pages/Login";
import RutaProtegida from "./components/RutaProtegida";
import { lazy, Suspense, useEffect, useState } from "react";
import axios from "axios";

import { obtenerPerfil } from "./services/auth.service";
import { useAuthStore } from "./store/auth.store";
import Registro from "./pages/Registro";

const Tienda = lazy(() => import("./pages/Tienda"));
const MisPedidos = lazy(() => import("./pages/MisPedidos"));
const Admin = lazy(() => import("./pages/Admin"));

function App() {
  const [cargandoSesion, setCargandoSesion] = useState(true);

  const accessToken = useAuthStore((estado) => estado.accessToken);
  const actualizarUsuario = useAuthStore((estado) => estado.actualizarUsuario);
  const cerrarSesion = useAuthStore((estado) => estado.cerrarSesion);

  useEffect(() => {
    let cancelado = false;

    const validarSesion = async () => {
      setCargandoSesion(true);

      if (!accessToken) {
        setCargandoSesion(false);
        return;
      }

      try {
        const respuesta = await obtenerPerfil();

        if (!cancelado) {
          actualizarUsuario(respuesta.usuario);
        }
      } catch (error) {
        if (
          !cancelado &&
          axios.isAxiosError(error) &&
          error.response?.status === 401
        ) {
          cerrarSesion();
        }
      } finally {
        if (!cancelado) {
          setCargandoSesion(false);
        }
      }
    };

    validarSesion();

    return () => {
      cancelado = true;
    };
  }, [accessToken, actualizarUsuario, cerrarSesion]);
  if (cargandoSesion) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-lg font-medium">Verificando sesión...</p>
      </main>
    );
  }
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center">
          <p className="text-lg font-medium">Cargando página...</p>
        </main>
      }
    >
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/registro" element={<Registro />} />

        <Route
          element={
            <RutaProtegida rolesPermitidos={["CLIENTE"]}>
              <LayoutCliente />
            </RutaProtegida>
          }
        >
          <Route path="/tienda" element={<Tienda />} />
          <Route path="/mis-pedidos" element={<MisPedidos />} />
        </Route>

        <Route
          path="/admin"
          element={
            <RutaProtegida rolesPermitidos={["ADMIN", "CAJERO"]}>
              <Admin />
            </RutaProtegida>
          }
        />
        <Route
          path="/pos"
          element={
            <RutaProtegida rolesPermitidos={["ADMIN", "CAJERO"]}>
              <Navigate to="/admin" replace state={{ seccionInicial: "pos" }} />
            </RutaProtegida>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

export default App;
