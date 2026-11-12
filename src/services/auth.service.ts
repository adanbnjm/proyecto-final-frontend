import api from "../lib/axios";
import type { DatosLogin } from "../schemas/auth.schema";
import type { DatosRegistro } from "../schemas/auth.schema";

export interface Usuario {
  id: number;
  nombre: string;
  email: string;
  rol: "ADMIN" | "CAJERO" | "CLIENTE";
}

interface RespuestaLogin {
  mensaje: string;
  accessToken: string;
  usuario: Usuario;
}

export const iniciarSesion = async (
  datos: DatosLogin,
): Promise<RespuestaLogin> => {
  const respuesta = await api.post<RespuestaLogin>("/auth/login", datos);

  return respuesta.data;
};

export const registrarCliente = async (
  datos: DatosRegistro,
): Promise<RespuestaLogin> => {
  const respuesta = await api.post<RespuestaLogin>("/auth/registro", datos);

  return respuesta.data;
};
interface RespuestaPerfil {
  mensaje: string;
  usuario: Usuario;
}
export const obtenerPerfil = async (): Promise<RespuestaPerfil> => {
  const respuesta = await api.get<RespuestaPerfil>("/auth/perfil");

  return respuesta.data;
};
