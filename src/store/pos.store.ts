import { create } from "zustand";
import type { Producto } from "../services/productos.service";

interface ProductoEnCarrito {
  producto: Producto;
  cantidad: number;
}

interface EstadoPOS {
  productos: ProductoEnCarrito[];

  agregarProducto: (producto: Producto) => void;
  cambiarCantidad: (id: number, cantidad: number) => void;
  quitarProducto: (id: number) => void;
  vaciarCarrito: () => void;
}

export const usePOSStore = create<EstadoPOS>((set) => ({
  productos: [],

  agregarProducto: (producto) =>
    set((estado) => {
      if (producto.stock <= 0) {
        return estado;
      }

      const existente = estado.productos.find(
        (item) => item.producto.id === producto.id,
      );

      if (existente) {
        if (existente.cantidad >= producto.stock) {
          return estado;
        }

        return {
          productos: estado.productos.map((item) =>
            item.producto.id === producto.id
              ? { ...item, cantidad: item.cantidad + 1 }
              : item,
          ),
        };
      }

      return {
        productos: [...estado.productos, { producto, cantidad: 1 }],
      };
    }),

  cambiarCantidad: (id, cantidad) =>
    set((estado) => ({
      productos: estado.productos.map((item) =>
        item.producto.id === id
          ? {
              ...item,
              cantidad: Math.min(
                Math.max(1, Math.floor(cantidad)),
                item.producto.stock,
              ),
            }
          : item,
      ),
    })),

  quitarProducto: (id) =>
    set((estado) => ({
      productos: estado.productos.filter((item) => item.producto.id !== id),
    })),

  vaciarCarrito: () => set({ productos: [] }),
}));
