import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

import { esquemaLogin, type DatosLogin } from "../schemas/auth.schema";
import { iniciarSesion } from "../services/auth.service";
import { useAuthStore } from "../store/auth.store";

export default function Login() {
  const navegar = useNavigate();
  const guardarSesion = useAuthStore((estado) => estado.guardarSesion);

  const [errorServidor, setErrorServidor] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<DatosLogin>({
    resolver: zodResolver(esquemaLogin),
  });

  const enviarFormulario = async (datos: DatosLogin) => {
    setErrorServidor("");

    try {
      const respuesta = await iniciarSesion(datos);

      guardarSesion(respuesta.accessToken, respuesta.usuario);

      if (respuesta.usuario.rol === "CLIENTE") {
        navegar("/tienda");
      } else {
        navegar("/admin");
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        setErrorServidor("Correo o contraseña incorrectos.");
      } else {
        setErrorServidor("No se pudo iniciar sesión. Inténtalo nuevamente.");
      }
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
      <form
        onSubmit={handleSubmit(enviarFormulario)}
        className="w-full max-w-md space-y-5 rounded-xl bg-white p-8 shadow-lg"
      >
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Iniciar sesión</h1>

          <p className="mt-2 text-gray-500">Ingresa a tu cuenta</p>
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
            placeholder="Tu contraseña"
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
          {isSubmitting ? "Ingresando..." : "Ingresar"}
        </button>
        <p className="text-center text-sm text-gray-600">
          ¿No tienes una cuenta?{" "}
          <Link
            to="/registro"
            className="font-semibold text-orange-600 hover:underline"
          >
            Regístrate aquí
          </Link>
        </p>
      </form>
    </main>
  );
}
