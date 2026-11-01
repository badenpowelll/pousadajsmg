import type { Metadata } from "next";
import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { reservations } from "@/db/schema";
import { Container, Notice } from "@/components/site/ui";
import { getGuestAccount, googleConfigured } from "@/lib/guest-auth";
import { formatDateBR } from "@/lib/dates";
import { formatBRL } from "@/lib/money";
import { GoogleButton } from "@/components/site/google-button";
import { logoutGuest } from "./actions";
import { ProfileForm } from "./profile-form";

export const metadata: Metadata = { title: "Minha conta", robots: { index: false } };

const STATUS = { REQUESTED: "Aguardando confirmação", CONFIRMED: "Confirmada", CANCELLED: "Cancelada", COMPLETED: "Concluída" } as const;

export default async function AccountPage({ searchParams }: { searchParams: Promise<{ erro?: string }> }) {
  const { erro } = await searchParams;
  const account = await getGuestAccount();

  if (!account) {
    return (
      <Container className="max-w-md py-16 text-center">
        <span className="eyebrow">Minha conta</span>
        <h1 className="text-3xl font-semibold text-brown-dark">Entre com sua conta Google</h1>
        <p className="mt-3 text-sm text-muted">Acompanhe suas reservas e reserve mais rápido, sem preencher seus dados toda vez.</p>
        <div className="mt-6">
          {erro === "google-nao-configurado" ? <Notice kind="warning">Login com Google ainda não configurado neste ambiente. Você pode reservar normalmente informando seus dados.</Notice> : null}
          {erro === "falha-login" || erro === "login-cancelado" ? <Notice kind="error">Não foi possível entrar. Tente novamente.</Notice> : null}
          <div className="mt-4"><GoogleButton returnTo="/conta" disabled={!googleConfigured()} /></div>
        </div>
      </Container>
    );
  }

  const mine = await db.query.reservations.findMany({ where: eq(reservations.guestAccountId, account.id), with: { accommodationType: true }, orderBy: [desc(reservations.createdAt)] });

  return (
    <Container className="max-w-3xl py-16">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <span className="eyebrow">Minha conta</span>
          <h1 className="text-3xl font-semibold text-brown-dark">Olá, {account.name?.split(" ")[0] ?? account.email}</h1>
          <p className="text-sm text-muted">{account.email}</p>
        </div>
        <form action={logoutGuest}><button className="btn-ghost btn-sm">Sair</button></form>
      </div>

      <section className="mt-10">
        <h2 className="text-xl font-semibold text-brown-dark">Minhas reservas</h2>
        {mine.length ? (
          <ul className="mt-4 space-y-3">
            {mine.map((r) => (
              <li key={r.id} className="card flex flex-wrap items-center justify-between gap-3 p-4 text-sm">
                <div><p className="font-semibold text-brown-dark">{r.accommodationType.name}</p><p className="text-muted">{formatDateBR(r.checkIn)} → {formatDateBR(r.checkOut)} · {r.guests} hósp. · {formatBRL(r.totalCents)}</p></div>
                <div className="text-right"><p className="font-mono text-xs">{r.code}</p><p className="text-xs">{STATUS[r.status]}</p><Link href={`/reserva/${r.code}`} className="text-xs text-brand">Ver detalhes</Link></div>
              </li>
            ))}
          </ul>
        ) : <p className="mt-3 text-sm text-muted">Você ainda não fez reservas com esta conta. <Link href="/reservar" className="text-brand">Buscar datas</Link></p>}
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold text-brown-dark">Meus dados</h2>
        <div className="card mt-4 p-6"><ProfileForm account={account} /></div>
      </section>
    </Container>
  );
}
