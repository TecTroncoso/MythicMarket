"use client";

import { useEffect } from 'react';
import { Loader2, X } from 'lucide-react';
import type { PaymentRegionConfig } from '@/lib/payments';

interface PaymentModalProps {
  cfg: PaymentRegionConfig;
  regionOverride: 'auto' | 'eu' | 'latam';
  onRegionChange: (region: 'auto' | 'eu' | 'latam') => void;
  selectedMethod: string | null;
  onSelectMethod: (id: string) => void;
  paymentDetail: string;
  onPaymentDetailChange: (value: string) => void;
  paymentError: string | null;
  isPending: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export function PaymentModal({
  cfg,
  regionOverride,
  onRegionChange,
  selectedMethod,
  onSelectMethod,
  paymentDetail,
  onPaymentDetailChange,
  paymentError,
  isPending,
  onConfirm,
  onClose,
}: PaymentModalProps) {
  // Close the dialog with Escape. No focus trap required for this flow.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  const selectedMethodDef = cfg.methods.find((m) => m.id === selectedMethod) ?? null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Método de pago"
        onClick={(event) => event.stopPropagation()}
        className="w-full max-w-lg max-h-[90vh] overflow-y-auto bg-[#121824] border border-[#1c2534] rounded-2xl p-6 md:p-8"
      >
        <div className="flex items-start justify-between gap-4 mb-6">
          <h3 className="text-2xl font-bold">Método de Pago</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="text-gray-500 hover:text-gray-300 transition-colors shrink-0"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Region selector */}
        <div className="mb-6">
          {regionOverride === 'auto' ? (
            <p className="text-sm text-gray-400 mb-3">
              Detectamos tu región: {cfg.region === 'eu' ? 'Europa' : 'Latinoamérica'}. Podés cambiarla:
            </p>
          ) : (
            <p className="text-sm text-gray-400 mb-3">Elegí tu región:</p>
          )}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => onRegionChange('eu')}
              className={`border-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all ${
                cfg.region === 'eu'
                  ? 'border-[#ffaa00] bg-[#ffaa00]/10'
                  : 'border-[#2a3441] bg-[#0a0f1a] hover:border-gray-500'
              }`}
            >
              Europa (€)
            </button>
            <button
              type="button"
              onClick={() => onRegionChange('latam')}
              className={`border-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all ${
                cfg.region === 'latam'
                  ? 'border-[#ffaa00] bg-[#ffaa00]/10'
                  : 'border-[#2a3441] bg-[#0a0f1a] hover:border-gray-500'
              }`}
            >
              Latinoamérica (US$)
            </button>
            {regionOverride !== 'auto' && (
              <button
                type="button"
                onClick={() => onRegionChange('auto')}
                className="text-xs text-gray-500 hover:text-gray-300 underline"
              >
                Volver a automático
              </button>
            )}
          </div>
        </div>

        {/* Accepted brands for this region */}
        <div className="flex flex-wrap items-center gap-2 mb-5">
          {cfg.methods.map((m) => (
            <span
              key={m.id}
              className="inline-flex items-center justify-center h-9 min-w-[2.5rem] px-2 bg-white rounded-lg border border-gray-700"
            >
              {m.logo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={m.logo} alt={m.label} className="h-5 w-auto object-contain" />
              ) : (
                <span className="text-[10px] font-bold text-gray-700">{m.label}</span>
              )}
            </span>
          ))}
        </div>

        {/* Payment methods */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {cfg.methods.map((m) => {
            const isSelected = selectedMethod === m.id;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => onSelectMethod(m.id)}
                className={`border-2 rounded-xl p-4 text-left transition-all ${
                  isSelected
                    ? 'border-[#ffaa00] bg-[#ffaa00]/10'
                    : 'border-[#2a3441] bg-[#0a0f1a] hover:border-gray-500'
                }`}
              >
                <span className="font-bold text-white">{m.label}</span>
                <p className="text-xs text-gray-400 mt-1">{m.description}</p>
              </button>
            );
          })}
        </div>

        {selectedMethodDef?.needsField && (
          <div className="mt-5 space-y-2">
            <label className="text-sm font-semibold text-gray-400 block">
              {selectedMethodDef.fieldLabel}
            </label>
            <input
              type="text"
              value={paymentDetail}
              onChange={(event) => onPaymentDetailChange(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !isPending) onConfirm();
              }}
              placeholder={selectedMethodDef.fieldPlaceholder ?? ''}
              className="w-full bg-[#0a0f1a] border border-[#2a3441] rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#ffaa00] focus:ring-1 focus:ring-[#ffaa00] transition-all"
            />
          </div>
        )}
        {paymentError && <p className="text-red-400 text-sm mt-2">{paymentError}</p>}

        {/* Footer */}
        <div className="mt-6 space-y-3">
          <button
            type="button"
            onClick={onConfirm}
            disabled={isPending}
            className="w-full bg-gradient-to-r from-[#ffaa00] to-[#ff5d00] hover:from-[#ffbf33] hover:to-[#ff7b33] text-black font-black text-lg py-4 rounded-xl shadow-[0_0_20px_rgba(255,170,0,0.4)] transition-all transform hover:scale-[1.02] active:scale-[0.98] flex justify-center items-center gap-2 disabled:opacity-70"
          >
            {isPending ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                Procesando...
              </span>
            ) : (
              <>Confirmar pago</>
            )}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="w-full text-sm text-gray-500 hover:text-gray-300 transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
