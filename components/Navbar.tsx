import Image from 'next/image';
import Link from 'next/link';
import { Gamepad2, LogOut, User } from 'lucide-react';
import { auth } from '@/auth';
import { SignOutButton } from './SignOutButton';

export async function Navbar() {
  const session = await auth();

  return (
    <header className="sticky top-0 z-50 bg-[#121824]/90 backdrop-blur-md border-b border-[#2a3441] shadow-2xl">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-tr from-[#ffaa00] to-[#ff5d00] rounded-xl flex items-center justify-center shadow-lg transform hover:rotate-12 transition-transform">
            <Gamepad2 className="text-white w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300">
            Mythic Market
          </h1>
        </div>
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-400">
          <Link href="/" className="hover:text-white transition-colors">Inicio</Link>
          <span className="cursor-not-allowed text-gray-500 flex items-center gap-1" title="Se implementará más tarde">
            Juegos <span className="text-[10px] bg-[#2a3441] text-gray-300 px-1.5 py-0.5 rounded-full">Próximamente</span>
          </span>
          <Link href="/" className="text-[#ffaa00]">Mobile Legends</Link>
        </nav>
        <div className="flex items-center gap-4">
          {session?.user ? (
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 bg-[#1c2534] px-3 py-1.5 rounded-lg border border-[#2a3441]">
                {session.user.image ? (
                  <Image src={session.user.image} alt="User" width={24} height={24} className="rounded-full" />
                ) : (
                  <User className="w-4 h-4 text-gray-400" />
                )}
                <span className="text-sm font-medium text-gray-200">{session.user.name?.split(" ")[0] || "Usuario"}</span>
              </div>
              <SignOutButton />
            </div>
          ) : (
            <Link href="/login" className="text-sm font-semibold bg-[#2a3441] hover:bg-[#344050] px-4 py-2 rounded-lg transition-all text-white">
              Iniciar Sesión
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
