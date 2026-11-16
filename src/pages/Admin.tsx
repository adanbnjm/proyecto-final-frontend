import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";

import FormularioProducto from "../components/admin/FormularioProducto";
import TablaInventario from "../components/admin/TablaInventario";
import ColaPedidos from "../components/admin/ColaPedidos";
import { usePedidos } from "../hooks/usePedidos";
import FormularioPedidoManual from "../components/admin/FormularioPedidoManual";
import { usePedidoManual } from "../hooks/usePedidoManual";
import type { DatosPedidoManual } from "../services/pedidos.service";
import GestionCaja from "../components/admin/GestionCaja";
import SupervisionCajas from "../components/admin/SupervisionCajas";
import SidebarAdmin, {
  type SeccionAdmin,
} from "../components/admin/SidebarAdmin";
import {
  obtenerHistorialVentas,
  type VentaHistorial,
} from "../services/ventas.service";

import ResumenDashboard from "../components/admin/ResumenDashboard";
import {
  obtenerCatalogoCategorias,
  type Categoria,
} from "../services/categorias.service";

import { useAuthStore } from "../store/auth.store";
import { useProductos } from "../hooks/useProductos";
const POS = lazy(() => import("./POS"));
function obtenerFechaBolivia() {
  const partes = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/La_Paz",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const valores = Object.fromEntries(
    partes.map((parte) => [parte.type, parte.value]),
  );

  return `${valores.year}-${valores.month}-${valores.day}`;
}

function obtenerFechasUltimosSieteDias(): string[] {
  const [anio, mes, dia] = obtenerFechaBolivia().split("-").map(Number);

  const fechaBase = new Date(Date.UTC(anio, mes - 1, dia));

  return Array.from({ length: 7 }, (_, indice) => {
    const fecha = new Date(fechaBase);
    fecha.setUTCDate(fechaBase.getUTCDate() - (6 - indice));

    return fecha.toISOString().slice(0, 10);
  });
}

export default function Admin() {
  const ubicacion = useLocation();
  const usuario = useAuthStore((estado) => estado.usuario);
  const esAdministrador = usuario?.rol === "ADMIN";
  const [ventasHoy, setVentasHoy] = useState<VentaHistorial[]>([]);
  const [ventasSemana, setVentasSemana] = useState<VentaHistorial[]>([]);
  const [cargandoVentas, setCargandoVentas] = useState(false);
  const [errorVentas, setErrorVentas] = useState<string | null>(null);
  const [seccionActiva, setSeccionActiva] = useState<SeccionAdmin>(() =>
    ubicacion.state?.seccionInicial === "pos" ? "pos" : "inicio",
  );
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
    manejarConfirmacionPago,
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
  const productosFiltrados = useMemo(() => {
    if (categoriaSeleccionada === "todas") {
      return productos;
    }

    return productos.filter(
      (producto) => producto.categoriaId === Number(categoriaSeleccionada),
    );
  }, [productos, categoriaSeleccionada]);

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

  useEffect(() => {
    if (!esAdministrador) return;

    let activo = true;

    const cargarVentasSemana = async () => {
      try {
        setCargandoVentas(true);
        setErrorVentas(null);

        const fechas = obtenerFechasUltimosSieteDias();

        const resultados = await Promise.all(
          fechas.map((fecha) => obtenerHistorialVentas(fecha)),
        );

        if (activo) {
          setVentasSemana(resultados.flat());

          // El último resultado corresponde a las ventas de hoy.
          setVentasHoy(resultados[resultados.length - 1]);
        }
      } catch {
        if (activo) {
          setErrorVentas(
            "No se pudieron cargar las ventas de los últimos siete días.",
          );
        }
      } finally {
        if (activo) {
          setCargandoVentas(false);
        }
      }
    };

    cargarVentasSemana();

    return () => {
      activo = false;
    };
  }, [esAdministrador]);

  return (
    <div className="flex min-h-screen bg-slate-100">
      <SidebarAdmin
        seccionActiva={seccionActiva}
        onCambiarSeccion={setSeccionActiva}
        esAdministrador={esAdministrador}
      />

      <main className="min-w-0 flex-1 p-6 lg:p-8">
        <header className="mb-8">
          <p className="text-sm font-medium text-slate-500">
            NOVA TECH / Administración
          </p>

          <h1 className="mt-2 text-3xl font-bold text-slate-900">
            {seccionActiva === "inicio" && "Panel de operaciones"}
            {seccionActiva === "inventario" && "Inventario"}
            {seccionActiva === "pedidos" && "Pedidos"}
            {seccionActiva === "caja" && "Gestión de caja"}
            {seccionActiva === "supervision" && "Supervisión de cajas"}
            {seccionActiva === "pos" && "Punto de Venta"}
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            {seccionActiva === "inicio" && "Resumen general de tu negocio."}
            {seccionActiva === "inventario" &&
              "Consulta y administra tus productos."}
            {seccionActiva === "pedidos" && "Registra y gestiona los pedidos."}
            {seccionActiva === "caja" && "Administra las operaciones de caja."}
            {seccionActiva === "supervision" &&
              "Consulta y supervisa las cajas del negocio."}
            {seccionActiva === "pos" &&
              "Registra ventas presenciales y administra el proceso de cobro."}
          </p>
        </header>

        {seccionActiva === "inicio" && esAdministrador && (
          <ResumenDashboard
            productos={productos}
            pedidos={pedidos}
            ventas={ventasHoy}
            ventasSemana={ventasSemana}
            cargandoVentas={cargandoVentas}
            errorVentas={errorVentas}
          />
        )}

        {seccionActiva === "inventario" && (
          <section className="space-y-8">
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
          </section>
        )}

        {seccionActiva === "pedidos" && (
          <section className="space-y-8">
            <FormularioPedidoManual
              productos={productosPedido}
              cargandoProductos={cargandoProductos}
              errorProductos={errorProductos}
              guardando={guardando}
              error={errorPedidoManual}
              mensaje={mensajePedidoManual}
              onRegistrar={manejarRegistroManual}
            />

            <ColaPedidos
              pedidos={pedidos}
              cargando={cargandoPedidos}
              error={errorPedidos}
              mensaje={mensajePedidos}
              pedidoProcesando={pedidoProcesando}
              onEnviar={manejarEnvio}
              onEntregar={manejarEntrega}
              onConfirmarPago={manejarConfirmacionPago}
            />
          </section>
        )}

        {seccionActiva === "caja" && <GestionCaja />}

        {seccionActiva === "supervision" && esAdministrador && (
          <SupervisionCajas />
        )}
        {seccionActiva === "pos" && (
          <Suspense
            fallback={
              <p className="py-8 text-center text-slate-500">
                Cargando Punto de Venta...
              </p>
            }
          >
            <POS />
          </Suspense>
        )}
      </main>
    </div>
  );
}
