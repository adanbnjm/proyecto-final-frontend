import { Navigate, Route, Routes } from "react-router-dom";

import Login from "./pages/Login";
import Tienda from "./pages/Tienda";
import Admin from "./pages/Admin";
import RutaProtegida from "./components/RutaProtegida";
import { useEffect, useState } from "react";
import axios from "axios";

import { obtenerPerfil } from "./services/auth.service";
import { useAuthStore } from "./store/auth.store";
import Registro from "./pages/Registro";

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
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/registro" element={<Registro />} />

      <Route
        path="/tienda"
        element={
          <RutaProtegida rolesPermitidos={["CLIENTE"]}>
            <Tienda />
          </RutaProtegida>
        }
      />

      <Route
        path="/admin"
        element={
          <RutaProtegida rolesPermitidos={["ADMIN", "CAJERO"]}>
            <Admin />
          </RutaProtegida>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
