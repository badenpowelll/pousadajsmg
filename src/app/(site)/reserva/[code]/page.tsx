import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { CheckCircle2, MessageCircle } from "lucide-react";
import { db } from "@/db";
import { reservations } from "@/db/schema";
import { Container } from "@/components/site/ui";
import { formatDateLongBR } from "@/lib/dates";
import { formatBRL } from "@/lib/money";
import { whatsappLink } from "@/lib/whatsapp";
import { getSite } from "@/services/content";

export const metadata: Metadata = { title: "Solicitação enviada", robots: { index: false } };

const STATUS_LABEL = { REQUESTED: "Aguardando confirmação", CONFIRMED: "Confirmada", CANCELLED: "Cancelada", COMPLETED: "Concluída" } as const;

export default async function ReservationPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const r = await db.query.reservations.findFirst({ where: eq(reservations.code, code.toUpperCase()), with: { accommodationType: true, guest: true } });
  if (!r) notFound();
  const { establishment: est } = await getSite();
  const wa = whatsappLink(est.whatsapp, `Olá! Enviei a solicitação de reserva ${r.code} pelo site (${r.accommodationType.name}, ${r.checkIn} a ${r.checkOut}).`);
  return (
    <Container className="max-w-2xl py-16">
      <div className="card p-8 text-center">
        <CheckCircle2 className="mx-auto text-success" size={48} />
        <h1 className="mt-4 text-3xl font-semibold text-brown-dark">{r.status === "REQUESTED" ? "Solicitação enviada" : STATUS_LABEL[r.status]}</h1>
        <p className="mt-2 text-muted">Código da reserva</p>
        <p className="font-display text-3xl font-semibold tracking-wider text-brand">{r.code}</p>
        <dl className="mt-8 space-y-2 text-left text-sm">
          <div className="flex justify-between"><dt className="text-muted">Acomodação</dt><dd className="font-medium">{r.accommodationType.name}</dd></div>
          <div className="flex justify-between"><dt className="text-muted">Check-in</dt><dd>{formatDateLongBR(r.checkIn)} a partir das {est.checkInTime}</dd></div>
          <div className="flex justify-between"><dt className="text-muted">Check-out</dt><dd>{formatDateLongBR(r.checkOut)} até as {est.checkOutTime}</dd></div>
          <div className="flex justify-between"><dt className="text-muted">Hóspedes</dt><dd>{r.guests}</dd></div>
          <div className="flex justify-between"><dt className="text-muted">Noites</dt><dd>{r.nights}</dd></div>
          <div className="flex justify-between border-t border-sand-dark pt-2"><dt className="font-semibold text-brown-dark">Total</dt><dd className="font-semibold text-brown-dark">{formatBRL(r.totalCents)}</dd></div>
          <div className="flex justify-between"><dt className="text-muted">Situação</dt><dd>{STATUS_LABEL[r.status]}</dd></div>
        </dl>
        {r.status === "REQUESTED" ? (
          <p className="mt-6 text-sm text-muted">A pousada vai analisar a solicitação e entrar em contato pelo e-mail <strong>{r.guest.email}</strong> ou pelo telefone informado para confirmar e combinar o pagamento. Guarde o código acima.</p>
        ) : null}
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {wa ? <a href={wa} target="_blank" rel="noreferrer" className="btn-primary"><MessageCircle size={16} /> Falar com a pousada</a> : null}
          <Link href="/" className="btn-secondary">Voltar ao início</Link>
        </div>
      </div>
    </Container>
  );
}
