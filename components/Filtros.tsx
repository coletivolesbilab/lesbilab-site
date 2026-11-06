'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { UFS } from '@/lib/util';

type Cat = { slug: string; nome: string };
type Cid = { uf: string; cidade: string; cidade_slug: string };

export function Filtros({ categorias, cidades }: { categorias: Cat[]; cidades: Cid[] }) {
  const r = useRouter(); const sp = useSearchParams();
  const [q, setQ] = useState(sp.get('q') || '');
  const uf = sp.get('uf') || ''; const cid = sp.get('cidade') || ''; const cat = sp.get('cat') || '';
  const ir = (patch: Record<string, string>) => {
    const p = new URLSearchParams(sp.toString());
    for (const [k, v] of Object.entries(patch)) v ? p.set(k, v) : p.delete(k);
    p.delete('pag');
    r.push(`/talentos${p.size ? '?' + p : ''}`, { scroll: false });
  };
  useEffect(() => { const t = setTimeout(() => { if (q !== (sp.get('q') || '')) ir({ q }); }, 350); return () => clearTimeout(t); }); // eslint-disable-line
  const cidsUf = [...new Map(cidades.filter((c) => !uf || c.uf === uf).map((c) => [c.cidade_slug + c.uf, c])).values()].sort((a, b) => a.cidade.localeCompare(b.cidade));
  return (
    <div className="grid gap-3">
      <div role="search" className="grid gap-2 grid-cols-2 md:grid-cols-[2fr_1.2fr_1.2fr_1.5fr]">
        <label className="rotulo col-span-2 md:col-span-1">Busca livre
          <input className="campo" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="nome ou profissão: fotógrafa, DJ, psicóloga…" />
        </label>
        <label className="rotulo">Estado
          <select className="campo" value={uf} onChange={(e) => ir({ uf: e.target.value, cidade: '' })}>
            <option value="">Todos</option>
            {Object.entries(UFS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </label>
        <label className="rotulo">Cidade
          <select className="campo" value={cid} onChange={(e) => ir({ cidade: e.target.value })}>
            <option value="">Todas</option>
            {cidsUf.map((c) => <option key={c.uf + c.cidade_slug} value={c.cidade_slug}>{c.cidade}{uf ? '' : ` (${c.uf})`}</option>)}
          </select>
        </label>
        <label className="rotulo col-span-2 md:col-span-1">Categoria
          <select className="campo" value={cat} onChange={(e) => ir({ cat: e.target.value })}>
            <option value="">Todas</option>
            {categorias.map((c) => <option key={c.slug} value={c.slug}>{c.nome}</option>)}
          </select>
        </label>
      </div>
    </div>
  );
}
