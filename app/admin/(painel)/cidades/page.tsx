import { supa } from '@/lib/supabase';
import { UFS } from '@/lib/util';
import { salvarCidade } from '../../actions';

export default async function Cidades({ searchParams }: { searchParams: { uf?: string } }) {
  const s = supa();
  let q = s.from('cidades').select('id,nome,uf').order('uf').order('nome');
  if (searchParams.uf) q = q.eq('uf', searchParams.uf);
  const [{ data }, { data: uso }] = await Promise.all([q, s.from('profissionais').select('cidade_id')]);
  const conta = (id: number) => (uso || []).filter((u) => u.cidade_id === id).length;
  return (
    <div className="grid gap-4 max-w-3xl">
      <h1 className="font-display uppercase text-4xl">Cidades</h1>
      <p className="text-sm">Os 27 estados são fixos. Cidades novas entram sozinhas no cadastro e na importação. Aqui dá para corrigir nomes e juntar cidades repetidas (ex.: “Sao Paulo” com “São Paulo”).</p>
      <form className="flex gap-2"><select className="campo max-w-xs" name="uf" defaultValue={searchParams.uf}><option value="">Todos os estados</option>{Object.entries(UFS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select><button className="btn !text-base !py-2">Filtrar</button></form>
      <form action={salvarCidade} className="flex flex-wrap gap-2"><input className="campo max-w-xs" name="nome" placeholder="Nova cidade" required /><select className="campo max-w-[90px]" name="uf" required>{Object.keys(UFS).map((u) => <option key={u}>{u}</option>)}</select><button className="btn !text-base !py-2">Adicionar</button></form>
      <ul className="grid gap-2">
        {data?.map((c) => (
          <li key={c.id}><form action={salvarCidade} className="flex flex-wrap items-center gap-2 border-b border-roxo/15 pb-2">
            <input type="hidden" name="id" value={c.id} />
            <input className="campo flex-1 min-w-40" name="nome" defaultValue={c.nome} aria-label="Nome da cidade" />
            <span className="text-xs font-semibold uppercase tracking-[0.06em] w-6">{c.uf}</span>
            <span className="text-xs w-16">{conta(c.id)} perfis</span>
            <button className="border-2 border-roxo px-2 py-1 text-sm">Renomear</button>
            <select name="destino" className="border border-roxo/40 text-sm py-1 max-w-[160px]" aria-label="Juntar com"><option value="">juntar com…</option>{data.filter((d) => d.uf === c.uf && d.id !== c.id).map((d) => <option key={d.id} value={d.id}>{d.nome}</option>)}</select>
            <button name="acao" value="juntar" className="border-2 border-roxo px-2 py-1 text-sm">Juntar</button>
            <button name="acao" value="excluir" disabled={conta(c.id) > 0} className="border-2 border-magenta text-magenta px-2 py-1 text-sm disabled:opacity-30">Excluir</button>
          </form></li>
        ))}
      </ul>
    </div>
  );
}
