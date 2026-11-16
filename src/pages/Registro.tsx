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

  const clasesInput =
    "w-full rounded-xl border border-slate-700 bg-[#0F172A] px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition-colors focus:border-orange-500 focus:ring-1 focus:ring-orange-500";

  const clasesLabel =
    "mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-300";

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0F172A] px-4 py-8 text-slate-100">
      <div className="w-full max-w-md">
        <section className="rounded-2xl border border-slate-700/60 bg-[#1E293B] p-7 shadow-2xl shadow-black/40 sm:p-10">
          <header className="mb-8 text-center">
            <div className="mb-6 flex items-center justify-center gap-2.5">
              <span className="font-extrabold tracking-tight text-white">
                NOVA TECH
              </span>
              <span className="rounded border border-orange-500/30 bg-orange-500/20 px-1.5 py-0.5 text-[10px] font-semibold tracking-wider text-orange-400">
                POS & COMMERCE
              </span>
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Crear cuenta
            </h1>

            <p className="mt-2 text-sm text-[#94A3B8]">
              Regístrate para comprar en nuestra tienda.
            </p>
          </header>

          <form onSubmit={handleSubmit(enviarFormulario)} className="space-y-5">
            <div>
              <label htmlFor="nombre" className={clasesLabel}>
                Nombre completo
              </label>
              <input
                id="nombre"
                type="text"
                autoComplete="name"
                {...register("nombre")}
                className={clasesInput}
                placeholder="Tu nombre"
              />
              {errors.nombre && (
                <p className="mt-1 text-sm text-red-400">
                  {errors.nombre.message}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="celular" className={clasesLabel}>
                Celular
              </label>
              <input
                id="celular"
                type="tel"
                autoComplete="tel"
                {...register("celular")}
                className={clasesInput}
                placeholder="70000000"
              />
              {errors.celular && (
                <p className="mt-1 text-sm text-red-400">
                  {errors.celular.message}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="ci" className={clasesLabel}>
                Carnet de identidad (opcional)
              </label>
              <input
                id="ci"
                type="text"
                {...register("ci")}
                className={clasesInput}
                placeholder="Tu CI"
              />
              {errors.ci && (
                <p className="mt-1 text-sm text-red-400">{errors.ci.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className={clasesLabel}>
                Correo electrónico
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                {...register("email")}
                className={clasesInput}
                placeholder="correo@ejemplo.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-400">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="password" className={clasesLabel}>
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                autoComplete="new-password"
                {...register("password")}
                className={clasesInput}
                placeholder="Mínimo 8 caracteres"
              />
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
              {isSubmitting ? "Creando cuenta..." : "Crear cuenta"}
            </button>
          </form>

          <div className="mt-8 border-t border-slate-700/60 pt-6 text-center">
            <p className="text-sm text-slate-400">
              ¿Ya tienes una cuenta?{" "}
              <Link
                to="/"
                className="font-semibold text-[#F97316] transition-colors hover:text-orange-400 hover:underline"
              >
                Inicia sesión
              </Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
