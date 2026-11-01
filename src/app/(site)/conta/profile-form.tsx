"use client";

import { useActionState } from "react";
import type { GuestAccount } from "@/db/schema";
import { completeProfile, type ProfileState } from "./actions";

export function ProfileForm({ account, returnTo }: { account: GuestAccount; returnTo?: string }) {
  const [state, action, pending] = useActionState<ProfileState, FormData>(completeProfile, {});
  return (
    <form action={action} className="space-y-4" noValidate>
      {returnTo ? <input type="hidden" name="returnTo" value={returnTo} /> : null}
      <label>
        <span className="label">Nome completo</span>
        <input name="name" className={`field ${state.errors?.name ? "field-error" : ""}`} defaultValue={account.name ?? ""} required autoComplete="name" />
        {state.errors?.name ? <span className="help-error">{state.errors.name}</span> : null}
      </label>
      <label>
        <span className="label">WhatsApp (com DDD)</span>
        <input name="whatsapp" type="tel" className={`field ${state.errors?.whatsapp ? "field-error" : ""}`} defaultValue={account.whatsapp ?? ""} placeholder="(84) 99999-9999" required autoComplete="tel" />
        {state.errors?.whatsapp ? <span className="help-error">{state.errors.whatsapp}</span> : null}
      </label>
      <button className="btn-primary w-full" disabled={pending}>{pending ? "Salvando…" : "Salvar e continuar"}</button>
    </form>
  );
}
