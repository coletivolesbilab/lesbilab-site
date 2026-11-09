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

// Palavras-chave da profissão para sugerir categoria quando a resposta não bate com a lista.
const PALAVRAS: [string, RegExp][] = [
  ['Administração, Finanças & Negócios', /\b(administra\w*|adm|assistente administrativ\w*|aux\w* administrativ\w*|contab\w*|rh|recursos humanos|compradora|compras|comercio exterior|importacao|exportacao|financ\w*|relacionamento comercial)\b/],
  ['Arquitetura, Engenharia & Obras', /\b(arquitet\w*|urbanis\w*|engenheira civil|engenharia civil|interiores|obras?)\b/],
  ['Artes Visuais, Design & Artesanato', /\b(design\w*|grafic\w*|artes[aã]\w*|artesanato|biscuit|croch\w*|ilustra\w*)\b/],
  ['Ciências & Meio Ambiente', /\b(biolog\w*|quimic\w*|engenheira de alimentos|engenharia de alimentos|pesquisa cientifica|meio ambiente|fauna|flora)\b/],
  ['Comunicação & Conteúdo', /\b(publicit\w*|marketing|trafego|midia digital|social media|jornalis\w*)\b/],
  ['Direito & Jurídico', /\b(advoga\w*|advocacia|juridic\w*|direito|compliance|governanca)\b/],
  ['Educação & Facilitação', /\b(professora?|docente|libras|aulas?)\b/],
  ['Espiritualidade & Terapias Holísticas', /\b(tarot\w*|tarol\w*|cartoman\w*|magist\w*|esoteric\w*|espiritual\w*)\b/],
  ['Esporte & Atividade Física', /\b(educacao fisica|personal|esportes?|treinadora)\b/],
  ['Manutenção, Reparos & Serviços', /\b(marido de aluguel|manutencao|eletric\w*|hidraulic\w*|montagem de moveis|reparos|vistori\w*|entregas?|motogirl|motogril)\b/],
  ['Pets & Animais', /\b(pet sitter|pets?|adestra\w*|veterinari\w*|canin\w*)\b/],
  ['Saúde', /\b(medic[ao]|medicina|enfermeir\w*|dentista|odonto\w*|fisioterap\w*|terapeuta ocupacional|obstetriz|agente de saude|saude integr\w*|nutricionista)\b/],
  ['Saúde mental', /\b(psicolog\w*|psicanalis\w*)\b/],
  ['Serviço Social', /\b(assistente social|servico social)\b/],
  ['Política', /\b(parlamentar|militante)\b/],
];

export function lerCategorias(v: string, lista: string[], profissao = '') {
  const ok: string[] = []; const fora: string[] = [];
  for (const p of dividir(v || '')) {
    const k = norm(p).replace(/ e /g, ' & ');
    const hit = lista.find((c) => { const kc = norm(c); return kc === k || (k.length > 4 && kc.startsWith(k)); });
    if (hit) ok.push(hit); else fora.push(p);
  }
  if (fora.length || !ok.length) {
    const texto = norm(profissao + ' ' + fora.join(' '));
    for (const [cat, re] of PALAVRAS) if (lista.includes(cat) && re.test(texto)) ok.push(cat);
  }
  return { categorias: [...new Set(ok)], categoria_original: fora.join(', ') };
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
    const cat = lerCategorias(g(r, 'categoria'), categorias, g(r, 'profissao'));
    const l: Linha = {
      linha: i + 2, nome: g(r, 'nome'), profissao: g(r, 'profissao'), descricao: g(r, 'descricao'), cidade, uf,
      local_original: local, ...cat, telefone: digitos(g(r, 'telefone')), instagram: igHandle(g(r, 'instagram')),
      site: g(r, 'site') || (/^https?:\/\//i.test(g(r, 'instagram')) && !igHandle(g(r, 'instagram')) ? g(r, 'instagram') : ''), sexualidade: g(r, 'sexualidade'), revisar: [], duplicada: '', incluir: true,
    };
    if (!l.nome) l.revisar.push('sem nome');
    if (!uf) l.revisar.push('estado não identificado');
    if (!cidade) l.revisar.push('cidade não identificada');
    if (!cat.categorias.length) l.revisar.push('sem categoria');
    for (const k of [norm(l.nome) && 'n:' + norm(l.nome), l.telefone && 't:' + l.telefone, l.instagram && 'i:' + l.instagram.toLowerCase()]) {
      if (!k) continue;
      if (vistos.has(k) && !l.duplicada) { l.duplicada = `igual à linha ${vistos.get(k)} da planilha`; l.incluir = false; }
      else vistos.set(k, l.linha);
    }
    return l;
  });
}
