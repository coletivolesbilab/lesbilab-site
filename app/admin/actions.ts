'use server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import type { SupabaseClient } from '@supabase/supabase-js';
import { supa, exigeAdmin } from '@/lib/supabase';
import { slugify, digitos, igHandle, norm, UFS } from '@/lib/util';
import type { Linha } from '@/lib/importar';

const txt = (f: FormData, k: string) => String(f.get(k) ?? '').trim();
const atualiza = () => { revalidatePath('/admin', 'layout'); revalidatePath('/talentos', 'layout'); };

export async function entrar(_: unknown, f: FormData) {
  const { error } = await supa().auth.signInWithPassword({ email: txt(f, 'email'), password: txt(f, 'senha') });
  if (error) return 'E-mail ou senha incorretos.';
  redirect('/admin');
}
export async function sair() { await supa().auth.signOut(); redirect('/admin/login'); }

async function cidadeId(s: SupabaseClient, uf: string, nome: string) {
  if (!UFS[uf] || !nome) return null;
  const slug = slugify(nome);
  const { data: ex } = await s.from('cidades').select('id').eq('uf', uf).eq('slug', slug).maybeSingle();
  if (ex) return ex.id as number;
  const { data, error } = await s.from('cidades').insert({ uf, nome, slug }).select('id').single();
  if (error) throw new Error(error.message);
  return data.id as number;
}

async function slugLivre(s: SupabaseClient, nome: string, id?: number) {
  const base = slugify(nome) || 'perfil';
  const { data } = await s.from('profissionais').select('id,slug').like('slug', `${base}%`);
  const usados = new Set((data || []).filter((r) => r.id !== id).map((r) => r.slug));
  let slug = base, n = 2;
  while (usados.has(slug)) slug = `${base}-${n++}`;
  return slug;
}

export async function salvarPerfil(_: unknown, f: FormData) {
  try {
    const s = await exigeAdmin();
    const id = Number(f.get('id')) || undefined;
    const nome = txt(f, 'nome');
    if (!nome) return 'Preencha o nome profissional.';
    const uf = txt(f, 'uf');
    const dados = {
      nome, profissao: txt(f, 'profissao'), descricao: txt(f, 'descricao') || null, uf: UFS[uf] ? uf : null,
      cidade_id: await cidadeId(s, uf, txt(f, 'cidade')),
      telefone: digitos(txt(f, 'telefone')) || null, instagram: igHandle(txt(f, 'instagram')) || null,
      outras_redes: txt(f, 'outras_redes') || null, site: txt(f, 'site') || null,
      sexualidade: txt(f, 'sexualidade') || null, mostrar_sexualidade: f.get('mostrar_sexualidade') === 'on',
      autoriza_contato: f.get('autoriza_contato') === 'on', destaque: f.get('destaque') === 'on',
      status: txt(f, 'status') || 'rascunho', revisar: f.get('revisar') === 'on',
      categoria_original: txt(f, 'categoria_original') || null, atualizado_em: new Date().toISOString(),
    };
    let pid = id;
    if (id) {
      const { error } = await s.from('profissionais').update(dados).eq('id', id);
      if (error) return error.message;
    } else {
      const { data, error } = await s.from('profissionais').insert({ ...dados, slug: await slugLivre(s, nome) }).select('id').single();
      if (error) return error.message;
      pid = data.id;
    }
    const cats = f.getAll('categorias').map(Number).filter(Boolean);
    await s.from('profissional_categorias').delete().eq('profissional_id', pid!);
    if (cats.length) await s.from('profissional_categorias').insert(cats.map((c) => ({ profissional_id: pid, categoria_id: c })));
    atualiza();
  } catch (e) { return (e as Error).message; }
  redirect('/admin?ok=salvo');
}

const ACOES: Record<string, Record<string, unknown>> = {
  publicar: { status: 'publicado', revisar: false }, suspender: { status: 'suspenso' }, rascunho: { status: 'rascunho' },
  destacar: { destaque: true }, 'tirar-destaque': { destaque: false },
};

