"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { experiences, galleryImages, instagramPosts, testimonials } from "@/db/schema";
import { audit } from "@/lib/audit";
import { requireUser } from "@/lib/auth";
import { back, formToObject, parseOrRedirect } from "@/lib/form";
import { isInstagramPostUrl } from "@/services/instagram";

const BACK = "/admin/conteudo";
const urlOrPath = z.string().trim().max(500).refine((v) => /^https?:\/\//.test(v) || /^\/[^\s]+$/.test(v), "informe uma URL ou caminho /...");
const done = (msg: string) => { revalidatePath("/", "layout"); back(BACK, msg); };

export async function addGalleryImage(formData: FormData) {
  const user = await requireUser();
  const d = parseOrRedirect(z.object({ url: urlOrPath, alt: z.string().trim().min(2).max(160), category: z.string().trim().min(2).max(40).default("geral"), sortOrder: z.coerce.number().int().min(0).default(0) }), formToObject(formData), BACK);
  const [row] = await db.insert(galleryImages).values(d).returning();
  await audit(user.id, "gallery.add", "gallery_image", row.id, d);
  done("Foto adicionada à galeria.");
}
export async function removeGalleryImage(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id"));
  await db.delete(galleryImages).where(eq(galleryImages.id, id));
  await audit(user.id, "gallery.remove", "gallery_image", id);
  done("Foto removida.");
}

export async function addExperience(formData: FormData) {
  const user = await requireUser();
  const d = parseOrRedirect(z.object({ title: z.string().trim().min(2).max(100), description: z.string().trim().min(10).max(1000), imageUrl: urlOrPath.optional().or(z.literal("")), sortOrder: z.coerce.number().int().min(0).default(0) }), formToObject(formData), BACK);
  const [row] = await db.insert(experiences).values({ ...d, imageUrl: d.imageUrl || null }).returning();
  await audit(user.id, "experience.add", "experience", row.id, d);
  done("Experiência adicionada.");
}
export async function removeExperience(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id"));
  await db.delete(experiences).where(eq(experiences.id, id));
  await audit(user.id, "experience.remove", "experience", id);
  done("Experiência removida.");
}

export async function addTestimonial(formData: FormData) {
  const user = await requireUser();
  const d = parseOrRedirect(z.object({ author: z.string().trim().min(2).max(80), text: z.string().trim().min(10).max(600), rating: z.coerce.number().int().min(1).max(5).default(5) }), formToObject(formData), BACK);
  const [row] = await db.insert(testimonials).values(d).returning();
  await audit(user.id, "testimonial.add", "testimonial", row.id, d);
  done("Depoimento adicionado.");
}
export async function removeTestimonial(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id"));
  await db.delete(testimonials).where(eq(testimonials.id, id));
  await audit(user.id, "testimonial.remove", "testimonial", id);
  done("Depoimento removido.");
}

export async function addInstagramPost(formData: FormData) {
  const user = await requireUser();
  const d = parseOrRedirect(z.object({ url: z.string().trim().refine(isInstagramPostUrl, "use um link de post ou reel do Instagram"), caption: z.string().trim().max(200).optional(), sortOrder: z.coerce.number().int().min(0).default(0) }), formToObject(formData), BACK);
  const [row] = await db.insert(instagramPosts).values({ url: d.url, caption: d.caption || null, sortOrder: d.sortOrder }).onConflictDoNothing().returning();
  if (row) await audit(user.id, "instagram.add", "instagram_post", row.id, d);
  done("Post do Instagram adicionado.");
}
export async function removeInstagramPost(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id"));
  await db.delete(instagramPosts).where(eq(instagramPosts.id, id));
  await audit(user.id, "instagram.remove", "instagram_post", id);
  done("Post removido.");
}
