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
      const cantidadActual = estado.productos.filter(
        (item) => item.id === producto.id,
      ).length;

      if (producto.stock <= cantidadActual) {
        return estado;
      }

      return {
        productos: [...estado.productos, producto],
      };
    }),

  quitarProducto: (id) =>
    set((estado) => {
      const indice = estado.productos.findIndex(
        (producto) => producto.id === id,
      );

      if (indice === -1) {
        return estado;
      }

      const productos = [...estado.productos];
      productos.splice(indice, 1);

      return { productos };
    }),

  vaciarCarrito: () => set({ productos: [] }),
}));
