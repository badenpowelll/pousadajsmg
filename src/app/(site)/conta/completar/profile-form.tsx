"use client";

import { useActionState } from "react";
import { completeProfile, type ProfileState } from "../actions";

export function ProfileForm({ name, phone, next }: { name: string; phone: string; next?: string }) {
  const [state, action, pending] = useActionState<ProfileState, FormData>(completeProfile, {});
  return (
    <form action={action} className="space-y-4" noValidate>
      {next ? <input type="hidden" name="next" value={next} /> : null}
      <label>
        <span className="label">Nome completo</span>
        <input name="name" className={`field ${state.errors?.name ? "field-error" : ""}`} defaultValue={name} required autoComplete="name" />
        {state.errors?.name ? <span className="help-error">{state.errors.name}</span> : null}
      </label>
      <label>
        <span className="label">WhatsApp</span>
        <input name="phone" type="tel" className={`field ${state.errors?.phone ? "field-error" : ""}`} defaultValue={phone} required autoComplete="tel" placeholder="(84) 99999-9999" />
        {state.errors?.phone ? <span className="help-error">{state.errors.phone}</span> : null}
      </label>
      <button className="btn-primary w-full" disabled={pending}>{pending ? "Salvando…" : "Concluir cadastro"}</button>
    </form>
  );
}
