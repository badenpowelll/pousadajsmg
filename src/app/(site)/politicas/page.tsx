import type { Metadata } from "next";
import { Container } from "@/components/site/ui";
import { getSite } from "@/services/content";

export const metadata: Metadata = { title: "Políticas de hospedagem" };

export default async function PoliciesPage() {
  const { establishment: est, settings } = await getSite();
  return (
    <Container className="max-w-3xl py-16">
      <h1 className="text-4xl font-semibold text-brown-dark">Políticas de hospedagem</h1>
      <section className="mt-8">
        <h2 className="text-xl font-semibold text-brown-dark">Horários</h2>
        <p className="mt-2 text-muted">Check-in a partir das {est.checkInTime}; check-out até as {est.checkOutTime}.</p>
      </section>
      <section className="mt-8">
        <h2 className="text-xl font-semibold text-brown-dark">Regras da casa</h2>
        <p className="mt-2 whitespace-pre-line text-muted">{settings.housePolicies ?? "A definir pelo estabelecimento."}</p>
      </section>
      <section className="mt-8">
        <h2 className="text-xl font-semibold text-brown-dark">Cancelamento</h2>
        <p className="mt-2 whitespace-pre-line text-muted">{settings.cancellationPolicy ?? "A definir pelo estabelecimento."}</p>
      </section>
    </Container>
  );
}
