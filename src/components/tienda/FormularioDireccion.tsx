import { useState } from "react";
import {
  crearDireccion,
  type DatosDireccion,
  type Direccion,
} from "../../services/direcciones.service";

interface Props {
  alGuardar: (direccion: Direccion) => void;
  alCancelar: () => void;
}

function FormularioDireccion({ alGuardar, alCancelar }: Props) {
  const [datos, setDatos] = useState<DatosDireccion>({
    departamento: "",
    ciudad: "",
    zona: "",
    calle: "",
    numero: "",
    referencia: "",
  });

  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  const manejarCambio = (evento: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = evento.target;

    setDatos((anterior) => ({
      ...anterior,
      [name]: value,
    }));
  };

  const manejarEnvio = async (evento: React.FormEvent<HTMLFormElement>) => {
    evento.preventDefault();
    setCargando(true);
    setError("");

    try {
      const direccion = await crearDireccion(datos);
      alGuardar(direccion);
    } catch {
      setError("No se pudo guardar la dirección. Intenta nuevamente.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <form
      onSubmit={manejarEnvio}
      className="space-y-4 rounded-xl bg-white p-6 shadow"
    >
      <h2 className="text-xl font-bold">Dirección de entrega</h2>

      {(
        [
          "departamento",
          "ciudad",
          "zona",
          "calle",
          "numero",
          "referencia",
        ] as const
      ).map((campo) => {
        const opcional = campo === "numero" || campo === "referencia";

        return (
          <div key={campo}>
            <label className="mb-1 block font-medium capitalize">
              {campo}
              {opcional ? " (opcional)" : ""}
            </label>

            <input
              name={campo}
              value={datos[campo] ?? ""}
              onChange={manejarCambio}
              required={!opcional}
              className="w-full rounded-lg border border-gray-300 p-3"
            />
          </div>
        );
      })}

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={alCancelar}
          className="w-full rounded-lg border border-gray-300 p-3"
        >
          Cancelar
        </button>

        <button
          type="submit"
          disabled={cargando}
          className="w-full rounded-lg bg-black p-3 font-semibold text-white disabled:opacity-50"
        >
          {cargando ? "Guardando..." : "Guardar dirección"}
        </button>
      </div>
    </form>
  );
}

export default FormularioDireccion;
