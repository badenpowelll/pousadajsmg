import Link from "next/link";
import { and, desc, eq, ilike, or, type SQL } from "drizzle-orm";
import { db } from "@/db";
import { guests, reservations, type ReservationStatus } from "@/db/schema";
import { Flash, PageTitle, STATUS_LABEL, StatusBadge, Table } from "@/components/admin/ui";
import { formatDateBR } from "@/lib/dates";
import { formatBRL } from "@/lib/money";

const STATUSES = Object.keys(STATUS_LABEL) as ReservationStatus[];

export default async function ReservationsPage({ searchParams }: { searchParams: Promise<{ status?: string; q?: string; ok?: string; erro?: string }> }) {
  const sp = await searchParams;
  const conds: SQL[] = [];
  if (sp.status && STATUSES.includes(sp.status as ReservationStatus)) conds.push(eq(reservations.status, sp.status as ReservationStatus));
  if (sp.q) conds.push(or(ilike(reservations.code, `%${sp.q}%`), ilike(guests.fullName, `%${sp.q}%`), ilike(guests.email, `%${sp.q}%`))!);

  const rows = await db
    .select({ r: reservations, guestName: guests.fullName })
    .from(reservations)
    .innerJoin(guests, eq(reservations.guestId, guests.id))
    .where(conds.length ? and(...conds) : undefined)
    .orderBy(desc(reservations.createdAt))
    .limit(200);
  const types = await db.query.accommodationTypes.findMany();
  const typeName = (id: string) => types.find((t) => t.id === id)?.name ?? "—";

  return (
    <>
      <PageTitle title="Reservas" />
      <Flash ok={sp.ok} erro={sp.erro} />
      <form method="get" className="mb-4 flex flex-wrap gap-2">
        <input name="q" defaultValue={sp.q ?? ""} placeholder="Código, nome ou e-mail" className="field w-64" />
        <select name="status" defaultValue={sp.status ?? ""} className="field w-48">
          <option value="">Todos os status</option>
          {STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
        </select>
        <button className="btn-secondary">Filtrar</button>
      </form>
      <Table head={["Código", "Hóspede", "Acomodação", "Período", "Hósp.", "Total", "Status", "Criada em"]}>
        {rows.length ? rows.map(({ r, guestName }) => (
          <tr key={r.id} className="hover:bg-sand/40">
            <td className="px-4 py-2 font-mono text-xs"><Link className="text-brand" href={`/admin/reservas/${r.id}`}>{r.code}</Link></td>
            <td className="px-4 py-2">{guestName}</td>
            <td className="px-4 py-2">{typeName(r.accommodationTypeId)}</td>
            <td className="px-4 py-2 whitespace-nowrap">{formatDateBR(r.checkIn)} → {formatDateBR(r.checkOut)}</td>
            <td className="px-4 py-2">{r.guests}</td>
            <td className="px-4 py-2">{formatBRL(r.totalCents)}</td>
            <td className="px-4 py-2"><StatusBadge status={r.status} /></td>
            <td className="px-4 py-2 whitespace-nowrap text-muted">{r.createdAt.toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })}</td>
          </tr>
        )) : <tr><td colSpan={8} className="px-4 py-6 text-muted">Nenhuma reserva encontrada.</td></tr>}
      </Table>
    </>
  );
}
