import Link from 'next/link';
import { redirect } from 'next/navigation';
import { supa } from '@/lib/supabase';
import { sair } from '../actions';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Painel', robots: { index: false } };

export default async function PainelLayout({ children }: { children: React.ReactNode }) {
  const s = supa();
  const { data: { user } } = await s.auth.getUser();
  if (!user) redirect('/admin/login');
  const { data: adm } = await s.from('admins').select('user_id').eq('user_id', user.id).maybeSingle();
  if (!adm) return <div className="wrap py-16"><p>A conta {user.email} não tem acesso ao painel. Peça para a equipe liberar.</p><form action={sair}><button className="btn mt-4">Sair</button></form></div>;
  const links = [['/admin', 'Perfis'], ['/admin/novo', '+ Nova profissional'], ['/admin/importar', 'Importar planilha'], ['/admin/categorias', 'Categorias'], ['/admin/cidades', 'Cidades']];
  return (
    <div className="wrap py-6 grid gap-5">
      <nav className="flex flex-wrap items-center gap-1 border-b-2 border-roxo pb-3">
        {links.map(([h, t]) => <Link key={h} href={h} className="font-display uppercase px-3 py-1.5 hover:bg-amarelo">{t}</Link>)}
        <form action={sair} className="ml-auto"><button className="text-xs font-semibold uppercase tracking-[0.06em] border-2 border-roxo px-3 py-1.5">Sair ({user.email})</button></form>
      </nav>
      {children}
    </div>
  );
}
