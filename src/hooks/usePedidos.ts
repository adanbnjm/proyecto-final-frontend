import { useCallback, useEffect, useState } from "react";
import axios from "axios";

import {
  obtenerPedidos,
  enviarPedido,
  entregarPedido,
  type Pedido,
} from "../services/pedidos.service";

import { aprobarPago } from "../services/pagos.service";

export function usePedidos() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [pedidoProcesando, setPedidoProcesando] = useState<number | null>(null);

  // Cargar pedidos desde el backend.
  const cargarPedidos = useCallback(async () => {
    setError("");

    try {
      const datos = await obtenerPedidos();
      setPedidos(datos);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 403) {
          setError("No tienes permisos para consultar los pedidos.");
        } else {
          setError("No se pudieron cargar los pedidos.");
        }
      } else {
        setError("Ocurrió un error inesperado.");
      }
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarPedidos();
  }, [cargarPedidos]);

  // Ejecutar una acción y actualizar la lista.
  const ejecutarAccion = async (
    pedidoId: number,
    accion: () => Promise<void>,
    mensajeExito: string,
  ) => {
    setMensaje("");
    setError("");
    setPedidoProcesando(pedidoId);

    try {
      await accion();

      setMensaje(mensajeExito);
      await cargarPedidos();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 403) {
          setError("No tienes permisos para realizar esta acción.");
        } else {
          setError("No se pudo actualizar el estado del pedido.");
        }
      } else {
        setError("Ocurrió un error inesperado.");
      }
    } finally {
      setPedidoProcesando(null);
    }
  };

  // Enviar un pedido pagado.
  const manejarEnvio = (pedidoId: number) =>
    ejecutarAccion(
      pedidoId,
      () => enviarPedido(pedidoId),
      "Pedido enviado correctamente.",
    );

  // Marcar un pedido en tránsito como entregado.
  const manejarEntrega = (pedidoId: number) =>
    ejecutarAccion(
      pedidoId,
      () => entregarPedido(pedidoId),
      "Pedido marcado como entregado.",
    );

  // Confirmar el pago recibido por el cajero.
  const manejarConfirmacionPago = (pedidoId: number, pagoId: number) =>
    ejecutarAccion(
      pedidoId,
      () => aprobarPago(pagoId),
      "Pago confirmado correctamente.",
    );

  return {
    pedidos,
    cargando,
    error,
    mensaje,
    pedidoProcesando,
    cargarPedidos,
    manejarEnvio,
    manejarEntrega,
    manejarConfirmacionPago,
  };
}
