import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Container } from "@/components/site/ui";
import { getGuestAccount } from "@/lib/guest-auth";
import { ProfileForm } from "../profile-form";

export const metadata: Metadata = { title: "Completar cadastro", robots: { index: false } };

export default async function CompleteProfilePage({ searchParams }: { searchParams: Promise<{ returnTo?: string }> }) {
  const account = await getGuestAccount();
  if (!account) redirect("/conta");
  const { returnTo } = await searchParams;
  return (
    <Container className="max-w-md py-16">
      <span className="eyebrow">Quase lá</span>
      <h1 className="text-3xl font-semibold text-brown-dark">Complete seu cadastro</h1>
      <p className="mt-2 text-sm text-muted">Entrou como <strong>{account.email}</strong>. Precisamos só do seu nome e WhatsApp para falar sobre a reserva.</p>
      <div className="card mt-6 p-6"><ProfileForm account={account} returnTo={returnTo} /></div>
    </Container>
  );
}
