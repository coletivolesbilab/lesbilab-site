import Link from 'next/link';
import { Suspense } from 'react';
import { supa } from '@/lib/supabase';
import { norm, UFS } from '@/lib/util';
import { Filtros } from '@/components/Filtros';

export const metadata = { title: 'Banco de Talentos' };
export const dynamic = 'force-dynamic';
const POR_PAG = 24;

type SP = { q?: string; uf?: string; cidade?: string; cat?: string; pag?: string };

export default async function Talentos({ searchParams: sp }: { searchParams: SP }) {
  const s = supa();
  const [{ data: cats }, { data: cids }] = await Promise.all([
    s.from('categorias').select('id,slug,nome').order('ordem'),
    s.from('perfis_publicos').select('uf,cidade,cidade_slug').not('cidade', 'is', null),
  ]);
  const pag = Math.max(1, Number(sp.pag) || 1);
  let qy = s.from('perfis_publicos').select('slug,nome,profissao,cidade,uf,destaque,categoria_ids', { count: 'exact' });
  if (sp.uf && UFS[sp.uf]) qy = qy.eq('uf', sp.uf);
  if (sp.cidade) qy = qy.eq('cidade_slug', sp.cidade);
  const cat = cats?.find((c) => c.slug === sp.cat);
  if (cat) qy = qy.contains('categoria_ids', [cat.id]);
  if (sp.q) qy = qy.ilike('busca', `%${norm(sp.q).replace(/[%_,()]/g, ' ')}%`);
  const { data, count } = await qy.order('destaque', { ascending: false }).order('nome').range((pag - 1) * POR_PAG, pag * POR_PAG - 1);
  const nomeCat = new Map((cats || []).map((c) => [c.id, c.nome]));
  const total = count || 0;
  const href = (p: number) => { const u = new URLSearchParams(Object.entries(sp).filter(([, v]) => v) as [string, string][]); u.set('pag', String(p)); return `/talentos?${u}`; };

  return (
    <>
      <div className="bg-magenta text-papel bg-letreiro">
        <div className="wrap relative grid gap-5 py-9">
          <span className="tarja justify-self-start">Banco de Talentos Nacional</span>
          <h1 className="font-display uppercase text-[clamp(32px,5.5vw,58px)] leading-[1.18] text-balance">Contrata quem<br />é da comunidade.</h1>
          <Suspense><Filtros categorias={cats || []} cidades={cids || []} /></Suspense>
        </div>
      </div>
      <div className="wrap py-6 grid gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="font-display uppercase text-3xl"><span className="text-magenta">{total}</span> profissiona{total === 1 ? 'l' : 'is'}</p>
          {Object.values(sp).some(Boolean) && <Link href="/talentos" className="text-sm font-medium border-2 border-roxo px-3 py-1.5">Limpar filtros</Link>}
        </div>
        {total === 0 ? <p>Nenhuma profissional com esses filtros. Tenta tirar um deles.</p> : (
          <ul className="grid gap-3.5 [grid-template-columns:repeat(auto-fill,minmax(250px,1fr))]">
            {data!.map((p) => (
              <li key={p.slug}>
                <Link href={`/talentos/${p.slug}`} className={`grid gap-1.5 h-full content-start border-2 border-roxo p-4 bg-white transition hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-blocom ${p.destaque ? 'outline outline-4 outline-amarelo' : ''}`}>
                  <span className="text-sm font-medium text-magenta">{p.cidade || 'Cidade a confirmar'} · {p.uf || '—'}{p.destaque && ' · Destaque'}</span>
                  <h2 className="font-display uppercase text-xl leading-[1.25] break-words">{p.nome}</h2>
                  <p className="text-sm break-words">{p.profissao}</p>
                  <span className="flex flex-wrap gap-1">{(p.categoria_ids as number[]).slice(0, 3).map((id) => <span key={id} className="bg-verde text-[11px] font-semibold px-1.5">{nomeCat.get(id)}</span>)}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
        {total > POR_PAG && (
          <nav className="flex justify-center gap-3 py-4" aria-label="Paginação">
            {pag > 1 && <Link className="btn" href={href(pag - 1)}>Anterior</Link>}
            <span className="text-xs font-semibold uppercase self-center">{pag} / {Math.ceil(total / POR_PAG)}</span>
            {pag * POR_PAG < total && <Link className="btn" href={href(pag + 1)}>Próxima</Link>}
          </nav>
        )}
      </div>
    </>
  );
}
