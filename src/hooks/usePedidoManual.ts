import { useEffect, useState } from "react";
import axios from "axios";

import { obtenerCatalogo, type Producto } from "../services/productos.service";

import {
  crearPedidoManual,
  type DatosPedidoManual,
  type Pedido,
} from "../services/pedidos.service";

export function usePedidoManual() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [cargandoProductos, setCargandoProductos] = useState(true);
  const [errorProductos, setErrorProductos] = useState("");

  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  // Cargar catálogo de productos disponibles.
  useEffect(() => {
    const cargarProductos = async () => {
      try {
        const datos = await obtenerCatalogo();
        setProductos(datos);
      } catch {
        setErrorProductos("No se pudo cargar el catálogo de productos.");
      } finally {
        setCargandoProductos(false);
      }
    };

    cargarProductos();
  }, []);

  // Registrar un pedido manual.
  const registrarPedido = async (
    datos: DatosPedidoManual,
  ): Promise<Pedido | null> => {
    setError("");
    setMensaje("");
    setGuardando(true);

    try {
      const pedido = await crearPedidoManual(datos);

      setMensaje("Pedido manual registrado correctamente.");

      return pedido;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 403) {
          setError("No tienes permisos para registrar pedidos manuales.");
        } else {
          setError("No se pudo registrar el pedido manual.");
        }
      } else {
        setError("Ocurrió un error inesperado.");
      }

      return null;
    } finally {
      setGuardando(false);
    }
  };

  return {
    productos,
    cargandoProductos,
    errorProductos,
    guardando,
    error,
    mensaje,
    registrarPedido,
  };
}
