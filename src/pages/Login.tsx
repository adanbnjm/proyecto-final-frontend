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
  const [mostrarPassword, setMostrarPassword] = useState(false);

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
    <main className="flex min-h-screen items-center justify-center bg-[#0F172A] px-4 py-8 text-slate-100">
      <div className="w-full max-w-md">
        <section className="rounded-2xl border border-slate-700/60 bg-[#1E293B] p-7 shadow-2xl shadow-black/40 sm:p-10">
          {/* Identidad de marca */}
          <header className="mb-8 text-center">
            <div className="mb-6 flex items-center justify-center gap-2.5">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold tracking-tight text-white">
                  NOVA TECH
                </span>
                <span className="rounded border border-orange-500/30 bg-orange-500/20 px-1.5 py-0.5 text-[10px] font-semibold tracking-wider text-orange-400">
                  POS & COMMERCE
                </span>
              </div>
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Acceso al Sistema
            </h1>

            <p className="mt-2 text-sm text-[#94A3B8]">
              Ingresa tus credenciales para continuar
            </p>
          </header>

          {/* Formulario */}
          <form onSubmit={handleSubmit(enviarFormulario)} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-300"
              >
                Correo electrónico
              </label>

              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="nombre@empresa.com"
                {...register("email")}
                className="w-full rounded-xl border border-slate-700 bg-[#0F172A] px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition-colors focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
              />

              {errors.email && (
                <p className="mt-1 text-sm text-red-400">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-300"
              >
                Contraseña
              </label>

              <div className="relative">
                <input
                  id="password"
                  type={mostrarPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Tu contraseña"
                  {...register("password")}
                  className="w-full rounded-xl border border-slate-700 bg-[#0F172A] px-4 py-3 pr-12 text-sm text-white placeholder-slate-500 outline-none transition-colors focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                />

                <button
                  type="button"
                  onClick={() => setMostrarPassword(!mostrarPassword)}
                  aria-label={
                    mostrarPassword
                      ? "Ocultar contraseña"
                      : "Mostrar contraseña"
                  }
                  className="absolute inset-y-0 right-0 flex items-center px-4 text-slate-400 transition-colors hover:text-white"
                >
                  {mostrarPassword ? (
                    <svg
                      className="h-5 w-5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M3 3l18 18" />
                      <path d="M10.6 10.6a2 2 0 002.8 2.8" />
                      <path d="M9.9 5.2A10.6 10.6 0 0112 5c4.5 0 8.3 2.9 9.5 7a10.7 10.7 0 01-4.1 5.5" />
                      <path d="M6.2 6.2A10.8 10.8 0 002.5 12c1.3 4.1 5.1 7 9.5 7 1 0 2-.2 2.9-.5" />
                    </svg>
                  ) : (
                    <svg
                      className="h-5 w-5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M2.5 12s3.5-7 9.5-7 9.5 7 9.5 7-3.5 7-9.5 7-9.5-7-9.5-7z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>

              {errors.password && (
                <p className="mt-1 text-sm text-red-400">
                  {errors.password.message}
                </p>
              )}
            </div>

            {errorServidor && (
              <p
                role="alert"
                className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300"
              >
                {errorServidor}
              </p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#F97316] px-5 py-3.5 text-sm font-semibold text-white shadow-md transition-colors hover:bg-[#EA580C] focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-[#1E293B] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Iniciando sesión..." : "Iniciar sesión"}

              {isSubmitting && (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              )}
            </button>
          </form>

          {/* Registro */}
          <div className="mt-8 border-t border-slate-700/60 pt-6 text-center">
            <p className="text-sm text-slate-400">
              ¿No tienes una cuenta?{" "}
              <Link
                to="/registro"
                className="font-semibold text-[#F97316] transition-colors hover:text-orange-400 hover:underline"
              >
                Regístrate aquí
              </Link>
            </p>
          </div>
        </section>

        <p className="mt-6 px-4 text-center text-xs leading-relaxed text-slate-400">
          El sistema identifica automáticamente tu perfil de usuario al iniciar
          sesión.
        </p>
      </div>
    </main>
  );
}
