"use client";

import { useActionState } from "react";
import { Notice } from "@/components/site/ui";
import { login } from "./actions";

export function LoginForm() {
  const [state, action, pending] = useActionState<{ message?: string }, FormData>(login, {});
  return (
    <form action={action} className="space-y-4">
      {state.message ? <Notice kind="error">{state.message}</Notice> : null}
      <label><span className="label">E-mail</span><input name="email" type="email" className="field" required autoComplete="username" /></label>
      <label><span className="label">Senha</span><input name="password" type="password" className="field" required autoComplete="current-password" /></label>
      <button className="btn-primary w-full" disabled={pending}>{pending ? "Entrando…" : "Entrar"}</button>
    </form>
  );
}
