import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

import { esquemaRegistro, type DatosRegistro } from "../schemas/auth.schema";

import { registrarCliente } from "../services/auth.service";
import { useAuthStore } from "../store/auth.store";

export default function Registro() {
  const navegar = useNavigate();
  const guardarSesion = useAuthStore((estado) => estado.guardarSesion);

  const [errorServidor, setErrorServidor] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<DatosRegistro>({
    resolver: zodResolver(esquemaRegistro),
  });

  const enviarFormulario = async (datos: DatosRegistro) => {
    setErrorServidor("");

    try {
      const respuesta = await registrarCliente({
        ...datos,
        ci: datos.ci || undefined,
      });

      guardarSesion(respuesta.accessToken, respuesta.usuario);

      navegar("/tienda");
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 409) {
        setErrorServidor(
          typeof error.response.data.message === "string"
            ? error.response.data.message
            : "El correo o CI ya se encuentra registrado.",
        );
      } else {
        setErrorServidor("No se pudo crear la cuenta. Inténtalo nuevamente.");
      }
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100 px-4 py-8">
      <form
        onSubmit={handleSubmit(enviarFormulario)}
        className="w-full max-w-md space-y-4 rounded-xl bg-white p-8 shadow-lg"
      >
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Crear cuenta</h1>

          <p className="mt-2 text-gray-500">
            Regístrate para comprar en nuestra tienda.
          </p>
        </div>

        <div>
          <label htmlFor="nombre" className="mb-1 block font-medium">
            Nombre completo
          </label>

          <input
            id="nombre"
            type="text"
            {...register("nombre")}
            className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-orange-500"
            placeholder="Tu nombre"
          />

          {errors.nombre && (
            <p className="mt-1 text-sm text-red-600">{errors.nombre.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="celular" className="mb-1 block font-medium">
            Celular
          </label>

          <input
            id="celular"
            type="tel"
            {...register("celular")}
            className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-orange-500"
            placeholder="70000000"
          />

          {errors.celular && (
            <p className="mt-1 text-sm text-red-600">
              {errors.celular.message}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="ci" className="mb-1 block font-medium">
            Carnet de identidad (opcional)
          </label>

          <input
            id="ci"
            type="text"
            {...register("ci")}
            className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-orange-500"
            placeholder="Tu CI"
          />

          {errors.ci && (
            <p className="mt-1 text-sm text-red-600">
              El CI no puede superar los 30 caracteres.
            </p>
          )}
        </div>

        <div>
          <label htmlFor="email" className="mb-1 block font-medium">
            Correo electrónico
          </label>

          <input
            id="email"
            type="email"
            {...register("email")}
            className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-orange-500"
            placeholder="correo@ejemplo.com"
          />

          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="password" className="mb-1 block font-medium">
            Contraseña
          </label>

          <input
            id="password"
            type="password"
            {...register("password")}
            className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-orange-500"
            placeholder="Mínimo 8 caracteres"
          />

          {errors.password && (
            <p className="mt-1 text-sm text-red-600">
              {errors.password.message}
            </p>
          )}
        </div>

        {errorServidor && (
          <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
            {errorServidor}
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-lg bg-orange-600 p-3 font-semibold text-white hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Creando cuenta..." : "Crear cuenta"}
        </button>

        <p className="text-center text-sm text-gray-600">
          ¿Ya tienes una cuenta?{" "}
          <Link
            to="/"
            className="font-semibold text-orange-600 hover:underline"
          >
            Inicia sesión
          </Link>
        </p>
      </form>
    </main>
  );
}
