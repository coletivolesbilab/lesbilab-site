# LESBILAB · Site e Banco de Talentos

Next.js 14 + TypeScript + Tailwind + Supabase. Hospedagem na Vercel.

## Colocar no ar (uma vez)

1. **Supabase**: crie um projeto em supabase.com. Abra o *SQL Editor*, cole todo o `supabase/schema.sql` e rode.
2. **Contas da equipe**: em *Authentication → Users → Add user*, crie cada pessoa com e-mail e senha. Depois rode no SQL Editor:
   `insert into admins (user_id) select id from auth.users where email = 'email@da-equipe.com';`
   Em *Authentication → Sign In / Providers*, desative **Allow new users to sign up**. Assim ninguém de fora cria conta.
3. **Vercel**: suba esta pasta para um repositório no GitHub e importe o repositório na Vercel. Em *Environment Variables*, preencha:
   - `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`: ficam em Supabase → *Project Settings → API*
   - `NEXT_PUBLIC_FORMS_URL`: link do Google Forms
4. **Planilha**: acesse `/admin`, entre e vá em **Importar planilha**. Envie o .xlsx, revise e importe.

## Rodar no computador
`npm install`, depois `cp .env.example .env.local` (preencha as chaves) e `npm run dev`.

## Segurança e LGPD
- As tabelas têm RLS: o público só lê a view `perfis_publicos`, que mostra apenas perfis **publicados**. Contatos só aparecem com `autoriza_contato` marcado e a sexualidade só com `mostrar_sexualidade`.
- Só quem estiver na tabela `admins` edita qualquer coisa.
- A página `/privacidade` explica o uso dos dados e como pedir remoção.

## Fontes e logo oficiais
Coloque os arquivos `.woff2` em `public/fonts` e descomente os `@font-face` em `app/globals.css`. Para o logo, troque `components/Logo.tsx` por `<img src="/logo.svg">`.
