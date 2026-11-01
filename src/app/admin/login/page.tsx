import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getSite } from "@/services/content";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Entrar — Painel", robots: { index: false } };

export default async function LoginPage() {
  if (await getCurrentUser()) redirect("/admin");
  const { establishment } = await getSite();
  return (
    <main className="flex min-h-screen items-center justify-center bg-sand/40 px-4">
      <div className="card w-full max-w-sm p-8">
        <p className="eyebrow">Painel administrativo</p>
        <h1 className="text-2xl font-semibold text-brown-dark">{establishment.name}</h1>
        <div className="mt-6"><LoginForm /></div>
      </div>
    </main>
  );
}
