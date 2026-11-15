import { useEffect, useState } from "react";

import FormularioProducto from "../components/admin/FormularioProducto";
import TablaInventario from "../components/admin/TablaInventario";
import ColaPedidos from "../components/admin/ColaPedidos";
import { usePedidos } from "../hooks/usePedidos";
import FormularioPedidoManual from "../components/admin/FormularioPedidoManual";
import { usePedidoManual } from "../hooks/usePedidoManual";
import type { DatosPedidoManual } from "../services/pedidos.service";

import {
  obtenerCatalogoCategorias,
  type Categoria,
} from "../services/categorias.service";

import { useAuthStore } from "../store/auth.store";
import { useProductos } from "../hooks/useProductos";

export default function Admin() {
  const usuario = useAuthStore((estado) => estado.usuario);
  const esAdministrador = usuario?.rol === "ADMIN";

  // Lógica y estado de productos.
  const {
    productos,
    cargando,
    error,
    mensaje,
    errorFormulario,
    setErrorFormulario,
    productoEditando,
    register,
    handleSubmit,
    errors,
    isSubmitting,
    enviarFormulario,
    seleccionarProducto,
    manejarDesactivacion,
    cancelarEdicion,
  } = useProductos();
  // Lógica y estado de pedidos.
  const {
    pedidos,
    cargando: cargandoPedidos,
    error: errorPedidos,
    mensaje: mensajePedidos,
    pedidoProcesando,
    cargarPedidos,
    manejarEnvio,
    manejarEntrega,
  } = usePedidos();
  const {
    productos: productosPedido,
    cargandoProductos,
    errorProductos,
    guardando,
    error: errorPedidoManual,
    mensaje: mensajePedidoManual,
    registrarPedido,
  } = usePedidoManual();

  const manejarRegistroManual = async (datos: DatosPedidoManual) => {
    const pedidoCreado = await registrarPedido(datos);

    if (pedidoCreado) {
      await cargarPedidos();
    }

    return pedidoCreado;
  };

  // Estado y carga de categorías.
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("todas");

  // Filtrar productos por categoría.
  const productosFiltrados =
    categoriaSeleccionada === "todas"
      ? productos
      : productos.filter(
          (producto) => producto.categoriaId === Number(categoriaSeleccionada),
        );

  // Cargar categorías.
  useEffect(() => {
    const cargarCategorias = async () => {
      try {
        const datos = await obtenerCatalogoCategorias();
        setCategorias(datos);
      } catch {
        setErrorFormulario("No se pudieron cargar las categorías.");
      }
    };

    cargarCategorias();
  }, [setErrorFormulario]);

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold text-gray-900">Panel de operaciones</h1>

      <p className="mb-8 mt-2 text-gray-600">
        Gestión del inventario de productos.
      </p>

      {/* Formulario disponible solamente para ADMIN */}
      {esAdministrador && (
        <FormularioProducto
          categorias={categorias}
          productoEditando={productoEditando}
          mensaje={mensaje}
          errorFormulario={errorFormulario}
          register={register}
          errors={errors}
          isSubmitting={isSubmitting}
          onSubmit={handleSubmit(enviarFormulario)}
          onCancel={cancelarEdicion}
        />
      )}

      {/* Tabla de inventario */}
      <TablaInventario
        productos={productosFiltrados}
        categorias={categorias}
        categoriaSeleccionada={categoriaSeleccionada}
        cargando={cargando}
        error={error}
        esAdministrador={esAdministrador}
        onCambiarCategoria={setCategoriaSeleccionada}
        onEditar={seleccionarProducto}
        onDesactivar={manejarDesactivacion}
      />
      <FormularioPedidoManual
        productos={productosPedido}
        cargandoProductos={cargandoProductos}
        errorProductos={errorProductos}
        guardando={guardando}
        error={errorPedidoManual}
        mensaje={mensajePedidoManual}
        onRegistrar={manejarRegistroManual}
      />
      {/* Cola de pedidos */}
      <ColaPedidos
        pedidos={pedidos}
        cargando={cargandoPedidos}
        error={errorPedidos}
        mensaje={mensajePedidos}
        pedidoProcesando={pedidoProcesando}
        onEnviar={manejarEnvio}
        onEntregar={manejarEntrega}
      />
    </main>
  );
}
