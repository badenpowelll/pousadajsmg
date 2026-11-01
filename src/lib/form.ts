import { redirect } from "next/navigation";
import type { z } from "zod";

/** Converte FormData em objeto simples (strings), ignorando campos internos. */
export function formToObject(formData: FormData): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of formData.entries()) if (typeof v === "string" && !k.startsWith("$")) out[k] = v;
  return out;
}

/** Valida; em caso de erro redireciona de volta com a primeira mensagem na query string. */
export function parseOrRedirect<T extends z.ZodTypeAny>(schema: T, data: unknown, backTo: string): z.infer<T> {
  const parsed = schema.safeParse(data);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    redirect(`${backTo}${backTo.includes("?") ? "&" : "?"}erro=${encodeURIComponent(`${issue?.path.join(".")}: ${issue?.message}`)}`);
  }
  return parsed.data;
}

export function back(path: string, ok: string) {
  redirect(`${path}${path.includes("?") ? "&" : "?"}ok=${encodeURIComponent(ok)}`);
}

export const checkbox = (v: string | undefined) => v === "on" || v === "true";
