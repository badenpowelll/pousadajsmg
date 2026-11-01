"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { db } from "@/db";
import { contactMessages } from "@/db/schema";
import { rateLimit } from "@/lib/rate-limit";

const schema = z.object({
  name: z.string().trim().min(2, "Informe seu nome").max(120),
  email: z.string().trim().email("E-mail inválido").max(160),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
  message: z.string().trim().min(10, "Escreva uma mensagem com ao menos 10 caracteres").max(2000),
  website: z.string().max(0).optional(), // honeypot: deve ficar vazio
});

export type ContactState = { ok: boolean; errors?: Record<string, string>; message?: string };

export async function sendContact(_prev: ContactState, formData: FormData): Promise<ContactState> {
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) errors[String(issue.path[0])] = issue.message;
    return { ok: false, errors };
  }
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!rateLimit(`contact:${ip}`, 5, 10 * 60_000)) {
    return { ok: false, message: "Muitas mensagens em pouco tempo. Tente novamente em alguns minutos." };
  }
  await db.insert(contactMessages).values({
    name: parsed.data.name,
    email: parsed.data.email,
    phone: parsed.data.phone || null,
    message: parsed.data.message,
    ip,
  });
  return { ok: true, message: "Mensagem enviada. Responderemos em breve." };
}
