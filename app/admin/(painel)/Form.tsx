'use client';
import { useEffect, useState } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { salvarPerfil } from '../actions';
import { UFS } from '@/lib/util';

export type Perfil = { id?: number; nome?: string; profissao?: string; descricao?: string | null; uf?: string | null; cidade?: string; telefone?: string | null; instagram?: string | null; outras_redes?: string | null; site?: string | null; sexualidade?: string | null; mostrar_sexualidade?: boolean; autoriza_contato?: boolean; destaque?: boolean; status?: string; revisar?: boolean; categoria_original?: string | null; local_original?: string | null; categorias?: number[] };

function Salvar() { const { pending } = useFormStatus(); return <button className="btn" disabled={pending}>{pending ? 'Salvando…' : 'Salvar'}</button>; }

export function Form({ p, categorias, cidades }: { p: Perfil; categorias: { id: number; nome: string }[]; cidades: { nome: string; uf: string }[] }) {
  const [erro, acao] = useFormState(salvarPerfil, null);
  // Lista todos os municípios do estado escolhido (lista do IBGE em /public/municipios.json), além das cidades já cadastradas.
  const [uf, setUf] = useState(p.uf || '');
  const [municipios, setMunicipios] = useState<string[]>([]);
  useEffect(() => {
    setMunicipios([]);
    if (!uf) return;
    let vivo = true;
    fetch('/municipios.json')
      .then((r) => r.json())
      .then((t: Record<string, string[]>) => { if (vivo) setMunicipios(t[uf] || []); })
      .catch(() => {});
    return () => { vivo = false; };
  }, [uf]);
  const opcoes = municipios.length ? [...new Set([...municipios, ...cidades.filter((c) => c.uf === uf).map((c) => c.nome), ...(p.cidade && uf === p.uf ? [p.cidade] : [])])].sort((a, b) => a.localeCompare(b)) : [];
  const ck = (n: string, l: string, v?: boolean) => <label className="flex items-center gap-2 text-sm"><input type="checkbox" name={n} defaultChecked={v} />{l}</label>;
  return (
    <form action={acao} className="grid gap-5 max-w-3xl">
      {p.id && <input type="hidden" name="id" value={p.id} />}
      {p.revisar && <p className="bg-amarelo p-3 text-sm">Revisar: na planilha o local era <b>{p.local_original || '—'}</b>{p.categoria_original && <> e a categoria era <b>{p.categoria_original}</b></>}. Ajuste e desmarque “precisa revisar”.</p>}
      <div className="grid gap-3 md:grid-cols-2">
        <label className="rotulo">Nome profissional *<input className="campo" name="nome" defaultValue={p.nome} required /></label>
        <label className="rotulo">Profissão / função<input className="campo" name="profissao" defaultValue={p.profissao} /></label>
        <label className="rotulo">Estado<select className="campo" name="uf" value={uf} onChange={(e) => setUf(e.target.value)}><option value="">—</option>{Object.entries(UFS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></label>
        <label className="rotulo">Cidade
          {opcoes.length ? (
            <select className="campo" name="cidade" defaultValue={p.cidade || ''} key={uf}>
              <option value="">Escolha a cidade</option>
              {opcoes.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          ) : (
            <input className="campo" name="cidade" defaultValue={p.cidade} autoComplete="off" placeholder={uf ? 'Carregando cidades…' : 'Escolha o estado primeiro'} />
          )}
        </label>
      </div>
      <label className="rotulo">Descrição dos serviços<textarea className="campo min-h-28" name="descricao" defaultValue={p.descricao || ''} /></label>
      <fieldset className="grid gap-2"><legend className="rotulo mb-1">Categorias</legend>
        <div className="grid gap-1 sm:grid-cols-2 md:grid-cols-3">{categorias.map((c) => <label key={c.id} className="flex items-center gap-2 text-sm"><input type="checkbox" name="categorias" value={c.id} defaultChecked={p.categorias?.includes(c.id)} />{c.nome}</label>)}</div>
        <input type="hidden" name="categoria_original" defaultValue={p.categoria_original || ''} />
      </fieldset>
      <div className="grid gap-3 md:grid-cols-2">
        <label className="rotulo">WhatsApp / telefone<input className="campo" name="telefone" defaultValue={p.telefone || ''} inputMode="tel" /></label>
        <label className="rotulo">Instagram profissional<input className="campo" name="instagram" defaultValue={p.instagram || ''} placeholder="@perfil" /></label>
        <label className="rotulo">LinkedIn ou site<input className="campo" name="site" defaultValue={p.site || ''} placeholder="linkedin.com/in/... ou site.com.br" /></label>
        <label className="rotulo">Sexualidade (como a profissional informou)<input className="campo" name="sexualidade" defaultValue={p.sexualidade || ''} /></label>
      </div>
      <label className="rotulo">Outras redes (um link por linha)<textarea className="campo min-h-20" name="outras_redes" defaultValue={p.outras_redes || ''} /></label>
      <div className="grid gap-2 border-2 border-roxo p-4 bg-white">
        {ck('autoriza_contato', 'Profissional autorizou mostrar contatos e redes', p.autoriza_contato ?? true)}
        {ck('mostrar_sexualidade', 'Mostrar sexualidade no perfil', p.mostrar_sexualidade ?? true)}
        {ck('destaque', 'Destacar no Banco de Talentos', p.destaque)}
        {ck('revisar', 'Precisa revisar', p.revisar)}
        <label className="rotulo max-w-xs mt-2">Status<select className="campo" name="status" defaultValue={p.status || 'rascunho'}><option value="rascunho">Rascunho</option><option value="publicado">Publicado</option><option value="suspenso">Suspenso</option></select></label>
      </div>
      {erro && <p className="bg-magenta text-papel p-2 text-sm" role="alert">{erro}</p>}
      <div><Salvar /></div>
    </form>
  );
}
