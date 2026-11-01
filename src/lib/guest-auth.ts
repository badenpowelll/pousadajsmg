import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { and, eq, gt } from "drizzle-orm";
import { cache } from "react";
import { db } from "@/db";
import { guestAccounts, guestSessions, type GuestAccount } from "@/db/schema";

const COOKIE = "guest_session";
const STATE_COOKIE = "google_oauth_state";
const SESSION_DAYS = 30;

const hash = (t: string) => createHash("sha256").update(t).digest("hex");

export function googleConfigured() {
  return Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
}

export function googleRedirectUri() {
  return `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/conta/google/callback`;
}

/** Monta a URL de autorização do Google (OpenID Connect) e grava o state no cookie. */
export async function beginGoogleLogin(returnTo: string): Promise<string> {
  const state = randomBytes(16).toString("base64url");
  const jar = await cookies();
  jar.set(STATE_COOKIE, JSON.stringify({ state, returnTo }), { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 600 });
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID!,
    redirect_uri: googleRedirectUri(),
    response_type: "code",
    scope: "openid email profile",
    state,
    prompt: "select_account",
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
}

export type GoogleProfile = { sub: string; email: string; name?: string; picture?: string; email_verified?: boolean };

/** Troca o código por tokens e lê o perfil; valida o state. Retorna { profile, returnTo }. */
export async function completeGoogleLogin(code: string, state: string): Promise<{ profile: GoogleProfile; returnTo: string }> {
  const jar = await cookies();
  const raw = jar.get(STATE_COOKIE)?.value;
  jar.delete(STATE_COOKIE);
  const saved = raw ? (JSON.parse(raw) as { state: string; returnTo: string }) : null;
  if (!saved || saved.state !== state) throw new Error("Estado inválido (tente entrar novamente)");

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ code, client_id: process.env.GOOGLE_CLIENT_ID!, client_secret: process.env.GOOGLE_CLIENT_SECRET!, redirect_uri: googleRedirectUri(), grant_type: "authorization_code" }),
  });
  if (!tokenRes.ok) throw new Error("Falha ao obter token do Google");
  const tokens = (await tokenRes.json()) as { access_token: string };
  const profileRes = await fetch("https://openidconnect.googleapis.com/v1/userinfo", { headers: { authorization: `Bearer ${tokens.access_token}` } });
  if (!profileRes.ok) throw new Error("Falha ao ler perfil do Google");
  const profile = (await profileRes.json()) as GoogleProfile;
  if (!profile.sub || !profile.email) throw new Error("Perfil incompleto");
  const returnTo = saved.returnTo.startsWith("/") ? saved.returnTo : "/conta";
  return { profile, returnTo };
}

/** Cria/atualiza a conta a partir do perfil do Google e abre sessão. */
export async function signInWithGoogleProfile(profile: GoogleProfile): Promise<GuestAccount> {
  const existing = await db.query.guestAccounts.findFirst({ where: eq(guestAccounts.googleSub, profile.sub) });
  const account = existing
    ? (await db.update(guestAccounts).set({ email: profile.email, avatarUrl: profile.picture ?? existing.avatarUrl }).where(eq(guestAccounts.id, existing.id)).returning())[0]
    : (await db.insert(guestAccounts).values({ googleSub: profile.sub, email: profile.email, name: profile.name ?? null, avatarUrl: profile.picture ?? null }).returning())[0];

  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 86_400_000);
  await db.insert(guestSessions).values({ tokenHash: hash(token), accountId: account.id, expiresAt });
  const jar = await cookies();
  jar.set(COOKIE, token, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", expires: expiresAt });
  return account;
}

export async function signOutGuest() {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (token) await db.delete(guestSessions).where(eq(guestSessions.tokenHash, hash(token)));
  jar.delete(COOKIE);
}

export const getGuestAccount = cache(async (): Promise<GuestAccount | null> => {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (!token) return null;
  const rows = await db
    .select({ account: guestAccounts })
    .from(guestSessions)
    .innerJoin(guestAccounts, eq(guestSessions.accountId, guestAccounts.id))
    .where(and(eq(guestSessions.tokenHash, hash(token)), gt(guestSessions.expiresAt, new Date())))
    .limit(1);
  return rows[0]?.account ?? null;
});
