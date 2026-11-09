import './globals.css';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Logo } from '@/components/Logo';

export const metadata: Metadata = {
  title: { default: 'LESBILAB · Coletivo sáfico', template: '%s · LESBILAB' },
  description: 'Coletivo sáfico e Banco de Talentos Nacional da comunidade sáfica.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Anton&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600&display=swap" />
      </head>
      <body className="min-h-screen flex flex-col">
        <header className="sticky top-0 z-20 bg-roxo text-papel">
          <div className="wrap flex flex-wrap items-center justify-between gap-3 py-2.5">
            <Logo />
            <nav className="flex gap-1 font-display uppercase tracking-wide">
              <Link href="/" className="px-3 py-1.5 hover:bg-amarelo hover:text-roxo">O Coletivo</Link>
              <Link href="/talentos" className="px-3 py-1.5 hover:bg-amarelo hover:text-roxo">Banco de Talentos</Link>
            </nav>
          </div>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="bg-roxo text-papel text-sm">
          <div className="wrap flex flex-wrap justify-between gap-3 py-5">
            <span>LESBILAB · Um rolê sáfico, feito pela comunidade e para a comunidade.</span>
            <Link href="/privacidade" className="underline">Privacidade e remoção de dados</Link>
          </div>
        </footer>
      </body>
    </html>
  );
}
