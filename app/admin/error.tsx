"use client";

import { useEffect } from "react";

/**
 * Error boundary for the /admin segment ONLY. Production hides the real
 * error message, so this logs the digest + route to the browser console
 * and offers a retry. Data-loading failures inside the admin page are
 * already rendered inline with the full message + stack by the page
 * itself; this boundary is the safety net for anything else that throws.
 */
export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[MythicMarket] /admin: error durante el render", {
      name: error.name,
      message: error.message,
      digest: error.digest ?? null,
      stack: error.stack ?? null,
    });
  }, [error]);

  return (
    <main className="min-h-screen bg-[#0a0f1a] text-white font-sans flex items-center justify-center p-6">
      <div className="max-w-lg w-full bg-[#121824] rounded-2xl border border-red-500/40 p-8 shadow-xl text-center">
        <h1 className="text-xl font-black text-red-400 mb-2">
          El panel de administración no pudo cargar
        </h1>
        <p className="text-gray-400 text-sm mb-1">
          Revisá la consola del navegador (F12): el error quedó registrado con el prefijo{" "}
          <code className="text-gray-500">[MythicMarket] /admin</code>.
        </p>
        <p className="text-gray-600 font-mono text-xs mb-6">
          digest: {error.digest ?? "no disponible"}
        </p>
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 text-sm font-semibold bg-[#ffaa00] hover:bg-[#ffbf33] text-black px-4 py-2 rounded-lg transition-all"
        >
          Reintentar
        </button>
      </div>
    </main>
  );
}