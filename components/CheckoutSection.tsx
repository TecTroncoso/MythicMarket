"use client";

import React, { useState, useTransition } from 'react';
import Image from 'next/image';
import { Info, ShoppingCart, ShieldCheck, ChevronRight } from 'lucide-react';
import { processCheckout } from '@/lib/actions/checkout';

const PRODUCTS = [
  { id: '1', name: '86 Diamonds', price: 1.49, bonus: '8 Diamonds', image: 'https://picsum.photos/seed/mlbb1/100/100' },
  { id: '2', name: '172 Diamonds', price: 2.99, bonus: '16 Diamonds', image: 'https://picsum.photos/seed/mlbb2/100/100' },
  { id: '3', name: '257 Diamonds', price: 4.49, bonus: '24 Diamonds', image: 'https://picsum.photos/seed/mlbb3/100/100' },
  { id: '4', name: '429 Diamonds', price: 7.49, bonus: '40 Diamonds', image: 'https://picsum.photos/seed/mlbb4/100/100' },
  { id: '5', name: '706 Diamonds', price: 11.99, bonus: '66 Diamonds', image: 'https://picsum.photos/seed/mlbb5/100/100' },
  { id: '6', name: '2195 Diamonds', price: 34.99, bonus: '205 Diamonds', image: 'https://picsum.photos/seed/mlbb5/100/100' },
  { id: '7', name: 'Twilight Pass', price: 9.99, bonus: '', image: 'https://picsum.photos/seed/mlbbtp/100/100' },
  { id: '8', name: 'Weekly Diamond Pass', price: 1.99, bonus: 'Save 60%', image: 'https://picsum.photos/seed/mlbbwdp/100/100' },
];

