"use client";

import { useActionState, useMemo } from "react";
import { Notice } from "@/components/site/ui";
import { submitReservation, type ReserveState } from "./actions";

export function ReserveForm(props: { accommodationTypeId: string; checkIn: string; checkOut: string; guests: number }) {
  const [state, action, pending] = useActionState<ReserveState, FormData>(submitReservation, {});
  // Chave de idempotência gerada uma vez por montagem do formulário: reenvio não duplica a reserva.
  const idempotencyKey = useMemo(() => `web-${crypto.randomUUID()}`, []);
  const err = (k: string) => state.errors?.[k];
  return (
    <form action={action} className="space-y-4" noValidate>
      <input type="hidden" name="accommodationTypeId" value={props.accommodationTypeId} />
      <input type="hidden" name="checkIn" value={props.checkIn} />
      <input type="hidden" name="checkOut" value={props.checkOut} />
      <input type="hidden" name="guests" value={props.guests} />
      <input type="hidden" name="idempotencyKey" value={idempotencyKey} />
      {state.message ? <Notice kind="error">{state.message}</Notice> : null}
      <label>
        <span className="label">Nome completo</span>
        <input name="fullName" className={`field ${err("fullName") ? "field-error" : ""}`} required autoComplete="name" />
        {err("fullName") ? <span className="help-error">{err("fullName")}</span> : null}
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label>
          <span className="label">E-mail</span>
          <input name="email" type="email" className={`field ${err("email") ? "field-error" : ""}`} required autoComplete="email" />
          {err("email") ? <span className="help-error">{err("email")}</span> : null}
        </label>
        <label>
          <span className="label">Telefone / WhatsApp</span>
          <input name="phone" type="tel" className={`field ${err("phone") ? "field-error" : ""}`} required autoComplete="tel" placeholder="(84) 99999-9999" />
          {err("phone") ? <span className="help-error">{err("phone")}</span> : null}
        </label>
      </div>
      <label>
        <span className="label">CPF ou passaporte (opcional)</span>
        <input name="document" className="field" />
      </label>
      <label>
        <span className="label">Observações (opcional)</span>
        <textarea name="notes" rows={3} className="field" placeholder="Horário previsto de chegada, pedidos especiais…" />
      </label>
      <label className="flex items-start gap-2 text-sm text-graphite">
        <input type="checkbox" name="accept" className="mt-1" />
        <span>Li e aceito as <a href="/politicas" target="_blank" className="underline">políticas de hospedagem</a> e a <a href="/privacidade" target="_blank" className="underline">política de privacidade</a>.</span>
      </label>
      {err("accept") ? <span className="help-error">{err("accept")}</span> : null}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
      <button type="submit" className="btn-primary w-full" disabled={pending}>{pending ? "Enviando solicitação…" : "Enviar solicitação de reserva"}</button>
      <p className="text-xs text-muted">Nenhum pagamento é feito pelo site. A pousada confirma a reserva e informa as condições de pagamento.</p>
    </form>
  );
}
