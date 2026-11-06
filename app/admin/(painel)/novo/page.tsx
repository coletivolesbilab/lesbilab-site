import { supa } from '@/lib/supabase';
import { Form } from '../Form';

export default async function Novo() {
  const s = supa();
  const [{ data: cats }, { data: cids }] = await Promise.all([s.from('categorias').select('id,nome').order('ordem'), s.from('cidades').select('nome,uf').order('nome')]);
  return <div className="grid gap-4"><h1 className="font-display uppercase text-4xl">Nova profissional</h1><Form p={{}} categorias={cats || []} cidades={cids || []} /></div>;
}
