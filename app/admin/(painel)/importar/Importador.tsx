'use client';
import { useState } from 'react';
import * as XLSX from 'xlsx';
import { mapearColunas, normalizar, type Linha } from '@/lib/importar';
import { previaImport, importar } from '../../actions';

export function Importador({ categorias }: { categorias: string[] }) {
  const [linhas, setLinhas] = useState<Linha[]>([]);
  const [mapa, setMapa] = useState<Record<string, string>>({});
  const [msg, setMsg] = useState(''); const [ocupado, setOcupado] = useState(false);
  const [filtro, setFiltro] = useState<'todas' | 'revisar' | 'dup'>('todas');
  const [publicar, setPublicar] = useState(false);

  async function ler(f: File) {
    setOcupado(true); setMsg('');
    try {
      const wb = XLSX.read(await f.arrayBuffer(), { type: 'array', cellDates: true });
      const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(wb.Sheets[wb.SheetNames[0]], { defval: '' });
      const m = mapearColunas(Object.keys(rows[0] || {}));
      if (!m.nome) throw new Error('Não achei a coluna de nome. Confira o cabeçalho da planilha.');
      setMapa(m);
      setLinhas(await previaImport(normalizar(rows, m, categorias)));
    } catch (e) { setMsg((e as Error).message); }
    setOcupado(false);
  }
  async function enviar() {
    setOcupado(true);
    const r = await importar(linhas, publicar);
    setMsg(`${r.ok} perfis importados.${r.erros.length ? ' Erros: ' + r.erros.join(' | ') : ''}`);
    setLinhas([]); setOcupado(false);
  }
  const set = (i: number, patch: Partial<Linha>) => setLinhas((ls) => ls.map((l, j) => (j === i ? { ...l, ...patch } : l)));
  const vis = linhas.map((l, i) => [l, i] as const).filter(([l]) => filtro === 'todas' || (filtro === 'revisar' ? l.revisar.length : l.duplicada));
  const inc = linhas.filter((l) => l.incluir).length;

  return (
    <div className="grid gap-4">
      <input type="file" accept=".xlsx,.xls,.csv" disabled={ocupado} onChange={(e) => e.target.files?.[0] && ler(e.target.files[0])} className="campo max-w-md bg-white" />
      {msg && <p className="bg-amarelo p-2 text-sm" role="status">{msg}</p>}
      {ocupado && <p className="font-pixel text-xs">processando…</p>}
      {linhas.length > 0 && <>
        <p className="text-xs">Colunas reconhecidas: {Object.entries(mapa).map(([k, v]) => `${k} ← “${v}”`).join(' · ')}</p>
        <div className="flex flex-wrap gap-2 text-sm">
          {([['todas', `Todas ${linhas.length}`], ['revisar', `Precisam revisar ${linhas.filter((l) => l.revisar.length).length}`], ['dup', `Duplicadas ${linhas.filter((l) => l.duplicada).length}`]] as const).map(([k, t]) => (
            <button key={k} onClick={() => setFiltro(k)} className={`border-2 border-roxo rounded-full px-3 py-1 ${filtro === k ? 'bg-roxo text-papel' : ''}`}>{t}</button>
          ))}
        </div>
        <div className="overflow-x-auto border-2 border-roxo bg-white max-h-[60vh]">
          <table className="w-full min-w-[900px] text-sm">
            <thead className="bg-roxo text-papel font-pixel text-[10px] text-left sticky top-0"><tr><th className="p-2">INCLUIR</th><th className="p-2">NOME</th><th className="p-2">PLANILHA</th><th className="p-2">CIDADE</th><th className="p-2">UF</th><th className="p-2">CATEGORIAS</th><th className="p-2">AVISOS</th></tr></thead>
            <tbody>
              {vis.map(([l, i]) => (
                <tr key={l.linha} className={`border-t border-roxo/15 align-top ${l.incluir ? '' : 'opacity-50'}`}>
                  <td className="p-2"><input type="checkbox" checked={l.incluir} onChange={(e) => set(i, { incluir: e.target.checked })} aria-label={`Incluir ${l.nome}`} /></td>
                  <td className="p-2 font-semibold">{l.nome}<span className="block font-normal text-xs">{l.profissao}</span></td>
                  <td className="p-2 text-xs">{l.local_original}</td>
                  <td className="p-2"><input className="border border-roxo/40 px-1 w-36" value={l.cidade} onChange={(e) => set(i, { cidade: e.target.value })} /></td>
                  <td className="p-2"><input className="border border-roxo/40 px-1 w-12 uppercase" maxLength={2} value={l.uf} onChange={(e) => set(i, { uf: e.target.value.toUpperCase() })} /></td>
                  <td className="p-2 text-xs">{l.categorias.join(', ')}{l.categoria_original && <span className="block text-magenta">original: {l.categoria_original}</span>}</td>
                  <td className="p-2 text-xs">{l.duplicada && <span className="block bg-magenta text-papel px-1">{l.duplicada}</span>}{l.revisar.join(', ')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex flex-wrap items-center gap-4 border-2 border-roxo bg-white p-4">
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={publicar} onChange={(e) => setPublicar(e.target.checked)} />Publicar direto as que não precisam de revisão (as outras entram como rascunho)</label>
          <button className="btn" disabled={ocupado || !inc} onClick={enviar}>Importar {inc} perfis</button>
        </div>
      </>}
    </div>
  );
}
