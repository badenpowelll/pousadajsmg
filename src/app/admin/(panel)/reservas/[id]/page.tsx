import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { reservations } from "@/db/schema";
import { Card, Flash, PageTitle, STATUS_LABEL, StatusBadge } from "@/components/admin/ui";
import { formatDateBR, formatDateLongBR } from "@/lib/dates";
import { formatBRL } from "@/lib/money";
import { whatsappLink } from "@/lib/whatsapp";
import { canTransition } from "@/services/reservations";
import { saveInternalNotes, updateStatus } from "./actions";

export default async function ReservationDetail({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ ok?: string; erro?: string }> }) {
  const { id } = await params;
  const sp = await searchParams;
  const r = await db.query.reservations.findFirst({
    where: eq(reservations.id, id),
    with: { accommodationType: true, guest: true, statusHistory: { orderBy: (h, { asc }) => [asc(h.createdAt)] } },
  });
  if (!r) notFound();
  const wa = whatsappLink(r.guest.phone, `Olá, ${r.guest.fullName.split(" ")[0]}! Sobre sua solicitação ${r.code} na pousada:`);

  return (
    <>
      <PageTitle title={`Reserva ${r.code}`}><StatusBadge status={r.status} /></PageTitle>
      <Flash ok={sp.ok} erro={sp.erro} />
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <Card>
            <h2 className="mb-3 font-semibold text-brown-dark">Estadia</h2>
            <dl className="grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
              <div><dt className="text-muted">Acomodação</dt><dd>{r.accommodationType.name}</dd></div>
              <div><dt className="text-muted">Hóspedes</dt><dd>{r.guests}</dd></div>
              <div><dt className="text-muted">Check-in</dt><dd>{formatDateLongBR(r.checkIn)}</dd></div>
              <div><dt className="text-muted">Check-out</dt><dd>{formatDateLongBR(r.checkOut)}</dd></div>
              <div><dt className="text-muted">Noites</dt><dd>{r.nights}</dd></div>
              <div><dt className="text-muted">Total</dt><dd className="font-semibold">{formatBRL(r.totalCents)}</dd></div>
            </dl>
            <details className="mt-3 text-sm"><summary className="cursor-pointer text-muted">Composição do valor</summary>
              <ul className="mt-2 space-y-1">{r.breakdown.map((n) => <li key={n.date} className="flex justify-between"><span>{formatDateBR(n.date)}{n.ratePlanId ? " (tarifa especial)" : ""}</span><span>{formatBRL(n.priceCents)}</span></li>)}</ul>
            </details>
            {r.notes ? <p className="mt-3 rounded-lg bg-sand/60 p-3 text-sm"><strong>Observações do hóspede:</strong> {r.notes}</p> : null}
          </Card>

          <Card>
            <h2 className="mb-3 font-semibold text-brown-dark">Hóspede</h2>
            <dl className="grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
              <div><dt className="text-muted">Nome</dt><dd>{r.guest.fullName}</dd></div>
              <div><dt className="text-muted">Documento</dt><dd>{r.guest.document ?? "—"}</dd></div>
              <div><dt className="text-muted">E-mail</dt><dd><a className="text-brand" href={`mailto:${r.guest.email}`}>{r.guest.email}</a></dd></div>
              <div><dt className="text-muted">Telefone</dt><dd>{r.guest.phone} {wa ? <a className="ml-2 text-brand" href={wa} target="_blank" rel="noreferrer">WhatsApp</a> : null}</dd></div>
            </dl>
          </Card>

          <Card>
            <h2 className="mb-3 font-semibold text-brown-dark">Anotações internas</h2>
            <form action={saveInternalNotes} className="space-y-3">
              <input type="hidden" name="id" value={r.id} />
              <textarea name="internalNotes" rows={3} className="field" defaultValue={r.internalNotes ?? ""} placeholder="Visível só para a equipe" />
              <button className="btn-secondary btn-sm">Salvar anotações</button>
            </form>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <h2 className="mb-3 font-semibold text-brown-dark">Alterar status</h2>
            <p className="mb-3 text-xs text-muted">Confirmar revalida a disponibilidade; cancelar libera as unidades.</p>
            <div className="space-y-2">
              {(["CONFIRMED", "CANCELLED", "COMPLETED"] as const).filter((to) => canTransition(r.status, to)).map((to) => (
                <form key={to} action={updateStatus} className="flex gap-2">
                  <input type="hidden" name="id" value={r.id} />
                  <input type="hidden" name="to" value={to} />
                  {to === "CANCELLED" ? <input name="reason" placeholder="Motivo (opcional)" className="field" /> : null}
                  <button className={`${to === "CANCELLED" ? "btn-danger" : "btn-primary"} btn-sm shrink-0`}>{to === "CONFIRMED" ? "Confirmar" : to === "CANCELLED" ? "Cancelar" : "Concluir"}</button>
                </form>
              ))}
              {r.status === "CANCELLED" || r.status === "COMPLETED" ? <p className="text-sm text-muted">Reserva encerrada.</p> : null}
            </div>
          </Card>
          <Card>
            <h2 className="mb-3 font-semibold text-brown-dark">Histórico</h2>
            <ol className="space-y-2 text-sm">
              {r.statusHistory.map((h) => (
                <li key={h.id} className="border-l-2 border-sand-dark pl-3">
                  <p>{h.fromStatus ? `${STATUS_LABEL[h.fromStatus]} → ` : ""}<strong>{STATUS_LABEL[h.toStatus]}</strong></p>
                  <p className="text-xs text-muted">{h.createdAt.toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })}{h.reason ? ` · ${h.reason}` : ""}</p>
                </li>
              ))}
            </ol>
          </Card>
          <Link href="/admin/reservas" className="btn-ghost btn-sm">← Voltar</Link>
        </div>
      </div>
    </>
  );
}
