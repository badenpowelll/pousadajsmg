import type { Metadata } from "next";
import { Container } from "@/components/site/ui";
import { getSite } from "@/services/content";

export const metadata: Metadata = { title: "Termos" };

export default async function TermsPage() {
  const { settings } = await getSite();
  return (
    <Container className="max-w-3xl py-16">
      <h1 className="text-4xl font-semibold text-brown-dark">Termos de uso e reserva</h1>
      <p className="mt-6 whitespace-pre-line leading-relaxed text-muted">{settings.termsText ?? "A definir pelo estabelecimento."}</p>
    </Container>
  );
}
