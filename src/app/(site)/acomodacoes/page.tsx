import type { Metadata } from "next";
import { AccommodationCard, Container, EmptyState, SectionHeading } from "@/components/site/ui";
import { listActiveAccommodations } from "@/services/content";

export const metadata: Metadata = { title: "Acomodações" };

export default async function AccommodationsPage({ searchParams }: { searchParams: Promise<{ hospedes?: string }> }) {
  const { hospedes } = await searchParams;
  const minGuests = Number(hospedes) || 0;
  const all = await listActiveAccommodations();
  const types = minGuests ? all.filter((t) => t.capacity >= minGuests) : all;
  return (
    <Container className="py-16">
      <SectionHeading eyebrow="Acomodações" title="Escolha onde descansar" text="Todas as tarifas são por noite, para a unidade. Reserve direto e fale com a pousada pelo WhatsApp." />
      <form method="get" className="mb-8 flex flex-wrap items-end gap-3" aria-label="Filtrar acomodações">
        <label>
          <span className="label">Hóspedes</span>
          <select name="hospedes" className="field w-44" defaultValue={minGuests || ""}>
            <option value="">Qualquer</option>
            {[1, 2, 3, 4, 5, 6].map((n) => <option key={n} value={n}>{n}+</option>)}
          </select>
        </label>
        <button type="submit" className="btn-secondary">Filtrar</button>
      </form>
      {types.length ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {types.map((t) => <AccommodationCard key={t.id} item={t} />)}
        </div>
      ) : (
        <EmptyState title="Nenhuma acomodação encontrada" text="Tente outro número de hóspedes." />
      )}
    </Container>
  );
}
