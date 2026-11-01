"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { rateLimit } from "@/lib/rate-limit";
import { ReservationError, createReservationRequest, createReservationSchema } from "@/services/reservations";

export type ReserveState = { errors?: Record<string, string>; message?: string };

export async function submitReservation(_prev: ReserveState, formData: FormData): Promise<ReserveState> {
  const raw = Object.fromEntries(formData) as Record<string, string>;
  if (raw.website) return { message: "Não foi possível enviar." }; // honeypot
  const parsed = createReservationSchema.safeParse({
    accommodationTypeId: raw.accommodationTypeId,
    checkIn: raw.checkIn,
    checkOut: raw.checkOut,
    guests: raw.guests,
    idempotencyKey: raw.idempotencyKey,
    guest: { fullName: raw.fullName, email: raw.email, phone: raw.phone, document: raw.document, notes: raw.notes },
  });
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) errors[String(issue.path.at(-1))] = issue.message;
    return { errors, message: "Verifique os campos destacados." };
  }
  if (raw.accept !== "on") return { errors: { accept: "É preciso aceitar as políticas" }, message: "Verifique os campos destacados." };

  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!rateLimit(`reserve:${ip}`, 10, 10 * 60_000)) return { message: "Muitas solicitações em pouco tempo. Tente novamente em alguns minutos." };

  let code: string;
  try {
    const r = await createReservationRequest(parsed.data);
    code = r.code;
  } catch (e) {
    if (e instanceof ReservationError) return { message: e.message };
    if (e instanceof z.ZodError) return { message: e.issues[0]?.message ?? "Dados inválidos" };
    console.error(e);
    return { message: "Não foi possível registrar a solicitação. Tente novamente." };
  }
  redirect(`/reserva/${code}`);
}
