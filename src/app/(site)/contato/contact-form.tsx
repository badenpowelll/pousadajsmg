"use client";

import { useActionState } from "react";
import { Notice } from "@/components/site/ui";
import { sendContact, type ContactState } from "./actions";

export function ContactForm() {
  const [state, action, pending] = useActionState<ContactState, FormData>(sendContact, { ok: false });
  if (state.ok) return <Notice kind="success">{state.message}</Notice>;
  return (
    <form action={action} className="space-y-4" noValidate>
      {state.message ? <Notice kind="error">{state.message}</Notice> : null}
      <div className="grid gap-4 sm:grid-cols-2">
        <label>
          <span className="label">Nome</span>
          <input name="name" className={`field ${state.errors?.name ? "field-error" : ""}`} required autoComplete="name" />
          {state.errors?.name ? <span className="help-error">{state.errors.name}</span> : null}
        </label>
        <label>
          <span className="label">E-mail</span>
          <input name="email" type="email" className={`field ${state.errors?.email ? "field-error" : ""}`} required autoComplete="email" />
          {state.errors?.email ? <span className="help-error">{state.errors.email}</span> : null}
        </label>
      </div>
      <label>
        <span className="label">Telefone (opcional)</span>
        <input name="phone" type="tel" className="field" autoComplete="tel" />
      </label>
      <label>
        <span className="label">Mensagem</span>
        <textarea name="message" rows={5} className={`field ${state.errors?.message ? "field-error" : ""}`} required />
        {state.errors?.message ? <span className="help-error">{state.errors.message}</span> : null}
      </label>
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
      <button type="submit" className="btn-primary" disabled={pending}>{pending ? "Enviando…" : "Enviar mensagem"}</button>
    </form>
  );
}
