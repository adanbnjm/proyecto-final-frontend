import CatalogoProductos from "../components/tienda/CatalogoProductos";
import Checkout from "../components/tienda/Checkout";

import { useCheckout } from "../hooks/useCheckout";
import { useCatalogoTienda } from "../hooks/useCatalogoTienda";

import Carrito from "../components/tienda/Carrito";

export default function Tienda() {
  const { productos, cargando, error } = useCatalogoTienda();
  const {
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
  } = useCheckout();

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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Nuestra tienda</h1>
        <p className="mt-2 text-gray-600">Explora nuestros productos.</p>
      </div>
      <CatalogoProductos productos={productos} />

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <Carrito alContinuar={abrirCheckout} />

        <Checkout
          checkoutAbierto={checkoutAbierto}
          direcciones={direcciones}
          direccionId={direccionId}
          mostrarFormulario={mostrarFormulario}
          cargandoDirecciones={cargandoDirecciones}
          pedidoPendiente={pedidoPendiente}
          procesandoCompra={procesandoCompra}
          errorCompra={errorCompra}
          productosEnCarrito={productosEnCarrito}
          setDirecciones={setDirecciones}
          setDireccionId={setDireccionId}
          setMostrarFormulario={setMostrarFormulario}
          setErrorCompra={setErrorCompra}
          manejarCompra={manejarCompra}
        />
      </div>
    </main>
  );
}
