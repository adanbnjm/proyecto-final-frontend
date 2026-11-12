import api from "../lib/axios";

export interface Categoria {
  id: number;
  nombre: string;
  descripcion: string;
}

export const obtenerCatalogoCategorias = async (): Promise<Categoria[]> => {
  const respuesta = await api.get<Categoria[]>("/categorias/catalogo");

  return respuesta.data;
};
