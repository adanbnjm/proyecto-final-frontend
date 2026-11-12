import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Usuario } from "../services/auth.service";

interface EstadoAutenticacion {
  accessToken: string | null;
  usuario: Usuario | null;
  guardarSesion: (accessToken: string, usuario: Usuario) => void;
  cerrarSesion: () => void;
  actualizarUsuario: (usuario: Usuario) => void;
}

export const useAuthStore = create<EstadoAutenticacion>()(
  persist(
    (set) => ({
      accessToken: null,
      usuario: null,

      guardarSesion: (accessToken, usuario) => {
        set({ accessToken, usuario });
      },

      actualizarUsuario: (usuario) => {
        set({ usuario });
      },
      cerrarSesion: () => {
        set({
          accessToken: null,
          usuario: null,
        });
      },
    }),
    {
      name: "pos-sesion",
    },
  ),
);
