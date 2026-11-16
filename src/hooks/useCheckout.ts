import { useState } from "react";
import axios from "axios";

import {
  obtenerDirecciones,
  type Direccion,
} from "../services/direcciones.service";

import { crearPedido, type Pedido } from "../services/pedidos.service";

import { crearPago } from "../services/pagos.service";
import { useCarritoStore } from "../store/carrito.store";

export function useCheckout() {
  const [checkoutAbierto, setCheckoutAbierto] = useState(false);
  const [direcciones, setDirecciones] = useState<Direccion[]>([]);
  const [direccionId, setDireccionId] = useState<number | null>(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [cargandoDirecciones, setCargandoDirecciones] = useState(false);

  const [pedidoPendiente, setPedidoPendiente] = useState<Pedido | null>(null);
  const [procesandoCompra, setProcesandoCompra] = useState(false);
  const [errorCompra, setErrorCompra] = useState("");

  const productosEnCarrito = useCarritoStore((estado) => estado.productos);

  const vaciarCarrito = useCarritoStore((estado) => estado.vaciarCarrito);

  const abrirCheckout = async () => {
    setCheckoutAbierto(true);
    setErrorCompra("");
    setCargandoDirecciones(true);

    try {
      const datos = await obtenerDirecciones();
      setDirecciones(datos);

      if (datos.length > 0) {
        setDireccionId(datos[0].id);
      } else {
        setMostrarFormulario(true);
      }
    } catch {
      setErrorCompra("No se pudieron cargar tus direcciones.");
    } finally {
      setCargandoDirecciones(false);
    }
  };

  const manejarCompra = async () => {
    setProcesandoCompra(true);
    setErrorCompra("");

    try {
      let pedido = pedidoPendiente;

      if (!pedido) {
        if (!direccionId) {
          setErrorCompra("Selecciona una dirección de entrega.");
          return;
        }

        pedido = await crearPedido({
          direccionId,
          detalles: Object.values(
            productosEnCarrito.reduce(
              (acumulado, producto) => {
                const id = producto.id;

                if (!acumulado[id]) {
                  acumulado[id] = {
                    productoId: id,
                    cantidad: 0,
                  };
                }

                acumulado[id].cantidad += 1;

                return acumulado;
              },
              {} as Record<number, { productoId: number; cantidad: number }>,
            ),
          ),
          origen: "WEB",
        });

        setPedidoPendiente(pedido);
      }

      const respuestaPago = await crearPago(pedido.id, "BOB");

      vaciarCarrito();

      window.location.href = respuestaPago.checkoutUrl;
    } catch (error) {
      console.error("Error durante la compra:", error);

      if (axios.isAxiosError(error)) {
        console.error("Respuesta del servidor:", error.response?.data);

        setErrorCompra(
          typeof error.response?.data?.message === "string"
            ? error.response.data.message
            : JSON.stringify(error.response?.data?.message ?? error.message),
        );
      } else {
        setErrorCompra("Ocurrió un error inesperado.");
      }
    } finally {
      setProcesandoCompra(false);
    }
  };

  return {
    checkoutAbierto,
    direcciones,
    direccionId,
    mostrarFormulario,
    cargandoDirecciones,
    pedidoPendiente,
    procesandoCompra,
    errorCompra,
    productosEnCarrito,
    setDirecciones,
    setDireccionId,
    setMostrarFormulario,
    setErrorCompra,
    abrirCheckout,
    manejarCompra,
  };
}
