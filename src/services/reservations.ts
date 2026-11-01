import { and, eq, sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import {
  accommodationTypes,
  auditLogs,
  guests,
  ratePlans,
  reservationStatusChanges,
  reservations,
  type ReservationStatus,
} from "@/db/schema";
import { diffNights, isIsoDate, todayInTimezone } from "@/lib/dates";
import { createReservationCode } from "@/lib/ids";
import { unitsAvailable } from "./availability";
import { quoteStay } from "./pricing";

export class ReservationError extends Error {
  constructor(
    public code:
      | "INVALID_DATES"
      | "PAST_DATE"
      | "CAPACITY_EXCEEDED"
      | "MIN_NIGHTS"
      | "UNAVAILABLE"
      | "NOT_FOUND"
      | "INVALID_TRANSITION",
    message: string,
  ) {
    super(message);
  }
}

export const MAX_STAY_NIGHTS = 30;
export const MAX_ADVANCE_DAYS = 365;

export const searchSchema = z
  .object({
    checkIn: z.string().refine(isIsoDate, "Data de check-in inválida"),
    checkOut: z.string().refine(isIsoDate, "Data de check-out inválida"),
    guests: z.coerce.number().int().min(1, "Informe ao menos 1 hóspede").max(12, "Máximo de 12 hóspedes"),
  })
  .superRefine((v, ctx) => {
    if (v.checkOut <= v.checkIn)
      ctx.addIssue({ code: "custom", path: ["checkOut"], message: "O check-out deve ser após o check-in" });
    else if (diffNights(v.checkIn, v.checkOut) > MAX_STAY_NIGHTS)
      ctx.addIssue({ code: "custom", path: ["checkOut"], message: `Estadia máxima de ${MAX_STAY_NIGHTS} noites` });
  });

export type SearchInput = z.infer<typeof searchSchema>;

export function assertSearchDatesNotPast(input: SearchInput) {
  const today = todayInTimezone();
  if (input.checkIn < today) throw new ReservationError("PAST_DATE", "O check-in não pode ser no passado");
}

export type AvailableOffer = {
  type: typeof accommodationTypes.$inferSelect & {
    images: { id: string; url: string; alt: string }[];
    amenities: { amenity: { id: string; key: string; label: string; icon: string | null } }[];
  };
  availableUnits: number;
  quote: ReturnType<typeof quoteStay>;
  meetsMinNights: boolean;
};

/** Pesquisa de disponibilidade para o site público. */
export async function searchAvailability(input: SearchInput): Promise<AvailableOffer[]> {
  assertSearchDatesNotPast(input);
  const types = await db.query.accommodationTypes.findMany({
    where: eq(accommodationTypes.active, true),
    with: { ratePlans: true, images: true, amenities: { with: { amenity: true } } },
    orderBy: (t, { asc }) => [asc(t.sortOrder), asc(t.name)],
  });
  const offers: AvailableOffer[] = [];
  for (const type of types) {
    if (type.capacity < input.guests) continue;
    const availableUnits = await unitsAvailable(db, type, input.checkIn, input.checkOut);
    if (availableUnits <= 0) continue;
    const quote = quoteStay(type.basePriceCents, type.ratePlans, input.checkIn, input.checkOut);
    offers.push({ type, availableUnits, quote, meetsMinNights: quote.nights >= quote.minNightsRequired });
  }
  return offers;
}

export const guestSchema = z.object({
  fullName: z.string().trim().min(3, "Informe o nome completo").max(120),
  email: z.string().trim().email("E-mail inválido").max(160),
  phone: z
    .string()
    .trim()
    .regex(/^[\d\s()+-]{8,20}$/, "Telefone inválido"),
  document: z.string().trim().max(40).optional().or(z.literal("")),
  notes: z.string().trim().max(1000).optional().or(z.literal("")),
});

export const createReservationSchema = z.object({
  accommodationTypeId: z.string().min(1),
  checkIn: z.string().refine(isIsoDate),
  checkOut: z.string().refine(isIsoDate),
  guests: z.coerce.number().int().min(1).max(12),
  guest: guestSchema,
  idempotencyKey: z.string().min(8).max(80).optional(),
});

export type CreateReservationInput = z.infer<typeof createReservationSchema>;

/**
 * Cria uma SOLICITAÇÃO de reserva (status REQUESTED) de forma transacional.
 * Concorrência: lock consultivo por categoria dentro da transação; duas requisições
 * simultâneas para a mesma categoria são serializadas e a segunda vê a ocupação da primeira.
 * Idempotência: se idempotencyKey já existir, devolve a reserva existente.
 */
export async function createReservationRequest(input: CreateReservationInput) {
  const search = searchSchema.parse({ checkIn: input.checkIn, checkOut: input.checkOut, guests: input.guests });
  assertSearchDatesNotPast(search);

  if (input.idempotencyKey) {
    const existing = await db.query.reservations.findFirst({
      where: eq(reservations.idempotencyKey, input.idempotencyKey),
      with: { accommodationType: true, guest: true },
    });
    if (existing) return existing;
  }

  return db.transaction(async (tx) => {
    // Serializa operações na mesma categoria (hashtext evita colisão trivial entre ids).
    await tx.execute(sql`select pg_advisory_xact_lock(hashtext(${input.accommodationTypeId}))`);

    const type = await tx.query.accommodationTypes.findFirst({
      where: and(eq(accommodationTypes.id, input.accommodationTypeId), eq(accommodationTypes.active, true)),
      with: { ratePlans: { where: eq(ratePlans.active, true) } },
    });
    if (!type) throw new ReservationError("NOT_FOUND", "Acomodação não encontrada");
    if (type.capacity < search.guests)
      throw new ReservationError("CAPACITY_EXCEEDED", `Esta acomodação comporta até ${type.capacity} hóspedes`);

    const quote = quoteStay(type.basePriceCents, type.ratePlans, search.checkIn, search.checkOut);
    if (quote.nights < quote.minNightsRequired)
      throw new ReservationError("MIN_NIGHTS", `Mínimo de ${quote.minNightsRequired} noites para este período`);

    const available = await unitsAvailable(tx, type, search.checkIn, search.checkOut);
    if (available <= 0)
      throw new ReservationError("UNAVAILABLE", "Não há unidades disponíveis para as datas escolhidas");

    const [guest] = await tx
      .insert(guests)
      .values({
        fullName: input.guest.fullName,
        email: input.guest.email.toLowerCase(),
        phone: input.guest.phone,
        document: input.guest.document || null,
      })
      .returning();

    const [created] = await tx
      .insert(reservations)
      .values({
        code: createReservationCode(),
        idempotencyKey: input.idempotencyKey ?? null,
        accommodationTypeId: type.id,
        guestId: guest.id,
        checkIn: search.checkIn,
        checkOut: search.checkOut,
        nights: quote.nights,
        guests: search.guests,
        status: "REQUESTED",
        totalCents: quote.totalCents,
        breakdown: quote.breakdown,
        notes: input.guest.notes || null,
      })
      .returning();

    await tx.insert(reservationStatusChanges).values({
      reservationId: created.id,
      fromStatus: null,
      toStatus: "REQUESTED",
      reason: "Solicitação enviada pelo site",
    });

    return { ...created, accommodationType: type, guest };
  });
}

const TRANSITIONS: Record<ReservationStatus, ReservationStatus[]> = {
  REQUESTED: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["CANCELLED", "COMPLETED"],
  CANCELLED: [],
  COMPLETED: [],
};

export function canTransition(from: ReservationStatus, to: ReservationStatus): boolean {
  return TRANSITIONS[from].includes(to);
}

/** Mudança de status feita pelo painel, com histórico e auditoria. Confirmar revalida a disponibilidade. */
export async function changeReservationStatus(params: {
  reservationId: string;
  to: ReservationStatus;
  userId: string;
  reason?: string;
}) {
  return db.transaction(async (tx) => {
    const current = await tx.query.reservations.findFirst({
      where: eq(reservations.id, params.reservationId),
      with: { accommodationType: true },
    });
    if (!current) throw new ReservationError("NOT_FOUND", "Reserva não encontrada");
    if (!canTransition(current.status, params.to))
      throw new ReservationError("INVALID_TRANSITION", `Não é possível ir de ${current.status} para ${params.to}`);

    if (params.to === "CONFIRMED") {
      await tx.execute(sql`select pg_advisory_xact_lock(hashtext(${current.accommodationTypeId}))`);
      const available = await unitsAvailable(tx, current.accommodationType, current.checkIn, current.checkOut, {
        excludeReservationId: current.id,
      });
      if (available <= 0)
        throw new ReservationError("UNAVAILABLE", "Sem unidades livres: outra reserva ocupa estas datas");
    }

    const [updated] = await tx
      .update(reservations)
      .set({ status: params.to })
      .where(eq(reservations.id, current.id))
      .returning();
    await tx.insert(reservationStatusChanges).values({
      reservationId: current.id,
      fromStatus: current.status,
      toStatus: params.to,
      changedById: params.userId,
      reason: params.reason ?? null,
    });
    await tx.insert(auditLogs).values({
      userId: params.userId,
      action: "reservation.status_change",
      entity: "reservation",
      entityId: current.id,
      details: { from: current.status, to: params.to, reason: params.reason ?? null },
    });
    return updated;
  });
}