export async function acaoPerfis(f: FormData) {
  const s = await exigeAdmin();
  const ids = f.getAll('ids').map(Number).filter(Boolean);
  const acao = txt(f, 'acao');
  if (!ids.length) return;
  if (acao === 'excluir') await s.from('profissionais').delete().in('id', ids);
  else if (ACOES[acao]) await s.from('profissionais').update({ ...ACOES[acao], atualizado_em: new Date().toISOString() }).in('id', ids);
  atualiza();
}

export async function previaImport(linhas: Linha[]) {
  const s = await exigeAdmin();
  const { data } = await s.from('profissionais').select('id,nome,telefone,instagram');
  const idx = new Map<string, string>();
  for (const p of data || []) {
    if (p.nome) idx.set('n:' + norm(p.nome), p.nome);
    if (p.telefone) idx.set('t:' + p.telefone, p.nome);
    if (p.instagram) idx.set('i:' + p.instagram.toLowerCase(), p.nome);
  }
  return linhas.map((l) => {
    const hit = [l.nome && 'n:' + norm(l.nome), l.telefone && 't:' + l.telefone, l.instagram && 'i:' + l.instagram.toLowerCase()]
      .map((k) => k && idx.get(k)).find(Boolean);
    return hit && !l.duplicada ? { ...l, duplicada: `já cadastrada: ${hit}`, incluir: false } : l;
  });
}

export async function importar(linhas: Linha[], publicarProntas: boolean) {
  const s = await exigeAdmin();
  const { data: cats } = await s.from('categorias').select('id,nome');
  const catId = new Map((cats || []).map((c) => [c.nome, c.id as number]));
  let ok = 0; const erros: string[] = [];
  for (const l of linhas.filter((x) => x.incluir && x.nome)) {
    try {
      // Falta de cidade/estado não impede publicar; a profissional fica marcada para revisão.
      const pronta = l.revisar.every((r) => r.includes('estado') || r.includes('cidade'));
      const { data, error } = await s.from('profissionais').insert({
        slug: await slugLivre(s, l.nome), nome: l.nome, profissao: l.profissao, descricao: l.descricao || null,
        uf: UFS[l.uf] ? l.uf : null, cidade_id: await cidadeId(s, l.uf, l.cidade), telefone: l.telefone || null,
        instagram: l.instagram || null, site: l.site || null, sexualidade: l.sexualidade || null,
        local_original: l.local_original, categoria_original: l.categoria_original || null, revisar: l.revisar.length > 0,
        status: publicarProntas && pronta ? 'publicado' : 'rascunho', origem: 'planilha',
      }).select('id').single();
      if (error) throw error;
      const ids = l.categorias.map((c) => catId.get(c)).filter(Boolean);
      if (ids.length) await s.from('profissional_categorias').insert(ids.map((c) => ({ profissional_id: data.id, categoria_id: c })));
      ok++;
    } catch (e) { erros.push(`Linha ${l.linha} (${l.nome}): ${(e as Error).message}`); }
  }
  atualiza();
  return { ok, erros };
}

export async function salvarCategoria(f: FormData) {
  const s = await exigeAdmin();
  const id = Number(f.get('id')); const nome = txt(f, 'nome');
  if (txt(f, 'acao') === 'excluir' && id) await s.from('categorias').delete().eq('id', id);
  else if (nome && id) await s.from('categorias').update({ nome, slug: slugify(nome) }).eq('id', id);
  else if (nome) await s.from('categorias').insert({ nome, slug: slugify(nome), ordem: 50 });
  atualiza();
}

export async function salvarCidade(f: FormData) {
  const s = await exigeAdmin();
  const id = Number(f.get('id')); const nome = txt(f, 'nome'); const uf = txt(f, 'uf');
  if (txt(f, 'acao') === 'excluir' && id) await s.from('cidades').delete().eq('id', id);
  else if (txt(f, 'acao') === 'juntar' && id) {
    const destino = Number(f.get('destino'));
    if (destino && destino !== id) {
      await s.from('profissionais').update({ cidade_id: destino }).eq('cidade_id', id);
      await s.from('cidades').delete().eq('id', id);
    }
  } else if (nome && id) await s.from('cidades').update({ nome, slug: slugify(nome), ...(UFS[uf] ? { uf } : {}) }).eq('id', id);
  else if (nome && UFS[uf]) await cidadeId(s, uf, nome);
  atualiza();
}
