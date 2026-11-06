import Link from 'next/link';
import { supa } from '@/lib/supabase';
import { UFS } from '@/lib/util';
import { Lista } from './Lista';

type SP = { status?: string; q?: string; uf?: string; ok?: string };

export default async function Admin({ searchParams: sp }: { searchParams: SP }) {
  const s = supa();
  let q = s.from('profissionais').select('id,slug,nome,profissao,uf,status,destaque,revisar,local_original,categoria_original,cidades(nome)').order('revisar', { ascending: false }).order('nome');
  if (sp.status === 'revisar') q = q.eq('revisar', true);
  else if (sp.status === 'destaque') q = q.eq('destaque', true);
  else if (sp.status) q = q.eq('status', sp.status);
  if (sp.uf) q = q.eq('uf', sp.uf);
  if (sp.q) q = q.or(`nome.ilike.%${sp.q.replace(/[%_,()]/g, ' ')}%,profissao.ilike.%${sp.q.replace(/[%_,()]/g, ' ')}%`);
  const [{ data }, { data: todos }] = await Promise.all([q.limit(1000), s.from('profissionais').select('status,revisar,destaque')]);
  const n = (f: (r: { status: string; revisar: boolean; destaque: boolean }) => boolean) => (todos || []).filter(f).length;
  const abas: [string, string, number][] = [['', 'Todas', todos?.length || 0], ['revisar', 'Precisa revisar', n((r) => r.revisar)], ['rascunho', 'Rascunho', n((r) => r.status === 'rascunho')], ['publicado', 'Publicadas', n((r) => r.status === 'publicado')], ['suspenso', 'Suspensas', n((r) => r.status === 'suspenso')], ['destaque', 'Destaques', n((r) => r.destaque)]];
  const lista = (data || []).map((p) => ({ ...p, cidade: (p.cidades as unknown as { nome: string } | null)?.nome || '' }));
  return (
    <div className="grid gap-4">
      {sp.ok && <p className="bg-verde p-2 text-sm" role="status">Perfil salvo.</p>}
      <div className="flex flex-wrap gap-1.5">
        {abas.map(([k, t, c]) => (
          <Link key={k} href={k ? `/admin?status=${k}` : '/admin'} className={`border-2 border-roxo rounded-full px-3 py-1 text-sm ${(sp.status || '') === k ? 'bg-roxo text-papel' : ''}`}>{t} <b>{c}</b></Link>
        ))}
      </div>
      <form className="flex flex-wrap gap-2">
        {sp.status && <input type="hidden" name="status" value={sp.status} />}
        <input className="campo max-w-xs" name="q" defaultValue={sp.q} placeholder="Buscar nome ou profissão" />
        <select className="campo max-w-[180px]" name="uf" defaultValue={sp.uf}><option value="">Todos os estados</option>{Object.keys(UFS).map((u) => <option key={u}>{u}</option>)}</select>
        <button className="btn !text-base !py-2">Filtrar</button>
      </form>
      <Lista perfis={lista} />
    </div>
  );
}
