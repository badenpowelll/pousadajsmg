import { and, eq, gt, inArray, lt, sql } from "drizzle-orm";
import { db, type Db, type Tx } from "@/db";
import { accommodationTypes, availabilityBlocks, reservations } from "@/db/schema";

export const ACTIVE_STATUSES = ["REQUESTED", "CONFIRMED"] as const;

/**
 * Unidades ocupadas de uma categoria em QUALQUER noite do intervalo [checkIn, checkOut).
 * Sobreposição de intervalos: a.start < b.end && b.start < a.end.
 * Retorna o pico de ocupação por noite (não a soma), calculado em SQL.
 */
export async function occupiedUnitsPeak(
  conn: Db | Tx,
  accommodationTypeId: string,
  checkIn: string,
  checkOut: string,
  opts: { excludeReservationId?: string } = {},
): Promise<number> {
  // Gera as noites do intervalo e, para cada uma, soma reservas ativas + bloqueios que a cobrem.
  const exclude = opts.excludeReservationId ?? "";
  const rows = await conn.execute<{ peak: number | null }>(sql`
    with nights as (
      select generate_series(${checkIn}::date, (${checkOut}::date - interval '1 day')::date, interval '1 day')::date as night
    ),
    per_night as (
      select n.night,
        (select count(*) from reservations r
           where r.accommodation_type_id = ${accommodationTypeId}
             and r.status in ('REQUESTED','CONFIRMED')
             and r.id <> ${exclude}
             and r.check_in <= n.night and n.night < r.check_out) as reserved,
        (select coalesce(sum(b.units),0) from availability_blocks b
           where b.accommodation_type_id = ${accommodationTypeId}
             and b.start_date <= n.night and n.night < b.end_date) as blocked
      from nights n
    )
    select max(reserved + blocked)::int as peak from per_night
  `);
  return Number(rows[0]?.peak ?? 0);
}

export async function unitsAvailable(
  conn: Db | Tx,
  type: { id: string; units: number },
  checkIn: string,
  checkOut: string,
  opts: { excludeReservationId?: string } = {},
): Promise<number> {
  const peak = await occupiedUnitsPeak(conn, type.id, checkIn, checkOut, opts);
  return Math.max(0, type.units - peak);
}

/** Mapa noite → unidades disponíveis, para o calendário público e administrativo. */
export async function availabilityCalendar(
  accommodationTypeId: string,
  from: string,
  to: string,
): Promise<Record<string, number>> {
  const [type] = await db
    .select({ units: accommodationTypes.units })
    .from(accommodationTypes)
    .where(eq(accommodationTypes.id, accommodationTypeId));
  if (!type) return {};
  const res = await db
    .select({ checkIn: reservations.checkIn, checkOut: reservations.checkOut })
    .from(reservations)
    .where(
      and(
        eq(reservations.accommodationTypeId, accommodationTypeId),
        inArray(reservations.status, [...ACTIVE_STATUSES]),
        lt(reservations.checkIn, to),
        gt(reservations.checkOut, from),
      ),
    );
  const blocks = await db
    .select({ start: availabilityBlocks.startDate, end: availabilityBlocks.endDate, units: availabilityBlocks.units })
    .from(availabilityBlocks)
    .where(
      and(
        eq(availabilityBlocks.accommodationTypeId, accommodationTypeId),
        lt(availabilityBlocks.startDate, to),
        gt(availabilityBlocks.endDate, from),
      ),
    );
  const out: Record<string, number> = {};
  let cur = from;
  while (cur < to) {
    let used = 0;
    for (const r of res) if (r.checkIn <= cur && cur < r.checkOut) used += 1;
    for (const b of blocks) if (b.start <= cur && cur < b.end) used += b.units;
    out[cur] = Math.max(0, type.units - used);
    const d = new Date(cur + "T00:00:00Z");
    d.setUTCDate(d.getUTCDate() + 1);
    cur = d.toISOString().slice(0, 10);
  }
  return out;
}
