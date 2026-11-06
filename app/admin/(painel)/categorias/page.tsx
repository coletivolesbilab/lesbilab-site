import { supa } from '@/lib/supabase';
import { salvarCategoria } from '../../actions';

export default async function Categorias() {
  const s = supa();
  const [{ data }, { data: uso }] = await Promise.all([s.from('categorias').select('id,nome').order('ordem'), s.from('profissional_categorias').select('categoria_id')]);
  const conta = (id: number) => (uso || []).filter((u) => u.categoria_id === id).length;
  return (
    <div className="grid gap-4 max-w-2xl">
      <h1 className="font-display uppercase text-3xl leading-[1.2]">Categorias</h1>
      <form action={salvarCategoria} className="flex gap-2"><input className="campo" name="nome" placeholder="Nova categoria" required /><button className="btn !text-base !py-2">Adicionar</button></form>
      <ul className="grid gap-2">
        {data?.map((c) => (
          <li key={c.id}><form action={salvarCategoria} className="flex flex-wrap items-center gap-2">
            <input type="hidden" name="id" value={c.id} />
            <input className="campo flex-1" name="nome" defaultValue={c.nome} aria-label="Nome da categoria" />
            <span className="text-xs w-20">{conta(c.id)} perfis</span>
            <button className="border-2 border-roxo px-2 py-1 text-sm">Renomear</button>
            <button name="acao" value="excluir" disabled={conta(c.id) > 0} title={conta(c.id) ? 'Tire as profissionais desta categoria antes de excluir' : ''} className="border-2 border-magenta text-magenta px-2 py-1 text-sm disabled:opacity-30">Excluir</button>
          </form></li>
        ))}
      </ul>
    </div>
  );
}
