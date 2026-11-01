"use server";

import bcrypt from "bcryptjs";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { adminUsers } from "@/db/schema";
import { createSession } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";

const schema = z.object({ email: z.string().trim().email(), password: z.string().min(1) });

export async function login(_prev: { message?: string }, formData: FormData) {
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { message: "Informe e-mail e senha." };
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!rateLimit(`login:${ip}`, 10, 15 * 60_000)) return { message: "Muitas tentativas. Aguarde 15 minutos." };

  const user = await db.query.adminUsers.findFirst({ where: eq(adminUsers.email, parsed.data.email.toLowerCase()) });
  const ok = user && user.active && (await bcrypt.compare(parsed.data.password, user.passwordHash));
  if (!ok) return { message: "E-mail ou senha incorretos." };
  await createSession(user.id);
  redirect("/admin");
}
