export const UFS: Record<string, string> = {AC:'Acre',AL:'Alagoas',AP:'Amapá',AM:'Amazonas',BA:'Bahia',CE:'Ceará',DF:'Distrito Federal',ES:'Espírito Santo',GO:'Goiás',MA:'Maranhão',MT:'Mato Grosso',MS:'Mato Grosso do Sul',MG:'Minas Gerais',PA:'Pará',PB:'Paraíba',PR:'Paraná',PE:'Pernambuco',PI:'Piauí',RJ:'Rio de Janeiro',RN:'Rio Grande do Norte',RS:'Rio Grande do Sul',RO:'Rondônia',RR:'Roraima',SC:'Santa Catarina',SP:'São Paulo',SE:'Sergipe',TO:'Tocantins'};
export const norm = (s: string) => (s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
export const slugify = (s: string) => norm(s).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
export const digitos = (s?: string | null) => (s || '').replace(/\D/g, '');
export function waLink(tel?: string | null) {
  let d = digitos(tel);
  if (!d) return null;
  if (d.length <= 11) d = '55' + d.replace(/^0/, '');
  return `https://wa.me/${d}`;
}
export function igHandle(s?: string | null) {
  const v = (s || '').trim();
  const m = v.match(/instagram\.com\/([^/?#\s]+)/i);
  const h = (m ? m[1] : v).replace(/^@/, '').split(/[\s,/]/)[0];
  if (/:\/\//.test(v) && !m) return '';
  return /^[a-z0-9._]{2,30}$/i.test(h) && !/^(n|nao|não|nada|ainda|nenhum|sem|tenho)$/i.test(h) ? h : '';
}
export function urlSegura(s?: string | null) {
  const v = (s || '').trim();
  if (!v) return null;
  const u = /^https?:\/\//i.test(v) ? v : `https://${v}`;
  try { const p = new URL(u); return p.protocol === 'https:' || p.protocol === 'http:' ? p.toString() : null; } catch { return null; }
}
export function foneFmt(s?: string | null) {
  const d = digitos(s).replace(/^55(?=\d{10,11}$)/, '');
  if (d.length === 11) return `(${d.slice(0,2)}) ${d.slice(2,7)}-${d.slice(7)}`;
  if (d.length === 10) return `(${d.slice(0,2)}) ${d.slice(2,6)}-${d.slice(6)}`;
  return s || '';
}
