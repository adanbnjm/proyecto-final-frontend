import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";

import { useAuthStore } from "../store/auth.store";
import type { Usuario } from "../services/auth.service";

interface PropsRutaProtegida {
  children: ReactNode;
  rolesPermitidos: Usuario["rol"][];
}

export default function RutaProtegida({
  children,
  rolesPermitidos,
}: PropsRutaProtegida) {
  const accessToken = useAuthStore((estado) => estado.accessToken);
  const usuario = useAuthStore((estado) => estado.usuario);

  if (!accessToken || !usuario) {
    return <Navigate to="/" replace />;
  }

  if (!rolesPermitidos.includes(usuario.rol)) {
    return (
      <Navigate to={usuario.rol === "CLIENTE" ? "/tienda" : "/admin"} replace />
    );
  }

  return children;
}
