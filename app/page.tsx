import Image from 'next/image';
import Link from 'next/link';
import { Search, Heart, ShoppingCart, User, Zap, ShieldCheck, ChevronRight, Gamepad2, Crosshair, Map, Swords, Trophy, Ghost } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen bg-[#060012] text-white font-sans selection:bg-[#ff00ff] selection:text-white pb-20 overflow-x-hidden">
      {/* Custom Neon Navbar */}
      <nav className="border-b border-[#2a0050] bg-[#060012]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#ff00ff] to-[#00ffff] flex items-center justify-center p-0.5 shadow-[0_0_15px_rgba(255,0,255,0.4)]">
              <div className="w-full h-full bg-[#060012] rounded-full flex items-center justify-center">
                <span className="font-black text-transparent bg-clip-text bg-gradient-to-r from-[#ff00ff] to-[#00ffff] text-xl">M</span>
              </div>
            </div>
            <span className="text-xl font-black tracking-tight text-white hidden sm:block">Mythic<span className="text-[#ff00ff]">Market</span></span>
          </div>

          <div className="flex-1 max-w-2xl hidden md:flex items-center bg-[#13002b] border border-[#3d0075] rounded-full px-4 py-2 focus-within:border-[#ff00ff] focus-within:shadow-[0_0_10px_rgba(255,0,255,0.3)] transition-all">
            <Search className="w-5 h-5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Busca juegos, tarjetas regalo, DLC y más..." 
              className="bg-transparent border-none outline-none w-full px-3 text-sm text-white placeholder-gray-500"
            />
          </div>

          <div className="flex items-center gap-4 sm:gap-6">
            <button className="hidden sm:flex items-center gap-2 text-gray-300 hover:text-[#ff00ff] transition-colors">
              <Heart className="w-5 h-5" />
              <span className="text-sm font-medium">Favoritos</span>
            </button>
            <button className="flex items-center gap-2 text-gray-300 hover:text-[#00ffff] transition-colors">
              <ShoppingCart className="w-5 h-5" />
              <span className="text-sm font-medium">Carrito</span>
            </button>
            <Link href="/login" className="flex items-center gap-2 bg-[#13002b] border border-[#3d0075] hover:border-[#ff00ff] hover:shadow-[0_0_10px_rgba(255,0,255,0.2)] px-3 py-1.5 rounded-full transition-all">
              <div className="w-7 h-7 rounded-full bg-gradient-to-r from-[#ff00ff] to-[#00ffff] flex items-center justify-center">
                <User className="w-4 h-4 text-black" />
              </div>
              <span className="text-sm font-bold">Entrar</span>
            </Link>
          </div>
        </div>
        
        {/* Categories Bar */}
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-6 overflow-x-auto no-scrollbar border-t border-[#1a0033]">
          {['Juegos', 'Tarjetas regalo', 'Suscripciones', 'DLC', 'Software', 'Gaming Points', 'Top-Up', 'Ofertas'].map((cat, i) => (
            <Link key={cat} href={cat === 'Top-Up' ? '/topup/mlbb' : '#'} className={`whitespace-nowrap text-sm font-medium transition-colors ${cat === 'Ofertas' ? 'text-[#ff00ff] font-bold drop-shadow-[0_0_8px_rgba(255,0,255,0.6)]' : 'text-gray-300 hover:text-white'}`}>
              {cat}
            </Link>
          ))}
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left Sidebar: Flash Offers & Features */}
        <div className="hidden lg:flex flex-col gap-6">
          <div className="bg-[#13002b] border border-[#3d0075] rounded-2xl p-6 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-1 h-full bg-[#ff00ff] shadow-[0_0_15px_#ff00ff]"></div>
            <div className="flex items-center gap-2 mb-4 text-[#ff00ff]">
              <Zap className="w-6 h-6 animate-pulse" fill="currentColor" />
              <h3 className="font-black text-xl italic tracking-wider">OFERTAS FLASH</h3>
            </div>
            <div className="text-sm text-gray-400 mb-2 font-medium">TERMINA EN:</div>
            <div className="flex items-center gap-2 text-2xl font-mono font-bold mb-6">
              <div className="bg-[#060012] px-2 py-1 border border-[#2a0050] rounded text-white">02</div>:
              <div className="bg-[#060012] px-2 py-1 border border-[#2a0050] rounded text-white">45</div>:
              <div className="bg-[#060012] px-2 py-1 border border-[#2a0050] rounded text-white text-[#ff00ff]">38</div>
            </div>
            <button className="w-full py-2.5 rounded-lg border border-[#ff00ff] text-[#ff00ff] font-bold hover:bg-[#ff00ff] hover:text-white hover:shadow-[0_0_15px_rgba(255,0,255,0.4)] transition-all">
              VER OFERTAS
            </button>
          </div>

          <div className="flex flex-col gap-4">
            {[
              { icon: Zap, title: 'ENTREGA INSTANTÁNEA', color: 'text-[#00ffff]' },
              { icon: ShieldCheck, title: 'PAGOS 100% SEGUROS', color: 'text-[#ff00ff]' },
              { icon: Trophy, title: 'PRECIOS IMBATIBLES', color: 'text-[#ffaa00]' },
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-4 text-gray-300">
                <div className={`p-2 rounded-full bg-[#13002b] border border-[#3d0075] ${f.color}`}>
                  <f.icon className="w-5 h-5" />
                </div>
                <span className="font-bold text-sm tracking-wide">{f.title}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-3 space-y-8">
          
          {/* Hero Banner */}
          <div className="relative rounded-2xl overflow-hidden border border-[#520099] shadow-[0_0_30px_rgba(82,0,153,0.3)] bg-[#0d001f] aspect-[21/9] flex items-center">
            <div className="absolute inset-0 bg-gradient-to-r from-[#060012] via-[#060012]/80 to-transparent z-10"></div>
            {/* Background Gradient to emulate the neon cyber look */}
            <div className="absolute inset-0 opacity-40 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#ff00ff]/30 via-[#060012] to-[#060012]"></div>
            
            <div className="relative z-20 p-8 md:p-12 max-w-lg">
              <h1 className="text-5xl md:text-7xl font-black italic text-transparent bg-clip-text bg-gradient-to-r from-[#00ffff] to-[#ff00ff] drop-shadow-[0_0_10px_rgba(255,0,255,0.5)] leading-tight mb-2">
                LEVEL UP<br/>YOUR GAME
              </h1>
              <p className="text-gray-300 font-bold tracking-widest text-sm md:text-base mb-8">
                JUEGOS Y TARJETAS AL MEJOR PRECIO
              </p>
              <button className="bg-transparent border-2 border-[#ff00ff] text-white px-8 py-3 rounded-full font-bold uppercase tracking-wider hover:bg-[#ff00ff] hover:shadow-[0_0_20px_rgba(255,0,255,0.6)] transition-all">
                Comprar Ahora
              </button>
            </div>

            <div className="absolute right-8 top-1/2 -translate-y-1/2 z-20 hidden md:block">
              <div className="w-32 h-32 transform rotate-45 border-4 border-[#00ffff] flex items-center justify-center bg-[#060012]/80 backdrop-blur-sm shadow-[0_0_30px_rgba(0,255,255,0.4)]">
                <div className="transform -rotate-45 text-center">
                  <div className="text-sm font-bold text-gray-400">HASTA</div>
                  <div className="text-4xl font-black text-[#00ffff] drop-shadow-[0_0_10px_rgba(0,255,255,0.8)]">-90%</div>
                  <div className="text-xs font-bold text-white">DESCUENTO</div>
                </div>
              </div>
            </div>
          </div>

          {/* Categories Grid (Neon Borders) */}
          <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
            {[
              { name: 'ACCIÓN', icon: Crosshair },
              { name: 'AVENTURA', icon: Map },
              { name: 'RPG', icon: Swords },
              { name: 'FPS', icon: Crosshair },
              { name: 'DEPORTES', icon: Trophy },
              { name: 'INDIE', icon: Gamepad2 },
              { name: 'TERROR', icon: Ghost },
              { name: 'VER MÁS', icon: ChevronRight },
            ].map((cat, i) => (
              <button key={cat.name} className="flex flex-col items-center gap-2 p-3 rounded-xl border border-[#2a0050] bg-[#13002b] hover:border-[#00ffff] hover:shadow-[0_0_15px_rgba(0,255,255,0.3)] transition-all group">
                <cat.icon className="w-6 h-6 text-[#ff00ff] group-hover:text-[#00ffff] transition-colors" />
                <span className="text-[10px] font-bold text-gray-400 group-hover:text-white transition-colors">{cat.name}</span>
              </button>
            ))}
          </div>

          {/* Best Sellers */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-[#ff00ff]" fill="currentColor" />
                <h2 className="text-xl font-bold italic tracking-wide">LOS MÁS VENDIDOS</h2>
              </div>
              <button className="text-xs font-bold px-3 py-1.5 border border-[#3d0075] rounded bg-[#13002b] hover:bg-[#2a0050] transition-colors">VER MÁS</button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Card 1 */}
              <div className="bg-[#13002b] border border-[#2a0050] rounded-xl overflow-hidden hover:border-[#ff00ff] hover:shadow-[0_0_15px_rgba(255,0,255,0.2)] transition-all group">
                <div className="aspect-[3/4] bg-[#2a0050] relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-[#13002b] to-transparent z-10"></div>
                  <div className="absolute inset-0 bg-gradient-to-br from-green-600 to-blue-800 opacity-80"></div>
                  <div className="absolute bottom-2 left-2 z-20 flex gap-1">
                    <span className="bg-black/80 px-2 py-0.5 text-[10px] font-bold rounded">STEAM</span>
                  </div>
                </div>
                <div className="p-3">
                  <h3 className="font-bold text-sm mb-2 truncate group-hover:text-[#ff00ff] transition-colors">EA SPORTS FC™ 24</h3>
                  <div className="flex items-center gap-2">
                    <span className="bg-[#ff00ff] text-black font-black text-xs px-1.5 py-0.5 rounded">-72%</span>
                    <span className="font-bold">US$19.99</span>
                  </div>
                  <div className="text-xs text-gray-500 line-through mt-0.5">US$69.99</div>
                </div>
              </div>

              {/* Card 2 */}
              <div className="bg-[#13002b] border border-[#2a0050] rounded-xl overflow-hidden hover:border-[#00ffff] hover:shadow-[0_0_15px_rgba(0,255,255,0.2)] transition-all group">
                <div className="aspect-[3/4] bg-[#2a0050] relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-[#13002b] to-transparent z-10"></div>
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-700 to-red-900 opacity-80"></div>
                  <div className="absolute bottom-2 left-2 z-20 flex gap-1">
                    <span className="bg-black/80 px-2 py-0.5 text-[10px] font-bold rounded">STEAM</span>
                  </div>
                </div>
                <div className="p-3">
                  <h3 className="font-bold text-sm mb-2 truncate group-hover:text-[#00ffff] transition-colors">Call of Duty: MWIII</h3>
                  <div className="flex items-center gap-2">
                    <span className="bg-[#00ffff] text-black font-black text-xs px-1.5 py-0.5 rounded">-45%</span>
                    <span className="font-bold">US$38.99</span>
                  </div>
                  <div className="text-xs text-gray-500 line-through mt-0.5">US$69.99</div>
                </div>
              </div>

              {/* Card 3 */}
              <div className="bg-[#13002b] border border-[#2a0050] rounded-xl overflow-hidden hover:border-[#ffaa00] hover:shadow-[0_0_15px_rgba(255,170,0,0.2)] transition-all group">
                <div className="aspect-[3/4] bg-[#2a0050] relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-[#13002b] to-transparent z-10"></div>
                  <div className="absolute inset-0 bg-gradient-to-br from-yellow-700 to-black opacity-80"></div>
                  <div className="absolute bottom-2 left-2 z-20 flex gap-1">
                    <span className="bg-black/80 px-2 py-0.5 text-[10px] font-bold rounded">STEAM</span>
                  </div>
                </div>
                <div className="p-3">
                  <h3 className="font-bold text-sm mb-2 truncate group-hover:text-[#ffaa00] transition-colors">ELDEN RING</h3>
                  <div className="flex items-center gap-2">
                    <span className="bg-[#ffaa00] text-black font-black text-xs px-1.5 py-0.5 rounded">-34%</span>
                    <span className="font-bold">US$39.59</span>
                  </div>
                  <div className="text-xs text-gray-500 line-through mt-0.5">US$59.99</div>
                </div>
              </div>

              {/* Card 4 (MLBB Link disguised as a card) */}
              <Link href="/topup/mlbb" className="bg-[#13002b] border border-[#2a0050] rounded-xl overflow-hidden hover:border-[#00ffff] hover:shadow-[0_0_15px_rgba(0,255,255,0.2)] transition-all group block">
                <div className="aspect-[3/4] bg-[#2a0050] relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-[#13002b] to-transparent z-10"></div>
                  <div className="absolute inset-0 bg-gradient-to-br from-[#0a0f1a] to-blue-900 opacity-80 flex items-center justify-center p-4">
                    <div className="text-center z-20">
                      <div className="text-[#00ffff] font-black text-xl mb-1">MOBILE LEGENDS</div>
                      <div className="text-xs text-gray-300">DIAMONDS & PASS</div>
                    </div>
                  </div>
                  <div className="absolute bottom-2 left-2 z-20 flex gap-1">
                    <span className="bg-black/80 px-2 py-0.5 text-[10px] font-bold rounded text-[#00ffff]">TOP-UP</span>
                  </div>
                </div>
                <div className="p-3">
                  <h3 className="font-bold text-sm mb-2 truncate group-hover:text-[#00ffff] transition-colors">Recarga Mobile Legends</h3>
                  <div className="flex items-center gap-2">
                    <span className="bg-blue-600 text-white font-black text-xs px-1.5 py-0.5 rounded">INSTANT</span>
                    <span className="font-bold text-xs">Desde US$1.49</span>
                  </div>
                  <div className="text-[10px] text-green-400 mt-1">ID verification active</div>
                </div>
              </Link>

            </div>
          </div>

        </div>
      </div>
      
      {/* Footer Banner */}
      <div className="max-w-7xl mx-auto px-4 mt-12">
        <div className="bg-gradient-to-r from-[#13002b] via-[#2a0050] to-[#13002b] border border-[#3d0075] rounded-xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
          {/* Subtle texture emulation */}
          <div className="absolute inset-0 opacity-10 mix-blend-overlay bg-repeat" style={{ backgroundImage: 'radial-gradient(circle at center, #ffffff 1px, transparent 1px)', backgroundSize: '10px 10px' }}></div>
          
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-8 relative z-10">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-8 h-8 text-[#00ffff]" />
              <div>
                <div className="font-bold text-sm">MILES DE PRODUCTOS</div>
                <div className="text-xs text-gray-400">A LOS MEJORES PRECIOS</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Zap className="w-8 h-8 text-[#ff00ff]" />
              <div>
                <div className="font-bold text-sm">ENVÍO INSTANTÁNEO</div>
                <div className="text-xs text-gray-400">RECIBE AL MOMENTO</div>
              </div>
            </div>
          </div>
          
          <div className="relative z-10 flex items-center gap-4">
            <Gamepad2 className="w-8 h-8 text-[#00ffff] animate-pulse" />
            <div>
              <div className="font-black text-xl italic text-transparent bg-clip-text bg-gradient-to-r from-[#00ffff] to-[#ff00ff]">GAME ON.</div>
              <div className="text-sm font-bold text-gray-300">AHORRA MÁS.</div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
