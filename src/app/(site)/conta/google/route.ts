import { NextResponse, type NextRequest } from "next/server";
import { beginGoogleLogin, googleConfigured } from "@/lib/guest-auth";

/** GET /conta/google?returnTo=/reservar/... → redireciona para o Google. */
export async function GET(req: NextRequest) {
  if (!googleConfigured()) return NextResponse.redirect(new URL("/conta?erro=google-nao-configurado", req.url));
  const returnTo = req.nextUrl.searchParams.get("returnTo") ?? "/conta";
  const url = await beginGoogleLogin(returnTo.startsWith("/") ? returnTo : "/conta");
  return NextResponse.redirect(url);
}
