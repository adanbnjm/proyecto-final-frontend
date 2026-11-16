import { useEffect, useState } from "react";
import axios from "axios";

import { obtenerCatalogo, type Producto } from "../services/productos.service";

export function useCatalogoTienda() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

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

    // Actualizar el catálogo cada 5 segundos.
    const intervalo = setInterval(() => {
      cargarProductos();
    }, 5000);

    // Limpiar el intervalo al salir de la tienda.
    return () => clearInterval(intervalo);
  }, []);

  return {
    productos,
    cargando,
    error,
  };
}
