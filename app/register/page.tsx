"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Gamepad2 } from "lucide-react";
import Link from "next/link";
import { register } from "@/lib/actions/auth";
import { googleSignInAction } from "@/lib/actions/google-signin";
import { Turnstile } from '@marsidev/react-turnstile';

export default function RegisterPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const res = await register(formData);

    if (res.error) {
      setError(res.error);
      setLoading(false);
    } else if (res.success) {
      // Assuming auto-login after register is nice or redirecting to login.
      // Redirecting directly to login.
      router.push("/login");
    }
  };

  return (
    <main className="min-h-screen bg-[#0a0f1a] text-white flex flex-col items-center justify-center p-4 selection:bg-[#ffaa00] selection:text-black">
      <Link href="/" className="mb-8 flex items-center gap-3 group">
        <div className="w-12 h-12 bg-gradient-to-tr from-[#ffaa00] to-[#ff5d00] rounded-xl flex items-center justify-center shadow-lg transform group-hover:rotate-12 transition-transform">
          <Gamepad2 className="text-white w-7 h-7" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300">
          Mythic Market
        </h1>
      </Link>

      <div className="w-full max-w-md bg-[#121824] rounded-2xl p-8 border border-[#1c2534] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#ffaa00] to-[#ff5d00]"></div>
        <h2 className="text-3xl font-black mb-6 text-center">Crear Cuenta</h2>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/50 text-red-500 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-400 block">Nombre Completo</label>
            <input
              type="text"
              name="name"
              required
              className="w-full bg-[#0a0f1a] border border-[#2a3441] rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#ffaa00] focus:ring-1 focus:ring-[#ffaa00] transition-all"
              placeholder="Juan Pérez"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-400 block">Correo Electrónico</label>
            <input
              type="email"
              name="email"
              required
              className="w-full bg-[#0a0f1a] border border-[#2a3441] rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#ffaa00] focus:ring-1 focus:ring-[#ffaa00] transition-all"
              placeholder="tu@correo.com"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-400 block">Contraseña</label>
              <input
                type="password"
                name="password"
                required
                className="w-full bg-[#0a0f1a] border border-[#2a3441] rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#ffaa00] focus:ring-1 focus:ring-[#ffaa00] transition-all"
                placeholder="••••••••"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-400 block">Confirmar</label>
              <input
                type="password"
                name="confirmPassword"
                required
                className="w-full bg-[#0a0f1a] border border-[#2a3441] rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#ffaa00] focus:ring-1 focus:ring-[#ffaa00] transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="flex justify-center pt-2">
            <Turnstile siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '1x00000000000000000000AA'} />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-[#ffaa00] to-[#ff5d00] hover:from-[#ffbf33] hover:to-[#ff7b33] text-black font-black text-lg py-3 rounded-xl shadow-[0_0_20px_rgba(255,170,0,0.4)] transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:pointer-events-none mt-2"
          >
            {loading ? "Registrando..." : "Registrarse"}
          </button>
        </form>

        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-[#2a3441]"></div>
          <span className="text-sm text-gray-500 font-medium">O regístrate con</span>
          <div className="h-px flex-1 bg-[#2a3441]"></div>
        </div>

        <form action={googleSignInAction}>
          <button
            type="submit"
            className="w-full bg-[#1c2534] hover:bg-[#2a3441] border border-[#2a3441] text-white font-semibold text-base py-3 rounded-xl transition-all flex items-center justify-center gap-3"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Google
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-[#2a3441] text-center">
          <p className="text-gray-400 text-sm">
            ¿Ya tienes cuenta?{" "}
            <Link href="/login" className="text-[#ffaa00] font-semibold hover:underline">
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
