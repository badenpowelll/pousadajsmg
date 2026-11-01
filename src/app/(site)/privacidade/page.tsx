import type { Metadata } from "next";
import { Container } from "@/components/site/ui";
import { getSite } from "@/services/content";

export const metadata: Metadata = { title: "Política de privacidade" };

export default async function PrivacyPage() {
  const { settings } = await getSite();
  return (
    <Container className="max-w-3xl py-16">
      <h1 className="text-4xl font-semibold text-brown-dark">Política de privacidade</h1>
      <p className="mt-6 whitespace-pre-line leading-relaxed text-muted">{settings.privacyPolicy ?? "A definir pelo estabelecimento."}</p>
    </Container>
  );
}
