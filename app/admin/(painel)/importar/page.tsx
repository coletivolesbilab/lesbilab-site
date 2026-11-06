import { supa } from '@/lib/supabase';
import { Importador } from './Importador';

export default async function Importar() {
  const { data } = await supa().from('categorias').select('nome').order('ordem');
  return (
    <div className="grid gap-4">
      <h1 className="font-display uppercase text-4xl">Importar planilha</h1>
      <p className="max-w-prose text-sm">Envie o .xlsx ou .csv do formulário. O sistema reconhece as colunas, separa cidade e estado, encaixa as categorias e marca duplicadas. Nada é inventado: o que não for reconhecido fica marcado para revisão. A coluna “Insta pessoal” é ignorada.</p>
      <Importador categorias={(data || []).map((c) => c.nome)} />
    </div>
  );
}
