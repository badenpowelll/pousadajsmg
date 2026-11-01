"use server";

import { eq } from "drizzle-orm";
import { db } from "@/db";
import { contactMessages } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { back } from "@/lib/form";

export async function markRead(formData: FormData) {
  await requireUser();
  await db.update(contactMessages).set({ read: true }).where(eq(contactMessages.id, String(formData.get("id"))));
  back("/admin/mensagens", "Mensagem marcada como lida.");
}
