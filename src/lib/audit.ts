import { db } from "@/db";
import { auditLogs } from "@/db/schema";

export async function audit(userId: string, action: string, entity: string, entityId: string | null, details?: unknown) {
  await db.insert(auditLogs).values({ userId, action, entity, entityId, details: details ?? null });
}
