import { useState } from "react";
import type { FormEvent } from "react";

import type { Producto } from "../services/productos.service";
import type {
  DatosPedidoManual,
  DetallePedidoManual,
} from "../services/pedidos.service";

interface UseFormularioPedidoManualProps {
  productos: Producto[];
  onRegistrar: (datos: DatosPedidoManual) => Promise<unknown>;
}

const valoresIniciales = {
  destinatario: "",
  celularDestinatario: "",
  departamento: "",
  ciudad: "",
  zona: "",
  calle: "",
  numero: "",
  referencia: "",
};

export function useFormularioPedidoManual({
  productos,
  onRegistrar,
}: UseFormularioPedidoManualProps) {
  const [datos, setDatos] = useState(valoresIniciales);

  const [origen, setOrigen] = useState<DatosPedidoManual["origen"]>("WHATSAPP");

  const [detalles, setDetalles] = useState<DetallePedidoManual[]>([
    { productoId: 0, cantidad: 1 },
  ]);

  const actualizarCampo = (
    campo: keyof typeof valoresIniciales,
    valor: string,
  ) => {
    setDatos((actuales) => ({
      ...actuales,
      [campo]: valor,
    }));
  };

  const actualizarDetalle = (
    indice: number,
    campo: keyof DetallePedidoManual,
    valor: number,
  ) => {
    setDetalles((actuales) =>
      actuales.map((detalle, posicion) =>
        posicion === indice ? { ...detalle, [campo]: valor } : detalle,
      ),
    );
  };

  const agregarDetalle = () => {
    setDetalles((actuales) => [...actuales, { productoId: 0, cantidad: 1 }]);
  };

  const eliminarDetalle = (indice: number) => {
    setDetalles((actuales) =>
      actuales.filter((_, posicion) => posicion !== indice),
    );
  };

  const obtenerProducto = (productoId: number) =>
    productos.find((producto) => producto.id === productoId);

  const calcularTotal = () =>
    detalles.reduce((total, detalle) => {
      const producto = obtenerProducto(detalle.productoId);

      if (!producto) return total;

      return total + Number(producto.precioActual) * detalle.cantidad;
    }, 0);

  const manejarEnvio = async (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault();

    const detallesValidos = detalles.filter(
      (detalle) => detalle.productoId > 0 && detalle.cantidad > 0,
    );

    if (detallesValidos.length === 0) {
      return;
    }

    const productosSinStock = detallesValidos.some((detalle) => {
      const producto = obtenerProducto(detalle.productoId);

      return !producto || detalle.cantidad > producto.stock;
    });

    if (productosSinStock) {
      return;
    }

    const pedidoCreado = await onRegistrar({
      ...datos,
      numero: datos.numero || undefined,
      referencia: datos.referencia || undefined,
      origen,
      detalles: detallesValidos,
    });

    if (pedidoCreado) {
      setDatos(valoresIniciales);
      setOrigen("WHATSAPP");
      setDetalles([{ productoId: 0, cantidad: 1 }]);
    }
  };

  return {
    datos,
    origen,
    detalles,
    actualizarCampo,
    actualizarDetalle,
    agregarDetalle,
    eliminarDetalle,
    obtenerProducto,
    calcularTotal,
    manejarEnvio,
    setOrigen,
  };
}
