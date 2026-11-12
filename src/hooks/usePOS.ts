import { useEffect, useState } from "react";
import axios from "axios";

import { registrarVenta, type MetodoPago } from "../services/ventas.service";

import { obtenerCatalogo, type Producto } from "../services/productos.service";

import {
  abrirCaja,
  obtenerCajaAbierta,
  type Caja,
} from "../services/cajas.service";

import { usePOSStore } from "../store/pos.store";

// Convierte los errores de la API en mensajes que podamos mostrar.
const obtenerMensajeError = (
  error: unknown,
  mensajePredeterminado: string,
): string => {
  if (axios.isAxiosError(error)) {
    const mensaje = error.response?.data?.message;

    return Array.isArray(mensaje)
      ? mensaje.join(", ")
      : mensaje || mensajePredeterminado;
  }

  return mensajePredeterminado;
};

export function usePOS() {
  // Catálogo
  const [productosCatalogo, setProductosCatalogo] = useState<Producto[]>([]);
  const [cargandoProductos, setCargandoProductos] = useState(true);
  const [actualizarCatalogo, setActualizarCatalogo] = useState(0);

  // Caja
  const [montoApertura, setMontoApertura] = useState("");
  const [caja, setCaja] = useState<Caja | null>(null);
  const [abriendoCaja, setAbriendoCaja] = useState(false);
  const [cargandoCaja, setCargandoCaja] = useState(true);

  // Mensajes
  const [error, setError] = useState("");
  const [mensajeExito, setMensajeExito] = useState("");

  // Venta
  const [metodoPago, setMetodoPago] = useState<MetodoPago>("EFECTIVO");
  const [confirmandoVenta, setConfirmandoVenta] = useState(false);

  // Historial: este número avisa al componente cuándo actualizarse.
  const [actualizarHistorial, setActualizarHistorial] = useState(0);

  // Estado global del carrito
  const productosCarrito = usePOSStore((estado) => estado.productos);
  const agregarProducto = usePOSStore((estado) => estado.agregarProducto);
  const cambiarCantidad = usePOSStore((estado) => estado.cambiarCantidad);
  const quitarProducto = usePOSStore((estado) => estado.quitarProducto);
  const vaciarCarrito = usePOSStore((estado) => estado.vaciarCarrito);

  // Cargar catálogo al entrar al POS.
  useEffect(() => {
    const cargarProductos = async () => {
      try {
        const productos = await obtenerCatalogo();
        setProductosCatalogo(productos);
      } catch {
        setError("No se pudo cargar el catálogo de productos.");
      } finally {
        setCargandoProductos(false);
      }
    };

    cargarProductos();
  }, [actualizarCatalogo]);

  // Consultar si existe una caja abierta.
  useEffect(() => {
    const cargarCajaAbierta = async () => {
      try {
        const cajaEncontrada = await obtenerCajaAbierta();
        setCaja(cajaEncontrada);
      } catch {
        setError("No se pudo consultar la caja abierta.");
      } finally {
        setCargandoCaja(false);
      }
    };

    cargarCajaAbierta();
  }, []);

  // Calcular el total del carrito.
  const total = productosCarrito.reduce(
    (acumulado, item) =>
      acumulado + Number(item.producto.precioActual) * item.cantidad,
    0,
  );

  // Abrir caja.
  const manejarAperturaCaja = async () => {
    setError("");

    const monto = Number(montoApertura);

    if (montoApertura.trim() === "" || !Number.isFinite(monto) || monto < 0) {
      setError("Ingresa un monto de apertura válido.");
      return;
    }

    setAbriendoCaja(true);

    try {
      const respuesta = await abrirCaja(monto);

      setCaja(respuesta.caja);
      setMontoApertura("");
    } catch (error) {
      setError(obtenerMensajeError(error, "No se pudo abrir la caja."));
    } finally {
      setAbriendoCaja(false);
    }
  };

  // Registrar la venta.
  const manejarConfirmacionVenta = async () => {
    if (!caja) {
      setError("Primero debes abrir una caja.");
      return;
    }

    if (productosCarrito.length === 0) {
      setError("Agrega productos al carrito.");
      return;
    }

    setError("");
    setMensajeExito("");
    setConfirmandoVenta(true);

    try {
      const venta = await registrarVenta({
        cajaId: caja.id,
        metodoPago,
        detalles: productosCarrito.map((item) => ({
          productoId: item.producto.id,
          cantidad: item.cantidad,
        })),
      });

      setMensajeExito(`Venta #${venta.venta.id} registrada correctamente.`);

      vaciarCarrito();

      // Actualizar catálogo e historial después de la venta.
      setActualizarCatalogo((anterior) => anterior + 1);
      setActualizarHistorial((anterior) => anterior + 1);
    } catch (error) {
      setError(obtenerMensajeError(error, "No se pudo registrar la venta."));
    } finally {
      setConfirmandoVenta(false);
    }
  };

  return {
    caja: {
      caja,
      cargandoCaja,
      montoApertura,
      setMontoApertura,
      abriendoCaja,
      manejarAperturaCaja,
    },

    catalogo: {
      productosCatalogo,
      cargandoProductos,
      agregarProducto,
    },

    carrito: {
      productosCarrito,
      cambiarCantidad,
      quitarProducto,
      metodoPago,
      setMetodoPago,
      total,
      confirmandoVenta,
      manejarConfirmacionVenta,
    },

    mensajes: {
      error,
      mensajeExito,
    },

    actualizarHistorial,
  };
}
