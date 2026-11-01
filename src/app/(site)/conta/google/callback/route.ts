import { NextResponse, type NextRequest } from "next/server";
import { completeGoogleLogin, signInWithGoogleProfile } from "@/lib/guest-auth";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const state = req.nextUrl.searchParams.get("state");
  if (!code || !state) return NextResponse.redirect(new URL("/conta?erro=login-cancelado", req.url));
  try {
    const { profile, returnTo } = await completeGoogleLogin(code, state);
    const account = await signInWithGoogleProfile(profile);
    // Primeiro acesso: completar nome e WhatsApp antes de seguir.
    const next = account.profileCompleted ? returnTo : `/conta/completar?returnTo=${encodeURIComponent(returnTo)}`;
    return NextResponse.redirect(new URL(next, req.url));
  } catch (e) {
    console.error("Google login", e);
    return NextResponse.redirect(new URL("/conta?erro=falha-login", req.url));
  }
}
