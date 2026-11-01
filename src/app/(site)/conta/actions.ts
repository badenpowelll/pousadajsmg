"use server";

import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { guestAccounts } from "@/db/schema";
import { getGuestAccount, signOutGuest } from "@/lib/guest-auth";

const schema = z.object({
  name: z.string().trim().min(3, "Informe seu nome completo").max(120),
  whatsapp: z.string().trim().regex(/^[\d\s()+-]{10,20}$/, "Informe um WhatsApp válido com DDD"),
  returnTo: z.string().optional(),
});

export type ProfileState = { errors?: Record<string, string>; message?: string };

export async function completeProfile(_prev: ProfileState, formData: FormData): Promise<ProfileState> {
  const account = await getGuestAccount();
  if (!account) redirect("/conta");
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const i of parsed.error.issues) errors[String(i.path[0])] = i.message;
    return { errors };
  }
  let digits = parsed.data.whatsapp.replace(/\D/g, "");
  if (digits.length <= 11) digits = `55${digits}`; // assume Brasil quando sem DDI
  await db.update(guestAccounts).set({ name: parsed.data.name, whatsapp: digits, profileCompleted: true }).where(eq(guestAccounts.id, account.id));
  const to = parsed.data.returnTo && parsed.data.returnTo.startsWith("/") ? parsed.data.returnTo : "/conta";
  redirect(to);
}

export async function logoutGuest() {
  await signOutGuest();
  redirect("/");
}
