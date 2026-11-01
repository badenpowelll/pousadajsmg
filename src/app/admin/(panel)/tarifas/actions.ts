"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { availabilityBlocks, ratePlans } from "@/db/schema";
import { audit } from "@/lib/audit";
import { requireUser } from "@/lib/auth";
import { isIsoDate } from "@/lib/dates";
import { back, checkbox, formToObject, parseOrRedirect } from "@/lib/form";
import { parseBRLToCents } from "@/lib/money";

const BACK = "/admin/tarifas";

const rateSchema = z
  .object({
    accommodationTypeId: z.string().min(1),
    name: z.string().trim().min(2).max(80),
    startDate: z.string().refine(isIsoDate, "data inválida"),
    endDate: z.string().refine(isIsoDate, "data inválida"),
    price: z.string().transform(parseBRLToCents),
    minNights: z.coerce.number().int().min(1).max(30).default(1),
    priority: z.coerce.number().int().min(0).max(100).default(10),
    active: z.string().optional(),
  })
  .refine((v) => v.endDate >= v.startDate, { path: ["endDate"], message: "fim deve ser igual ou após o início" });

export async function saveRatePlan(formData: FormData) {
  const user = await requireUser();
  const d = parseOrRedirect(rateSchema, formToObject(formData), BACK);
  const [row] = await db.insert(ratePlans).values({ accommodationTypeId: d.accommodationTypeId, name: d.name, startDate: d.startDate, endDate: d.endDate, priceCents: d.price, minNights: d.minNights, priority: d.priority, active: checkbox(d.active) }).returning();
  await audit(user.id, "rate_plan.create", "rate_plan", row.id, d);
  revalidatePath("/", "layout");
  back(BACK, "Tarifa criada.");
}

export async function deleteRatePlan(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id"));
  await db.delete(ratePlans).where(eq(ratePlans.id, id));
  await audit(user.id, "rate_plan.delete", "rate_plan", id);
  revalidatePath("/", "layout");
  back(BACK, "Tarifa removida. Reservas já criadas mantêm o valor calculado.");
}

const blockSchema = z
  .object({
    accommodationTypeId: z.string().min(1),
    startDate: z.string().refine(isIsoDate, "data inválida"),
    endDate: z.string().refine(isIsoDate, "data inválida"),
    units: z.coerce.number().int().min(1).max(500),
    reason: z.string().trim().max(200).optional(),
  })
  .refine((v) => v.endDate > v.startDate, { path: ["endDate"], message: "fim (exclusivo) deve ser após o início" });

export async function saveBlock(formData: FormData) {
  const user = await requireUser();
  const d = parseOrRedirect(blockSchema, formToObject(formData), BACK);
  const [row] = await db.insert(availabilityBlocks).values({ ...d, reason: d.reason || null }).returning();
  await audit(user.id, "block.create", "availability_block", row.id, d);
  revalidatePath("/", "layout");
  back(BACK, "Bloqueio criado.");
}

export async function deleteBlock(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id"));
  await db.delete(availabilityBlocks).where(eq(availabilityBlocks.id, id));
  await audit(user.id, "block.delete", "availability_block", id);
  revalidatePath("/", "layout");
  back(BACK, "Bloqueio removido.");
}
