import { notFound } from 'next/navigation';
import { supa } from '@/lib/supabase';
import { Form } from '../../Form';

export default async function Editar({ params }: { params: { id: string } }) {
  const s = supa();
  const [{ data: p }, { data: cats }, { data: cids }] = await Promise.all([
    s.from('profissionais').select('*, cidades(nome), profissional_categorias(categoria_id)').eq('id', Number(params.id)).maybeSingle(),
    s.from('categorias').select('id,nome').order('ordem'),
    s.from('cidades').select('nome,uf').order('nome'),
  ]);
  if (!p) notFound();
  const perfil = { ...p, cidade: p.cidades?.nome || '', categorias: (p.profissional_categorias || []).map((c: { categoria_id: number }) => c.categoria_id) };
  return <div className="grid gap-4"><h1 className="font-display uppercase text-4xl">Editar: {p.nome}</h1><Form p={perfil} categorias={cats || []} cidades={cids || []} /></div>;
}
