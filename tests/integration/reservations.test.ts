// Testes de integração contra o PostgreSQL de DATABASE_URL (use um banco de desenvolvimento).
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { accommodationTypes, availabilityBlocks, guests, reservations } from "@/db/schema";
import { unitsAvailable } from "@/services/availability";
import { ReservationError, changeReservationStatus, createReservationRequest } from "@/services/reservations";
import { addDays, todayInTimezone } from "@/lib/dates";

const guest = { fullName: "Teste Integração", email: "integracao@exemplo.com", phone: "(84) 90000-0000" };
let typeId = "";
const start = addDays(todayInTimezone(), 120);
const end = addDays(start, 2);
const created: string[] = [];

beforeAll(async () => {
  const [t] = await db
    .insert(accommodationTypes)
    .values({ slug: `teste-${Date.now()}`, name: "Categoria de teste", capacity: 2, units: 2, basePriceCents: 10000 })
    .returning();
  typeId = t.id;
});

afterAll(async () => {
  await db.delete(reservations).where(eq(reservations.accommodationTypeId, typeId));
  await db.delete(availabilityBlocks).where(eq(availabilityBlocks.accommodationTypeId, typeId));
  await db.delete(accommodationTypes).where(eq(accommodationTypes.id, typeId));
  await db.delete(guests).where(eq(guests.email, guest.email));
  if (created.length) await db.delete(reservations).where(inArray(reservations.id, created));
});

describe("motor de reservas", () => {
  it("cria solicitação, calcula total e respeita idempotência", async () => {
    const r1 = await createReservationRequest({ accommodationTypeId: typeId, checkIn: start, checkOut: end, guests: 2, guest, idempotencyKey: `idem-${typeId}` });
    created.push(r1.id);
    expect(r1.status).toBe("REQUESTED");
    expect(r1.nights).toBe(2);
    expect(r1.totalCents).toBe(20000);
    expect(r1.code).toMatch(/^RSV-[A-Z2-9]{6}$/);
    const r2 = await createReservationRequest({ accommodationTypeId: typeId, checkIn: start, checkOut: end, guests: 2, guest, idempotencyKey: `idem-${typeId}` });
    expect(r2.id).toBe(r1.id);
    expect(await unitsAvailable(db, { id: typeId, units: 2 }, start, end)).toBe(1);
  });

  it("rejeita capacidade excedida e datas no passado", async () => {
    await expect(createReservationRequest({ accommodationTypeId: typeId, checkIn: start, checkOut: end, guests: 3, guest })).rejects.toMatchObject({ code: "CAPACITY_EXCEEDED" });
    await expect(createReservationRequest({ accommodationTypeId: typeId, checkIn: "2020-01-01", checkOut: "2020-01-02", guests: 1, guest })).rejects.toMatchObject({ code: "PAST_DATE" });
  });

  it("impede overbooking sob concorrência: só 1 das 3 requisições simultâneas pega a última unidade", async () => {
    const results = await Promise.allSettled(
      [1, 2, 3].map((i) => createReservationRequest({ accommodationTypeId: typeId, checkIn: start, checkOut: end, guests: 1, guest, idempotencyKey: `conc-${typeId}-${i}` })),
    );
    const ok = results.filter((r) => r.status === "fulfilled");
    const failed = results.filter((r) => r.status === "rejected");
    expect(ok).toHaveLength(1);
    expect(failed).toHaveLength(2);
    for (const f of failed) expect((f as PromiseRejectedResult).reason).toBeInstanceOf(ReservationError);
    for (const o of ok) created.push((o as PromiseFulfilledResult<{ id: string }>).value.id);
    expect(await unitsAvailable(db, { id: typeId, units: 2 }, start, end)).toBe(0);
  });

  it("cancelar libera a unidade e bloqueio administrativo reduz disponibilidade", async () => {
    const [{ id: adminId }] = await db.query.adminUsers.findMany({ limit: 1 }).then((u) => (u.length ? u : Promise.reject(new Error("seed necessário"))));
    const last = created.at(-1)!;
    await changeReservationStatus({ reservationId: last, to: "CANCELLED", userId: adminId, reason: "teste" });
    expect(await unitsAvailable(db, { id: typeId, units: 2 }, start, end)).toBe(1);
    await db.insert(availabilityBlocks).values({ accommodationTypeId: typeId, startDate: addDays(start, 1), endDate: end, units: 1, reason: "teste" });
    expect(await unitsAvailable(db, { id: typeId, units: 2 }, start, end)).toBe(0);
    // Confirmar a reserva restante falha? Não: ela mesma é excluída do cálculo; o bloqueio ocupa a outra unidade.
    await changeReservationStatus({ reservationId: created[0], to: "CONFIRMED", userId: adminId });
    const r = await db.query.reservations.findFirst({ where: eq(reservations.id, created[0]) });
    expect(r?.status).toBe("CONFIRMED");
  });
});
