import Link from 'next/link';
import { notFound } from 'next/navigation';
import { supa } from '@/lib/supabase';
import { waLink, foneFmt, igHandle, urlSegura } from '@/lib/util';

export const dynamic = 'force-dynamic';

async function carregar(slug: string) {
  const { data } = await supa().from('perfis_publicos').select('*').eq('slug', slug).maybeSingle();
  return data;
}
export async function generateMetadata({ params }: { params: { slug: string } }) {
  const p = await carregar(params.slug);
  return { title: p ? `${p.nome} · ${p.profissao}` : 'Perfil' };
}

export default async function Perfil({ params }: { params: { slug: string } }) {
  const p = await carregar(params.slug);
  if (!p) notFound();
  const { data: cats } = await supa().from('categorias').select('id,nome').in('id', p.categoria_ids.length ? p.categoria_ids : [0]);
  const wa = waLink(p.telefone); const ig = igHandle(p.instagram); const site = urlSegura(p.site);
  const redes = (p.outras_redes || '').split(/\s*\n\s*/).map(urlSegura).filter(Boolean) as string[];
  const temContato = wa || ig || site || redes.length;
  return (
    <div className="wrap max-w-3xl py-8 grid gap-6">
      <Link href="/talentos" className="text-xs font-semibold uppercase tracking-[0.06em]">‹ voltar ao Banco de Talentos</Link>
      <header className="bg-roxo text-papel p-6 grid gap-2">
        <span className="text-xs font-semibold uppercase tracking-[0.08em] text-verde">{p.cidade || 'Cidade a confirmar'} · {p.estado || '—'}</span>
        <h1 className="font-display uppercase text-[clamp(30px,5vw,46px)] leading-[1.18] text-amarelo break-words">{p.nome}</h1>
        <p className="text-lg">{p.profissao}</p>
        <div className="flex flex-wrap gap-1">
          {cats?.map((c) => <span key={c.id} className="bg-verde text-roxo text-xs font-semibold px-2">{c.nome}</span>)}
          {p.sexualidade && <span className="bg-magenta text-papel text-xs font-semibold px-2">{p.sexualidade}</span>}
        </div>
      </header>
      {p.descricao && (
        <section className="grid gap-2">
          <h2 className="text-xs font-semibold uppercase tracking-[0.08em] text-magenta">SERVIÇOS</h2>
          <p className="whitespace-pre-line text-[17px] max-w-prose">{p.descricao}</p>
        </section>
      )}
      {temContato ? (
        <section className="grid gap-3">
          <h2 className="text-xs font-semibold uppercase tracking-[0.08em] text-magenta">CONTATO</h2>
          <div className="flex flex-wrap gap-3">
            {wa && <a className="btn !bg-verde !text-roxo" href={wa} target="_blank" rel="noopener noreferrer">WhatsApp {foneFmt(p.telefone)}</a>}
            {ig && <a className="btn" href={`https://instagram.com/${ig}`} target="_blank" rel="noopener noreferrer">@{ig}</a>}
            {site && <a className="btn !bg-amarelo !text-roxo" href={site} target="_blank" rel="noopener noreferrer">Portfólio / site</a>}
            {redes.map((u) => <a key={u} className="btn !bg-papel !text-roxo border-2 border-roxo" href={u} target="_blank" rel="noopener noreferrer">{new URL(u).hostname.replace('www.', '')}</a>)}
          </div>
        </section>
      ) : null}
    </div>
  );
}
