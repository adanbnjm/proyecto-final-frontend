import { useEffect, useState } from "react";
import axios from "axios";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  obtenerProductosAdministrativos,
  crearProducto,
  actualizarProducto,
  desactivarProducto,
  type ProductoAdministrativo,
} from "../services/productos.service";

import {
  esquemaProducto,
  type DatosProducto,
} from "../schemas/producto.schema";

const valoresIniciales: DatosProducto = {
  codigo: "",
  nombre: "",
  descripcion: "",
  precioActual: 0,
  costoAdquisicion: 0,
  stock: 0,
  categoriaId: 0,
  activo: true,
};

export function useProductos() {
  const [productos, setProductos] = useState<ProductoAdministrativo[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [errorFormulario, setErrorFormulario] = useState("");
  const [productoEditando, setProductoEditando] =
    useState<ProductoAdministrativo | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<DatosProducto>({
    resolver: zodResolver(esquemaProducto),
    defaultValues: valoresIniciales,
  });

  // Cargar y actualizar el inventario automáticamente.
  useEffect(() => {
    const cargarProductos = async () => {
      try {
        const datos = await obtenerProductosAdministrativos();
        setProductos(datos);
        setError("");
      } catch (error) {
        if (axios.isAxiosError(error)) {
          if (error.response?.status === 403) {
            setError("No tienes permisos para consultar el inventario.");
          } else {
            setError("No se pudo cargar el inventario.");
          }
        } else {
          setError("Ocurrió un error inesperado.");
        }
      } finally {
        setCargando(false);
      }
    };

    cargarProductos();

    const intervalo = setInterval(cargarProductos, 5000);

    return () => clearInterval(intervalo);
  }, []);

  // Crear o actualizar producto.
  const enviarFormulario = async (datos: DatosProducto) => {
    setMensaje("");
    setErrorFormulario("");

    try {
      if (productoEditando) {
        const productoActualizado = await actualizarProducto(
          productoEditando.id,
          datos,
        );

        setProductos((productosActuales) =>
          productosActuales.map((producto) =>
            producto.id === productoActualizado.id
              ? productoActualizado
              : producto,
          ),
        );

        setMensaje("Producto actualizado correctamente.");
        setProductoEditando(null);
      } else {
        const nuevoProducto = await crearProducto(datos);

        setProductos((productosActuales) => [
          ...productosActuales,
          nuevoProducto,
        ]);

        setMensaje("Producto creado correctamente.");
      }

      reset(valoresIniciales);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 403) {
          setErrorFormulario("No tienes permisos para realizar esta acción.");
        } else if (error.response?.status === 409) {
          setErrorFormulario("Ya existe un producto con ese código.");
        } else {
          setErrorFormulario("No se pudo guardar el producto.");
        }
      } else {
        setErrorFormulario("Ocurrió un error inesperado.");
      }
    }
  };

  // Seleccionar producto para editar.
  const seleccionarProducto = (producto: ProductoAdministrativo) => {
    setMensaje("");
    setErrorFormulario("");
    setProductoEditando(producto);

    reset({
      codigo: producto.codigo,
      nombre: producto.nombre,
      descripcion: producto.descripcion ?? "",
      precioActual: Number(producto.precioActual),
      costoAdquisicion: Number(producto.costoAdquisicion),
      stock: producto.stock,
      categoriaId: producto.categoriaId,
      activo: producto.activo,
    });
  };

  // Desactivar producto.
  const manejarDesactivacion = async (producto: ProductoAdministrativo) => {
    const confirmar = window.confirm(
      `¿Deseas desactivar el producto ${producto.nombre}?`,
    );

    if (!confirmar) return;

    try {
      await desactivarProducto(producto.id);

      setProductos((productosActuales) =>
        productosActuales.map((elemento) =>
          elemento.id === producto.id
            ? { ...elemento, activo: false }
            : elemento,
        ),
      );

      setMensaje("Producto desactivado correctamente.");
    } catch {
      setErrorFormulario("No se pudo desactivar el producto.");
    }
  };

  // Cancelar edición y limpiar formulario.
  const cancelarEdicion = () => {
    setProductoEditando(null);
    reset(valoresIniciales);
    setMensaje("");
    setErrorFormulario("");
  };

  return {
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
  };
}
