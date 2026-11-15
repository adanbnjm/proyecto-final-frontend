import api from "../lib/axios";

export interface Direccion {
  id: number;
  departamento: string;
  ciudad: string;
  zona: string;
  calle: string;
  numero: string | null;
  referencia: string | null;
}

export interface DatosDireccion {
  departamento: string;
  ciudad: string;
  zona: string;
  calle: string;
  numero?: string;
  referencia?: string;
}

export const obtenerDirecciones = async (): Promise<Direccion[]> => {
  const respuesta = await api.get<Direccion[]>("/direcciones");
  return respuesta.data;
};

export const crearDireccion = async (
  datos: DatosDireccion,
): Promise<Direccion> => {
  const respuesta = await api.post<{ direccion: Direccion }>(
    "/direcciones",
    datos,
  );

  return respuesta.data.direccion;
};
