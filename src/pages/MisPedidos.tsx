import { useEffect, useState } from "react";
import axios from "axios";

import {
  obtenerPedidos,
  cancelarPedido,
  type Pedido,
} from "../services/pedidos.service";

export default function MisPedidos() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const cargarPedidos = async () => {
      try {
        const datos = await obtenerPedidos();
        setPedidos(datos);
      } catch (error) {
        if (axios.isAxiosError(error)) {
          setError("No se pudieron cargar tus pedidos.");
        } else {
          setError("Ocurrió un error inesperado.");
        }
      } finally {
        setCargando(false);
      }
    };

    cargarPedidos();
  }, []);
  const manejarCancelacion = async (pedidoId: number) => {
    const confirmar = window.confirm(
      `¿Estás seguro de cancelar el pedido #${pedidoId}?`,
    );

    if (!confirmar) return;

    try {
      await cancelarPedido(pedidoId);
      const datos = await obtenerPedidos();
      setPedidos(datos);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setError(
          error.response?.data?.message || "No se pudo cancelar el pedido.",
        );
      } else {
        setError("Ocurrió un error inesperado.");
      }
    }
  };
  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString("es-BO");
  };

  const formatearTotal = (total: number | string) => {
    return Number(total).toLocaleString("es-BO", {
      style: "currency",
      currency: "BOB",
    });
  };

  if (cargando) {
    return <p className="p-6">Cargando tus pedidos...</p>;
  }

  if (error) {
    return <p className="p-6 text-red-600">{error}</p>;
  }

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-5xl">
        <h1 className="mb-6 text-2xl font-bold">Mis pedidos</h1>

        {pedidos.length === 0 ? (
          <p className="rounded-lg bg-white p-6">Todavía no tienes pedidos.</p>
        ) : (
          <div className="space-y-4">
            {pedidos.map((pedido) => (
              <article
                key={pedido.id}
                className="rounded-lg bg-white p-5 shadow-sm"
              >
                <div className="flex flex-wrap justify-between gap-4">
                  <div>
                    <h2 className="font-semibold">Pedido #{pedido.id}</h2>

                    <p className="mt-1 text-sm text-gray-500">
                      Fecha: {formatearFecha(pedido.creadoEn)}
                    </p>
                  </div>

                  <span className="rounded-full bg-gray-100 px-3 py-1 text-sm">
                    {pedido.estado}
                  </span>
                </div>
                <div className="mt-4 border-t pt-4">
                  <h3 className="mb-3 font-semibold">Productos del pedido</h3>

                  <div className="space-y-3">
                    {pedido.detalles.map((detalle) => (
                      <div
                        key={detalle.id}
                        className="flex justify-between gap-4 text-sm"
                      >
                        <div>
                          <p className="font-medium">
                            {detalle.producto.nombre}
                          </p>
                          <p className="text-gray-500">
                            Cantidad: {detalle.cantidad}
                          </p>
                        </div>

                        <p className="font-medium">
                          {formatearTotal(
                            Number(detalle.precioUnitario) * detalle.cantidad,
                          )}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-4 border-t pt-4">
                  <p className="text-sm text-gray-500">Total del pedido</p>
                  {pedido.estado === "PENDIENTE" && (
                    <button
                      type="button"
                      onClick={() => manejarCancelacion(pedido.id)}
                      className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700"
                    >
                      Cancelar pedido
                    </button>
                  )}
                  <p className="text-xl font-bold">
                    {formatearTotal(pedido.total)}
                  </p>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