export function CheckoutSection({ isLoggedIn }: { isLoggedIn: boolean }) {
  const [userId, setUserId] = useState('');
  const [zoneId, setZoneId] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleCheckout = () => {
    setCheckoutError(null);
    if (!isLoggedIn) {
      setCheckoutError('Debes iniciar sesión para realizar una compra.');
      return;
    }
    if (!userId || !zoneId) {
      setCheckoutError('Por favor ingresa tu User ID y Zone ID.');
      return;
    }
    if (!selectedProduct) {
      setCheckoutError('Por favor selecciona un paquete.');
      return;
    }

    startTransition(async () => {
      const formData = new FormData();
      formData.append("userId", userId);
      formData.append("zoneId", zoneId);
      formData.append("productId", selectedProduct);

      const res = await processCheckout(formData);
      
      if (res.error) {
        setCheckoutError(res.error);
      } else if (res.success) {
        alert(res.message);
      }
    });
  };

  const selectedProductData = PRODUCTS.find(p => p.id === selectedProduct);

  return (
    <>
      <div className="lg:col-span-2 space-y-8">
        {/* Step 1: User ID */}
        <section className="bg-[#121824] rounded-2xl p-6 md:p-8 border border-[#1c2534] shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-1 h-full bg-[#ffaa00]"></div>
          <div className="flex items-center gap-4 mb-6">
            <div className="w-10 h-10 rounded-full bg-[#1c2534] flex items-center justify-center font-bold text-[#ffaa00] text-lg border border-[#2a3441]">1</div>
            <h3 className="text-2xl font-bold">Información de la Cuenta</h3>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-400 block">User ID</label>
              <input 
                type="text" 
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="Ej. 12345678" 
                className="w-full bg-[#0a0f1a] border border-[#2a3441] rounded-xl px-4 py-3 md:py-4 text-white placeholder-gray-600 focus:outline-none focus:border-[#ffaa00] focus:ring-1 focus:ring-[#ffaa00] transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-400 block">Zone ID</label>
              <input 
                type="text" 
                value={zoneId}
                onChange={(e) => setZoneId(e.target.value)}
                placeholder="Ej. (1234)" 
                className="w-full bg-[#0a0f1a] border border-[#2a3441] rounded-xl px-4 py-3 md:py-4 text-white placeholder-gray-600 focus:outline-none focus:border-[#ffaa00] focus:ring-1 focus:ring-[#ffaa00] transition-all"
              />
            </div>
          </div>
          <div className="mt-4 flex items-start gap-2 bg-[#1c2534]/50 p-3 rounded-lg border border-[#2a3441]">
            <Info className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
            <p className="text-xs text-gray-400 leading-relaxed">
              Para encontrar tu User ID, haz clic en tu avatar en la esquina superior izquierda de la pantalla principal del juego. El ID y Zone ID estarán allí (ej. <span className="text-white font-mono bg-[#0a0f1a] px-1 rounded">12345678(1234)</span>).
            </p>
          </div>
        </section>

        {/* Step 2: Select Top-up */}
        <section className="bg-[#121824] rounded-2xl p-6 md:p-8 border border-[#1c2534] shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-1 h-full bg-[#ffaa00]"></div>
          <div className="flex items-center gap-4 mb-6">
            <div className="w-10 h-10 rounded-full bg-[#1c2534] flex items-center justify-center font-bold text-[#ffaa00] text-lg border border-[#2a3441]">2</div>
            <h3 className="text-2xl font-bold">Selecciona una Recarga</h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-4">
            {PRODUCTS.map((prod) => {
              const isSelected = selectedProduct === prod.id;
              return (
                <button
                  key={prod.id}
                  onClick={() => setSelectedProduct(prod.id)}
                  className={`relative flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-200 overflow-hidden ${
                    isSelected 
                      ? 'border-[#ffaa00] bg-[#ffaa00]/10 shadow-[0_0_20px_rgba(255,170,0,0.15)] scale-[1.02]' 
                      : 'border-[#2a3441] bg-[#0a0f1a] hover:border-gray-500 hover:bg-[#1c2534]'
                  }`}
                >
                  {prod.bonus && (
                    <div className="absolute top-0 right-0 bg-[#ff3300] text-white text-[10px] font-bold px-2 py-0.5 rounded-bl-lg">
                      {prod.bonus}
                    </div>
                  )}
                  <Image src={prod.image} alt={`Recarga de ${prod.name}`} width={64} height={64} className="w-12 h-12 md:w-16 md:h-16 mb-3 object-contain drop-shadow-lg" referrerPolicy="no-referrer" />
                  <span className="font-bold text-sm md:text-base text-center line-clamp-2 leading-tight mb-1">{prod.name}</span>
                  <span className={`text-xs font-medium ${isSelected ? 'text-[#ffaa00]' : 'text-gray-400'}`}>
                    US${prod.price.toFixed(2)}
                  </span>
                  {isSelected && (
                    <div className="absolute inset-0 pointer-events-none ring-inset ring-2 ring-[#ffaa00] rounded-xl"></div>
                  )}
                </button>
              );
            })}
          </div>
        </section>
      </div>

      {/* Right Column: Checkout Sidebar */}
      <div className="lg:col-span-1">
        <div className="sticky top-24 space-y-6">
          {/* Summary Card */}
          <div className="bg-[#121824] p-6 lg:p-8 rounded-2xl border border-[#1c2534] shadow-2xl">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-[#ffaa00]" /> Resumen
            </h3>
            
            {selectedProductData ? (
              <div className="space-y-4">
                <div className="flex items-center gap-4 bg-[#0a0f1a] p-4 rounded-xl border border-[#2a3441]">
                  <Image src={selectedProductData.image} alt={`Resumen de ${selectedProductData.name}`} width={48} height={48} className="w-12 h-12 rounded bg-[#1c2534] object-contain" referrerPolicy="no-referrer" />
                  <div>
                    <div className="font-bold text-lg">{selectedProductData.name}</div>
                    <div className="text-sm text-gray-400">Mobile Legends</div>
                  </div>
                </div>
                
                <div className="space-y-2 py-4 border-y border-[#2a3441]">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Precio</span>
                    <span className="font-medium">US${selectedProductData.price.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Tarifa de procesamiento</span>
                    <span className="text-green-400">Gratis</span>
                  </div>
                </div>

                <div className="flex justify-between items-end pt-2 mb-4">
                  <span className="text-gray-300 font-medium">Total</span>
                  <span className="text-3xl font-black text-[#ffaa00]">US${selectedProductData.price.toFixed(2)}</span>
                </div>

                {checkoutError && (
                  <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/50 text-red-500 text-sm text-center font-medium">
                    {checkoutError}
                  </div>
                )}

                <button 
                  onClick={handleCheckout}
                  disabled={isPending}
                  className="w-full bg-gradient-to-r from-[#ffaa00] to-[#ff5d00] hover:from-[#ffbf33] hover:to-[#ff7b33] text-black font-black text-lg py-4 rounded-xl shadow-[0_0_20px_rgba(255,170,0,0.4)] transition-all transform hover:scale-[1.02] active:scale-[0.98] flex justify-center items-center gap-2 disabled:opacity-70 disabled:pointer-events-none"
                >
                  {isPending ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-5 w-5 text-black" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Procesando...
                    </span>
                  ) : (
                    <>Comprar Ahora <ChevronRight className="w-5 h-5" /></>
                  )}
                </button>
                <p className="text-[11px] text-gray-500 text-center mt-4">
                  Al hacer clic en Comprar, aceptas que la venta puede ser gestionada mediante socios externos (ej. Lootbar API).
                </p>
              </div>
            ) : (
              <div className="h-48 flex items-center justify-center border-2 border-dashed border-[#2a3441] rounded-xl flex-col gap-3">
                <ShoppingCart className="w-8 h-8 text-gray-600" />
                <span className="text-gray-500 font-medium text-sm text-center">Selecciona un producto <br/>para ver el resumen</span>
              </div>
            )}
          </div>

          {/* Trust Badges */}
          <div className="bg-[#121824] p-5 rounded-xl border border-[#1c2534] flex items-center gap-4">
            <ShieldCheck className="w-10 h-10 text-green-500 shrink-0" />
            <div>
              <h4 className="font-bold text-sm">Pagos 100% Seguros</h4>
              <p className="text-xs text-gray-400 mt-1">Tus datos están encriptados y protegidos mediante pasarelas verificadas.</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
