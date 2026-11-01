"use server";

import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { reservations } from "@/db/schema";
import { audit } from "@/lib/audit";
import { requireUser } from "@/lib/auth";
import { ReservationError, changeReservationStatus } from "@/services/reservations";

const statusSchema = z.object({
  id: z.string().min(1),
  to: z.enum(["CONFIRMED", "CANCELLED", "COMPLETED"]),
  reason: z.string().trim().max(500).optional(),
});

export async function updateStatus(formData: FormData) {
  const user = await requireUser();
  const parsed = statusSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) redirect("/admin/reservas?erro=Dados+inválidos");
  const back = `/admin/reservas/${parsed.data.id}`;
  try {
    await changeReservationStatus({ reservationId: parsed.data.id, to: parsed.data.to, userId: user.id, reason: parsed.data.reason });
  } catch (e) {
    const msg = e instanceof ReservationError ? e.message : "Não foi possível alterar o status.";
    redirect(`${back}?erro=${encodeURIComponent(msg)}`);
  }
  redirect(`${back}?ok=${encodeURIComponent("Status atualizado.")}`);
}

export async function saveInternalNotes(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id") ?? "");
  const notes = String(formData.get("internalNotes") ?? "").slice(0, 2000);
  await db.update(reservations).set({ internalNotes: notes || null }).where(eq(reservations.id, id));
  await audit(user.id, "reservation.notes", "reservation", id);
  redirect(`/admin/reservas/${id}?ok=${encodeURIComponent("Anotações salvas.")}`);
}
