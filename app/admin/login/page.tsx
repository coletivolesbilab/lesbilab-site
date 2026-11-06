'use client';
import { useFormState, useFormStatus } from 'react-dom';
import { entrar } from '../actions';

function Botao() { const { pending } = useFormStatus(); return <button className="btn" disabled={pending}>{pending ? 'Entrando…' : 'Entrar'}</button>; }

export default function Login() {
  const [erro, acao] = useFormState(entrar, null);
  return (
    <div className="wrap max-w-sm py-16">
      <form action={acao} className="grid gap-4 border-2 border-roxo bg-white p-6">
        <h1 className="font-display uppercase text-3xl">Painel da equipe</h1>
        <label className="rotulo">E-mail<input className="campo" name="email" type="email" required autoComplete="username" /></label>
        <label className="rotulo">Senha<input className="campo" name="senha" type="password" required autoComplete="current-password" /></label>
        {erro && <p className="text-sm bg-amarelo p-2" role="alert">{erro}</p>}
        <Botao />
      </form>
    </div>
  );
}
