"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { adminUsers, establishments, siteSettings } from "@/db/schema";
import { audit } from "@/lib/audit";
import { requireUser } from "@/lib/auth";
import { back, formToObject, parseOrRedirect } from "@/lib/form";
import { getSite } from "@/services/content";

const BACK = "/admin/configuracoes";
const opt = (max: number) => z.string().trim().max(max).optional().transform((v) => v || null);
const hex = z.string().regex(/^#[0-9a-fA-F]{6}$/, "cor em hexadecimal, ex.: #C2410C");
const time = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "horário HH:MM");

const estSchema = z.object({
  name: z.string().trim().min(2).max(80),
  tagline: opt(120), description: opt(2000), phone: opt(30), whatsapp: z.string().trim().regex(/^\d{10,15}$|^$/, "só dígitos com DDI, ex.: 5584999999999").optional().transform((v) => v || null),
  email: z.string().trim().email().max(160).optional().or(z.literal("")).transform((v) => v || null),
  addressLine: opt(160), city: opt(80), state: opt(2), postalCode: opt(12),
  latitude: z.coerce.number().min(-90).max(90).optional(), longitude: z.coerce.number().min(-180).max(180).optional(),
  mapsUrl: opt(500), instagramUrl: opt(200), facebookUrl: opt(200),
  checkInTime: time, checkOutTime: time,
});

export async function saveEstablishment(formData: FormData) {
  const user = await requireUser("OWNER");
  const d = parseOrRedirect(estSchema, formToObject(formData), BACK);
  const { establishment } = await getSite();
  await db.update(establishments).set({ ...d, latitude: d.latitude ?? null, longitude: d.longitude ?? null }).where(eq(establishments.id, establishment.id));
  await audit(user.id, "establishment.update", "establishment", establishment.id, d);
  revalidatePath("/", "layout");
  back(BACK, "Dados do estabelecimento salvos.");
}

const siteSchema = z.object({
  logoUrl: opt(500), heroImageUrl: opt(500), heroTitle: z.string().trim().min(3).max(120), heroSubtitle: z.string().trim().max(200),
  primaryColor: hex, accentColor: hex, aboutTitle: opt(120), aboutText: opt(4000),
  cancellationPolicy: opt(4000), housePolicies: opt(4000), privacyPolicy: opt(8000), termsText: opt(8000),
});

export async function saveSiteSettings(formData: FormData) {
  const user = await requireUser("OWNER");
  const d = parseOrRedirect(siteSchema, formToObject(formData), BACK);
  const { settings } = await getSite();
  await db.update(siteSettings).set(d).where(eq(siteSettings.id, settings.id));
  await audit(user.id, "site_settings.update", "site_settings", settings.id);
  revalidatePath("/", "layout");
  back(BACK, "Configurações do site salvas.");
}

export async function changePassword(formData: FormData) {
  const user = await requireUser();
  const d = parseOrRedirect(z.object({ current: z.string().min(1), next: z.string().min(10, "mínimo 10 caracteres").max(200), confirm: z.string() }).refine((v) => v.next === v.confirm, { path: ["confirm"], message: "as senhas não conferem" }), formToObject(formData), BACK);
  if (!(await bcrypt.compare(d.current, user.passwordHash))) back(BACK + "?erro=Senha+atual+incorreta", "");
  await db.update(adminUsers).set({ passwordHash: await bcrypt.hash(d.next, 12) }).where(eq(adminUsers.id, user.id));
  await audit(user.id, "admin.password_change", "admin_user", user.id);
  back(BACK, "Senha alterada.");
}

export async function createStaff(formData: FormData) {
  const user = await requireUser("OWNER");
  const d = parseOrRedirect(z.object({ name: z.string().trim().min(2).max(80), email: z.string().trim().email(), password: z.string().min(10, "mínimo 10 caracteres"), role: z.enum(["OWNER", "STAFF"]).default("STAFF") }), formToObject(formData), BACK);
  try {
    const [row] = await db.insert(adminUsers).values({ name: d.name, email: d.email.toLowerCase(), passwordHash: await bcrypt.hash(d.password, 12), role: d.role }).returning();
    await audit(user.id, "admin.create", "admin_user", row.id, { email: d.email, role: d.role });
  } catch {
    back(BACK + "?erro=E-mail+já+cadastrado", "");
  }
  back(BACK, "Usuário criado.");
}
