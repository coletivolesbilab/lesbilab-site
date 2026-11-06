// Lê planilha do formulário e normaliza. Roda no navegador do painel.
import { UFS, norm, digitos, igHandle } from './util';

const POR_NOME = Object.fromEntries(Object.entries(UFS).map(([u, n]) => [norm(n), u]));
const CAPITAIS: Record<string, string> = { 'sao paulo':'SP','porto alegre':'RS','rio de janeiro':'RJ',brasilia:'DF','belo horizonte':'MG',curitiba:'PR',florianopolis:'SC',salvador:'BA',recife:'PE',fortaleza:'CE',goiania:'GO',manaus:'AM',belem:'PA','sao luis':'MA',teresina:'PI',natal:'RN','joao pessoa':'PB',maceio:'AL',aracaju:'SE',cuiaba:'MT','campo grande':'MS',vitoria:'ES',palmas:'TO','porto velho':'RO','rio branco':'AC',macapa:'AP','boa vista':'RR' };

export type Linha = {
  linha: number; nome: string; profissao: string; descricao: string; cidade: string; uf: string;
  local_original: string; categorias: string[]; categoria_original: string; telefone: string;
  instagram: string; site: string; sexualidade: string; revisar: string[]; duplicada: string; incluir: boolean;
};

const capitaliza = (s: string) => (s === s.toLowerCase() || s === s.toUpperCase())
  ? s.toLowerCase().replace(/(^|\s)(\p{L})/gu, (m) => m.toUpperCase()).replace(/\b(De|Da|Do|Dos|Das)\b/g, (m) => m.toLowerCase())
  : s;

export function lerLocal(v: string): { cidade: string; uf: string } {
  const s = (v || '').trim();
  const partes = s.split(/[\/,\-–()]|\s{2,}/).map((p) => p.trim()).filter(Boolean);
  let uf = ''; const cid: string[] = [];
  for (const p of partes) {
    const k = norm(p);
    if (k.length === 2 && UFS[k.toUpperCase()]) uf = k.toUpperCase();
    else if (POR_NOME[k] && !uf) { uf = POR_NOME[k]; if (k === 'sao paulo' || k === 'rio de janeiro') cid.push(p); }
    else if (POR_NOME[k] && uf === POR_NOME[k]) cid.push(p);
    else cid.push(p);
  }
  if (!uf) {
    const m = s.match(/^(.+?)\s+([A-Za-z]{2})$/);
    if (m && UFS[m[2].toUpperCase()]) { uf = m[2].toUpperCase(); cid.splice(0, cid.length, m[1]); }
    else for (const [n, u] of Object.entries(POR_NOME)) if (norm(s).endsWith(' ' + n)) { uf = u; cid.splice(0, cid.length, s.slice(0, s.length - n.length).trim()); break; }
  }
  let cidade = cid[0] || '';
  if (!uf && CAPITAIS[norm(cidade)]) uf = CAPITAIS[norm(cidade)];
  if (!cidade && (uf === 'SP' || uf === 'RJ') && partes.some((p) => norm(p) === norm(UFS[uf]))) cidade = UFS[uf];
  return { cidade: capitaliza(cidade.trim()), uf };
}

// Divide "A (x, y), B" sem quebrar dentro de parênteses.
const dividir = (v: string) => v.split(/,\s*(?![^()]*\))|;/).map((p) => p.replace(/\(.*?\)/g, '').trim()).filter((p) => p && p !== '-');

export function lerCategorias(v: string, lista: string[]) {
  const ok: string[] = []; const outros: string[] = [];
  for (const p of dividir(v || '')) {
    const k = norm(p).replace(/ e /g, ' & ');
    const hit = lista.find((c) => { const kc = norm(c); return kc === k || (k.length > 4 && kc.startsWith(k)); });
    if (hit) ok.push(hit); else outros.push(p);
  }
  if (outros.length && !ok.includes('Outros')) ok.push('Outros');
  return { categorias: [...new Set(ok)], categoria_original: outros.join(', ') };
}

const COLS: Record<string, (h: string) => boolean> = {
  nome: (h) => h.includes('nome'),
  local: (h) => h.includes('cidade') || h.includes('estado'),
  profissao: (h) => !h.includes('insta') && (h.includes('profiss') || h.includes('o que tu faz') || h.includes('o que voce faz')),
  categoria: (h) => h === 'tipo' || h.includes('categoria') || h.includes('area'),
  instagram: (h) => h.includes('insta') && !h.includes('pessoal'),
  telefone: (h) => h.includes('telefone') || h.includes('whats') || h.includes('celular'),
  sexualidade: (h) => h.includes('sexualidade') || h.includes('orientacao'),
  descricao: (h) => h.includes('descri') || h.includes('servico'),
  site: (h) => h.includes('site') || h.includes('portf'),
};

export function mapearColunas(cabecalho: string[]) {
  const m: Record<string, string> = {};
  for (const [campo, teste] of Object.entries(COLS)) {
    const h = cabecalho.find((c) => teste(norm(c)) && !Object.values(m).includes(c));
    if (h) m[campo] = h;
  }
  return m;
}

export function normalizar(rows: Record<string, unknown>[], mapa: Record<string, string>, categorias: string[]): Linha[] {
  const g = (r: Record<string, unknown>, k: string) => (mapa[k] && r[mapa[k]] != null ? String(r[mapa[k]]).trim() : '');
  const vistos = new Map<string, number>();
  return rows.map((r, i) => {
    const local = g(r, 'local'); const { cidade, uf } = lerLocal(local);
    const cat = lerCategorias(g(r, 'categoria'), categorias);
    const l: Linha = {
      linha: i + 2, nome: g(r, 'nome'), profissao: g(r, 'profissao'), descricao: g(r, 'descricao'), cidade, uf,
      local_original: local, ...cat, telefone: digitos(g(r, 'telefone')), instagram: igHandle(g(r, 'instagram')),
      site: g(r, 'site') || (/^https?:\/\//i.test(g(r, 'instagram')) && !igHandle(g(r, 'instagram')) ? g(r, 'instagram') : ''), sexualidade: g(r, 'sexualidade'), revisar: [], duplicada: '', incluir: true,
    };
    if (!l.nome) l.revisar.push('sem nome');
    if (!uf) l.revisar.push('estado não identificado');
    if (!cidade) l.revisar.push('cidade não identificada');
    if (cat.categoria_original) l.revisar.push('categoria fora da lista');
    for (const k of [norm(l.nome) && 'n:' + norm(l.nome), l.telefone && 't:' + l.telefone, l.instagram && 'i:' + l.instagram.toLowerCase()]) {
      if (!k) continue;
      if (vistos.has(k) && !l.duplicada) { l.duplicada = `igual à linha ${vistos.get(k)} da planilha`; l.incluir = false; }
      else vistos.set(k, l.linha);
    }
    return l;
  });
}
