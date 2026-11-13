import { usePOS } from "../hooks/usePOS";

import CajaSection from "../components/pos/CajaSection";
import CatalogoPOS from "../components/pos/CatalogoPOS";
import CarritoPOS from "../components/pos/CarritoPOS";
import HistorialVentas from "../components/pos/HistorialVentas";

function POS() {
  const pos = usePOS();

  return (
    <main className="min-h-screen bg-gray-100 p-6 text-gray-900">
      <div className="mx-auto max-w-7xl space-y-6">
        <h1 className="text-3xl font-bold">Punto de Venta</h1>

        {/* Mensajes */}
        {pos.mensajes.error && (
          <p className="rounded-lg bg-red-100 p-3 text-red-700">
            {pos.mensajes.error}
          </p>
        )}

        {pos.mensajes.mensajeExito && (
          <p className="rounded-lg bg-green-100 p-3 text-green-700">
            {pos.mensajes.mensajeExito}
          </p>
        )}

        {/* Caja */}
        <CajaSection {...pos.caja} />

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Catálogo */}
          <CatalogoPOS {...pos.catalogo} />

          {/* Carrito */}
          <CarritoPOS {...pos.carrito} cajaAbierta={Boolean(pos.caja.caja)} />
        </div>

        {/* Historial */}
        <HistorialVentas actualizar={pos.actualizarHistorial} />
      </div>
    </main>
  );
}

export default POS;
