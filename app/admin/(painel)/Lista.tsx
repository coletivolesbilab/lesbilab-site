'use client';
import Link from 'next/link';
import { useState } from 'react';
import { acaoPerfis } from '../actions';

type P = { id: number; slug: string; nome: string; profissao: string; uf: string | null; cidade: string; status: string; destaque: boolean; revisar: boolean; local_original: string | null; categoria_original: string | null };
const COR: Record<string, string> = { publicado: 'bg-verde', rascunho: 'bg-amarelo', suspenso: 'bg-roxo text-papel' };

export function Lista({ perfis }: { perfis: P[] }) {
  const [sel, setSel] = useState<number[]>([]);
  const [confirma, setConfirma] = useState(false);
  const tudo = sel.length === perfis.length && perfis.length > 0;
  return (
    <form action={async (f) => { await acaoPerfis(f); setSel([]); setConfirma(false); }} className="grid gap-3">
      {sel.map((id) => <input key={id} type="hidden" name="ids" value={id} />)}
      <div className="flex flex-wrap items-center gap-2 sticky top-[60px] z-10 bg-papel py-2">
        <span className="text-sm font-semibold">{sel.length} selecionada(s)</span>
        {(['publicar', 'rascunho', 'suspender', 'destacar', 'tirar-destaque'] as const).map((a) => (
          <button key={a} name="acao" value={a} disabled={!sel.length} className="border-2 border-roxo px-2.5 py-1 text-sm capitalize disabled:opacity-40">{a.replace('-', ' ')}</button>
        ))}
        {confirma
          ? <><button name="acao" value="excluir" className="bg-magenta text-papel px-2.5 py-1 text-sm">Confirmar exclusão de {sel.length}</button><button type="button" onClick={() => setConfirma(false)} className="text-sm underline">cancelar</button></>
          : <button type="button" disabled={!sel.length} onClick={() => setConfirma(true)} className="border-2 border-magenta text-magenta px-2.5 py-1 text-sm disabled:opacity-40">Excluir</button>}
      </div>
      <div className="overflow-x-auto border-2 border-roxo bg-white">
        <table className="w-full min-w-[820px] text-sm">
          <thead className="bg-roxo text-papel text-xs font-semibold uppercase tracking-[0.06em] text-left">
            <tr><th className="p-2"><input type="checkbox" aria-label="Selecionar todas" checked={tudo} onChange={() => setSel(tudo ? [] : perfis.map((p) => p.id))} /></th><th className="p-2">NOME</th><th className="p-2">PROFISSÃO</th><th className="p-2">LOCAL</th><th className="p-2">STATUS</th><th className="p-2"></th></tr>
          </thead>
          <tbody>
            {perfis.map((p) => (
              <tr key={p.id} className="border-t border-roxo/15 align-top">
                <td className="p-2"><input type="checkbox" aria-label={`Selecionar ${p.nome}`} checked={sel.includes(p.id)} onChange={() => setSel(sel.includes(p.id) ? sel.filter((x) => x !== p.id) : [...sel, p.id])} /></td>
                <td className="p-2 font-semibold">{p.nome}{p.destaque && ' ★'}</td>
                <td className="p-2">{p.profissao}{p.categoria_original && <span className="block text-xs text-magenta">categoria original: {p.categoria_original}</span>}</td>
                <td className="p-2">{p.cidade || '?'} / {p.uf || '?'}{p.revisar && p.local_original && <span className="block text-xs opacity-70">planilha: {p.local_original}</span>}</td>
                <td className="p-2"><span className={`${COR[p.status]} px-2 text-xs font-semibold`}>{p.status}</span>{p.revisar && <span className="ml-1 bg-magenta text-papel px-2 text-xs font-semibold">revisar</span>}</td>
                <td className="p-2 whitespace-nowrap"><Link href={`/admin/perfil/${p.id}`} className="underline">Editar</Link>{p.status === 'publicado' && <> · <Link href={`/talentos/${p.slug}`} target="_blank" className="underline">Ver</Link></>}</td>
              </tr>
            ))}
            {!perfis.length && <tr><td colSpan={6} className="p-4">Nenhum perfil aqui.</td></tr>}
          </tbody>
        </table>
      </div>
    </form>
  );
}
