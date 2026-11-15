import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

import { obtenerCatalogo, type Producto } from "../services/productos.service";

import {
  obtenerDirecciones,
  type Direccion,
} from "../services/direcciones.service";

import { crearPedido, type Pedido } from "../services/pedidos.service";

import { crearPago } from "../services/pagos.service";

import { useCarritoStore } from "../store/carrito.store";

import Carrito from "../components/tienda/Carrito";
import FormularioDireccion from "../components/tienda/FormularioDireccion";

export default function Tienda() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const [checkoutAbierto, setCheckoutAbierto] = useState(false);
  const [direcciones, setDirecciones] = useState<Direccion[]>([]);
  const [direccionId, setDireccionId] = useState<number | null>(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [cargandoDirecciones, setCargandoDirecciones] = useState(false);

  const [pedidoPendiente, setPedidoPendiente] = useState<Pedido | null>(null);
  const [procesandoCompra, setProcesandoCompra] = useState(false);
  const [errorCompra, setErrorCompra] = useState("");

  const agregarProducto = useCarritoStore((estado) => estado.agregarProducto);

  const productosEnCarrito = useCarritoStore((estado) => estado.productos);

  const vaciarCarrito = useCarritoStore((estado) => estado.vaciarCarrito);

  useEffect(() => {
    const cargarProductos = async (mostrarError = false) => {
      try {
        const datos = await obtenerCatalogo();
        setProductos(datos);
        setError("");
      } catch (error) {
        if (mostrarError) {
          if (axios.isAxiosError(error)) {
            setError("No se pudo cargar el catálogo de productos.");
          } else {
            setError("Ocurrió un error inesperado.");
          }
        }
      } finally {
        setCargando(false);
      }
    };

    // Primera consulta al entrar en la tienda.
    cargarProductos(true);

    // Volver a consultar el catálogo cada 5 segundos.
    const intervalo = setInterval(() => {
      cargarProductos();
    }, 5000);

    // Limpiar el intervalo cuando salgamos de la tienda.
    return () => clearInterval(intervalo);
  }, []);

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

  if (cargando) {
    return (
      <main className="min-h-screen bg-gray-100 p-8">
        <p className="text-center text-gray-600">Cargando productos...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-gray-100 p-8">
        <p className="text-center text-red-600">{error}</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Nuestra tienda</h1>

          <p className="mt-2 text-gray-600">Explora nuestros productos.</p>
        </div>

        <Link
          to="/mis-pedidos"
          className="rounded-lg bg-orange-600 px-5 py-3 font-semibold text-white transition hover:bg-orange-700"
        >
          Mis pedidos
        </Link>
      </div>
      {productos.length === 0 ? (
        <p className="text-gray-600">No hay productos disponibles.</p>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {productos.map((producto) => (
            <article
              key={producto.id}
              className="rounded-xl bg-white p-6 shadow"
            >
              <h2 className="text-xl font-semibold text-gray-900">
                {producto.nombre}
              </h2>

              <p className="mt-2 text-sm text-gray-600">
                {producto.descripcion}
              </p>

              <p className="mt-4 text-lg font-bold text-orange-600">
                Bs. {Number(producto.precioActual).toFixed(2)}
              </p>

              <p className="mt-2 text-sm text-gray-500">
                Stock disponible: {producto.stock}
              </p>

              <button
                onClick={() => agregarProducto(producto)}
                disabled={
                  producto.stock <=
                  productosEnCarrito.filter((item) => item.id === producto.id)
                    .length
                }
                className="mt-4 w-full rounded-lg bg-orange-600 px-4 py-2 text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:bg-gray-400"
              >
                {producto.stock <=
                productosEnCarrito.filter((item) => item.id === producto.id)
                  .length
                  ? "Stock máximo agregado"
                  : "Agregar al carrito"}
              </button>
            </article>
          ))}
        </div>
      )}

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <Carrito alContinuar={abrirCheckout} />

        {checkoutAbierto && (
          <section className="space-y-5">
            {cargandoDirecciones ? (
              <p>Cargando direcciones...</p>
            ) : mostrarFormulario ? (
              <FormularioDireccion
                alGuardar={(direccion) => {
                  setDirecciones((anteriores) => [direccion, ...anteriores]);
                  setDireccionId(direccion.id);
                  setMostrarFormulario(false);
                  setErrorCompra("");
                }}
                alCancelar={() => {
                  setMostrarFormulario(false);
                }}
              />
            ) : (
              <div className="rounded-xl bg-white p-6 shadow">
                <h2 className="mb-4 text-xl font-bold">Dirección de entrega</h2>

                {direcciones.length > 0 ? (
                  <div className="space-y-3">
                    {direcciones.map((direccion) => (
                      <label
                        key={direccion.id}
                        className="flex cursor-pointer gap-3 rounded-lg border p-4"
                      >
                        <input
                          type="radio"
                          name="direccion"
                          checked={direccionId === direccion.id}
                          onChange={() => setDireccionId(direccion.id)}
                        />

                        <span>
                          <strong>
                            {direccion.calle} {direccion.numero ?? ""}
                          </strong>

                          <span className="block text-sm text-gray-600">
                            {direccion.zona}, {direccion.ciudad},{" "}
                            {direccion.departamento}
                          </span>

                          {direccion.referencia && (
                            <span className="block text-sm text-gray-500">
                              {direccion.referencia}
                            </span>
                          )}
                        </span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600">
                    Todavía no tienes direcciones registradas.
                  </p>
                )}

                <button
                  type="button"
                  onClick={() => setMostrarFormulario(true)}
                  className="mt-4 text-sm font-semibold text-orange-600"
                >
                  + Agregar otra dirección
                </button>
              </div>
            )}

            {errorCompra && (
              <p className="rounded-lg bg-red-100 p-3 text-red-700">
                {errorCompra}
              </p>
            )}

            {!mostrarFormulario && (
              <button
                type="button"
                onClick={manejarCompra}
                disabled={
                  procesandoCompra ||
                  productosEnCarrito.length === 0 ||
                  !direccionId
                }
                className="w-full rounded-lg bg-orange-600 p-3 font-semibold text-white hover:bg-orange-700 disabled:cursor-not-allowed disabled:bg-gray-400"
              >
                {procesandoCompra
                  ? "Procesando compra..."
                  : pedidoPendiente
                    ? "Reintentar pago"
                    : "Confirmar pedido y pagar"}
              </button>
            )}
          </section>
        )}
      </div>
    </main>
  );
}
