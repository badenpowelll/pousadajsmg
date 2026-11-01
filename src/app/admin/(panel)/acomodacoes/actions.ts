"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { accommodationAmenities, accommodationImages, accommodationTypes } from "@/db/schema";
import { audit } from "@/lib/audit";
import { requireUser } from "@/lib/auth";
import { back, checkbox, formToObject, parseOrRedirect } from "@/lib/form";
import { parseBRLToCents } from "@/lib/money";

const typeSchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(2).max(80),
  slug: z.string().trim().regex(/^[a-z0-9-]+$/, "use letras minúsculas, números e hífens").max(80),
  shortDescription: z.string().trim().max(160).optional(),
  description: z.string().trim().max(4000).optional(),
  capacity: z.coerce.number().int().min(1).max(20),
  units: z.coerce.number().int().min(1).max(500),
  basePrice: z.string().transform(parseBRLToCents),
  sizeM2: z.coerce.number().int().min(0).max(1000).optional(),
  bedDescription: z.string().trim().max(120).optional(),
  sortOrder: z.coerce.number().int().min(0).max(999).default(0),
  active: z.string().optional(),
});

function revalidateSite() {
  revalidatePath("/", "layout");
}

export async function saveAccommodation(formData: FormData) {
  const user = await requireUser();
  const raw = formToObject(formData);
  const backTo = raw.id ? `/admin/acomodacoes/${raw.id}` : "/admin/acomodacoes/nova";
  const data = parseOrRedirect(typeSchema, raw, backTo);
  const values = {
    name: data.name, slug: data.slug, shortDescription: data.shortDescription || null, description: data.description || null,
    capacity: data.capacity, units: data.units, basePriceCents: data.basePrice, sizeM2: data.sizeM2 || null,
    bedDescription: data.bedDescription || null, sortOrder: data.sortOrder, active: checkbox(data.active),
  };
  const amenityIds = formData.getAll("amenities").map(String);
  let id = data.id;
  try {
    await db.transaction(async (tx) => {
      if (id) await tx.update(accommodationTypes).set(values).where(eq(accommodationTypes.id, id));
      else id = (await tx.insert(accommodationTypes).values(values).returning({ id: accommodationTypes.id }))[0].id;
      await tx.delete(accommodationAmenities).where(eq(accommodationAmenities.accommodationTypeId, id!));
      if (amenityIds.length) await tx.insert(accommodationAmenities).values(amenityIds.map((amenityId) => ({ accommodationTypeId: id!, amenityId })));
    });
  } catch (e) {
    const msg = String(e).includes("unique") ? "Já existe uma acomodação com este slug." : "Não foi possível salvar.";
    redirect(`${backTo}?erro=${encodeURIComponent(msg)}`);
  }
  await audit(user.id, data.id ? "accommodation.update" : "accommodation.create", "accommodation_type", id!, values);
  revalidateSite();
  back(`/admin/acomodacoes/${id}`, "Acomodação salva.");
}

const imageSchema = z.object({
  typeId: z.string().min(1),
  url: z.string().trim().url("URL inválida").max(500).or(z.string().regex(/^\/[^\s]+$/, "informe uma URL ou caminho /...")),
  alt: z.string().trim().min(2).max(160),
  sortOrder: z.coerce.number().int().min(0).default(0),
});

export async function addImage(formData: FormData) {
  const user = await requireUser();
  const data = parseOrRedirect(imageSchema, formToObject(formData), `/admin/acomodacoes/${formData.get("typeId")}`);
  await db.insert(accommodationImages).values({ accommodationTypeId: data.typeId, url: data.url, alt: data.alt, sortOrder: data.sortOrder });
  await audit(user.id, "accommodation.image_add", "accommodation_type", data.typeId, { url: data.url });
  revalidateSite();
  back(`/admin/acomodacoes/${data.typeId}`, "Foto adicionada.");
}

export async function removeImage(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id"));
  const typeId = String(formData.get("typeId"));
  await db.delete(accommodationImages).where(eq(accommodationImages.id, id));
  await audit(user.id, "accommodation.image_remove", "accommodation_type", typeId, { imageId: id });
  revalidateSite();
  back(`/admin/acomodacoes/${typeId}`, "Foto removida.");
}

export async function toggleActive(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id"));
  const active = formData.get("active") === "true";
  await db.update(accommodationTypes).set({ active }).where(eq(accommodationTypes.id, id));
  await audit(user.id, "accommodation.toggle", "accommodation_type", id, { active });
  revalidateSite();
  back("/admin/acomodacoes", active ? "Acomodação ativada." : "Acomodação desativada (reservas existentes são mantidas).");
}
