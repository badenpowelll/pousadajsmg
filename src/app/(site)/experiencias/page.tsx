import type { Metadata } from "next";
import Image from "next/image";
import { Container, EmptyState, SectionHeading } from "@/components/site/ui";
import { listExperiences } from "@/services/content";

export const metadata: Metadata = { title: "Experiências" };

export default async function ExperiencesPage() {
  const items = await listExperiences();
  return (
    <Container className="py-16">
      <SectionHeading eyebrow="Experiências" title="O que fazer na região" text="Sugestões para aproveitar a cidade. Peça indicações na recepção: ajudamos a organizar passeios e transporte." />
      {items.length ? (
        <div className="space-y-10">
          {items.map((e, i) => (
            <article key={e.id} className={`grid items-center gap-8 md:grid-cols-2 ${i % 2 ? "md:[&>*:first-child]:order-2" : ""}`}>
              {e.imageUrl ? (
                <div className="relative aspect-[4/3] overflow-hidden rounded-[var(--radius)]"><Image src={e.imageUrl} alt={e.title} fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" /></div>
              ) : <div />}
              <div>
                <h2 className="text-2xl font-semibold text-brown-dark sm:text-3xl">{e.title}</h2>
                <p className="mt-3 leading-relaxed text-muted">{e.description}</p>
              </div>
            </article>
          ))}
        </div>
      ) : <EmptyState title="Em breve" text="As experiências serão cadastradas pela pousada." />}
    </Container>
  );
}
