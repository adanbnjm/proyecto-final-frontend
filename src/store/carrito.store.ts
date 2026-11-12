import { create } from "zustand";

import type { Producto } from "../services/productos.service";

interface EstadoCarrito {
  productos: Producto[];
  agregarProducto: (producto: Producto) => void;
  quitarProducto: (id: number) => void;
  vaciarCarrito: () => void;
}

export const useCarritoStore = create<EstadoCarrito>((set) => ({
  productos: [],

  agregarProducto: (producto) =>
    set((estado) => {
      if (producto.stock <= 0) {
        return estado;
      }

      const productoExistente = estado.productos.find(
        (item) => item.id === producto.id,
      );

      if (productoExistente) {
        return estado;
      }

      return {
        productos: [...estado.productos, producto],
      };
    }),

  quitarProducto: (id) =>
    set((estado) => ({
      productos: estado.productos.filter((producto) => producto.id !== id),
    })),

  vaciarCarrito: () => set({ productos: [] }),
}));
