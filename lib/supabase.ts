import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export function supa() {
  const store = cookies();
  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (list) => { try { list.forEach(({ name, value, options }) => store.set(name, value, options)); } catch {} },
    },
  });
}

export async function exigeAdmin() {
  const s = supa();
  const { data: { user } } = await s.auth.getUser();
  if (!user) throw new Error('Sessão expirada. Entre de novo.');
  const { data } = await s.from('admins').select('user_id').eq('user_id', user.id).maybeSingle();
  if (!data) throw new Error('Sua conta não tem acesso ao painel.');
  return s;
}
