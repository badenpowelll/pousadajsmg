import Link from "next/link";
import { and, count, desc, eq, gte, inArray, lte, sql, sum } from "drizzle-orm";
import { db } from "@/db";
import { accommodationTypes, contactMessages, reservations } from "@/db/schema";
import { Flash, PageTitle, Stat, StatusBadge, Table } from "@/components/admin/ui";
import { addDays, formatDateBR, todayInTimezone } from "@/lib/dates";
import { formatBRL } from "@/lib/money";
import { occupiedUnitsPeak } from "@/services/availability";

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ erro?: string }> }) {
  const { erro } = await searchParams;
  const today = todayInTimezone();
  const in7 = addDays(today, 7);

  const [[pending], [unread], recent, checkins, checkouts, [month], types] = await Promise.all([
    db.select({ n: count() }).from(reservations).where(eq(reservations.status, "REQUESTED")),
    db.select({ n: count() }).from(contactMessages).where(eq(contactMessages.read, false)),
    db.query.reservations.findMany({ with: { accommodationType: true, guest: true }, orderBy: [desc(reservations.createdAt)], limit: 8 }),
    db.query.reservations.findMany({ where: and(eq(reservations.status, "CONFIRMED"), gte(reservations.checkIn, today), lte(reservations.checkIn, in7)), with: { accommodationType: true, guest: true }, orderBy: [reservations.checkIn] }),
    db.query.reservations.findMany({ where: and(eq(reservations.status, "CONFIRMED"), gte(reservations.checkOut, today), lte(reservations.checkOut, in7)), with: { accommodationType: true, guest: true }, orderBy: [reservations.checkOut] }),
    db.select({ total: sum(reservations.totalCents), n: count() }).from(reservations).where(and(inArray(reservations.status, ["CONFIRMED", "COMPLETED"]), sql`to_char(${reservations.checkIn}, 'YYYY-MM') = to_char(${today}::date, 'YYYY-MM')`)),
    db.select({ id: accommodationTypes.id, units: accommodationTypes.units }).from(accommodationTypes).where(eq(accommodationTypes.active, true)),
  ]);

  // Ocupação de hoje: unidades ocupadas / unidades ativas
  let occupied = 0;
  for (const t of types) occupied += await occupiedUnitsPeak(db, t.id, today, addDays(today, 1));
  const totalUnits = types.reduce((s, t) => s + t.units, 0);

  return (
    <>
      <PageTitle title="Dashboard" />
      <Flash erro={erro === "sem-permissao" ? "Você não tem permissão para essa ação." : undefined} />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Solicitações pendentes" value={pending.n} hint="aguardando confirmação" />
        <Stat label="Ocupação hoje" value={totalUnits ? `${Math.round((occupied / totalUnits) * 100)}%` : "—"} hint={`${occupied} de ${totalUnits} unidades`} />
        <Stat label="Receita do mês" value={formatBRL(Number(month.total ?? 0))} hint={`${month.n} reservas confirmadas/concluídas (check-in no mês)`} />
        <Stat label="Mensagens não lidas" value={unread.n} />
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <section>
          <h2 className="mb-3 text-lg font-semibold text-brown-dark">Próximos check-ins (7 dias)</h2>
          <Table head={["Data", "Hóspede", "Acomodação"]}>
            {checkins.length ? checkins.map((r) => (
              <tr key={r.id}><td className="px-4 py-2">{formatDateBR(r.checkIn)}</td><td className="px-4 py-2"><Link className="hover:text-brand" href={`/admin/reservas/${r.id}`}>{r.guest.fullName}</Link></td><td className="px-4 py-2">{r.accommodationType.name}</td></tr>
            )) : <tr><td className="px-4 py-4 text-muted" colSpan={3}>Nenhum check-in confirmado nos próximos 7 dias.</td></tr>}
          </Table>
        </section>
        <section>
          <h2 className="mb-3 text-lg font-semibold text-brown-dark">Próximos check-outs (7 dias)</h2>
          <Table head={["Data", "Hóspede", "Acomodação"]}>
            {checkouts.length ? checkouts.map((r) => (
              <tr key={r.id}><td className="px-4 py-2">{formatDateBR(r.checkOut)}</td><td className="px-4 py-2"><Link className="hover:text-brand" href={`/admin/reservas/${r.id}`}>{r.guest.fullName}</Link></td><td className="px-4 py-2">{r.accommodationType.name}</td></tr>
            )) : <tr><td className="px-4 py-4 text-muted" colSpan={3}>Nenhum check-out nos próximos 7 dias.</td></tr>}
          </Table>
        </section>
      </div>

      <section className="mt-8">
        <div className="mb-3 flex items-center justify-between"><h2 className="text-lg font-semibold text-brown-dark">Reservas recentes</h2><Link href="/admin/reservas" className="text-sm text-brand">Ver todas</Link></div>
        <Table head={["Código", "Hóspede", "Acomodação", "Período", "Total", "Status"]}>
          {recent.map((r) => (
            <tr key={r.id}>
              <td className="px-4 py-2 font-mono text-xs"><Link className="hover:text-brand" href={`/admin/reservas/${r.id}`}>{r.code}</Link></td>
              <td className="px-4 py-2">{r.guest.fullName}</td>
              <td className="px-4 py-2">{r.accommodationType.name}</td>
              <td className="px-4 py-2">{formatDateBR(r.checkIn)} → {formatDateBR(r.checkOut)}</td>
              <td className="px-4 py-2">{formatBRL(r.totalCents)}</td>
              <td className="px-4 py-2"><StatusBadge status={r.status} /></td>
            </tr>
          ))}
        </Table>
      </section>
    </>
  );
}
