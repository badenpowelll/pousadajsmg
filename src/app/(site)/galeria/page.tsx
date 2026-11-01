import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Container, EmptyState, SectionHeading } from "@/components/site/ui";
import { listGallery } from "@/services/content";

export const metadata: Metadata = { title: "Galeria" };

export default async function GalleryPage({ searchParams }: { searchParams: Promise<{ categoria?: string }> }) {
  const { categoria } = await searchParams;
  const all = await listGallery();
  const categories = [...new Set(all.map((g) => g.category))];
  const items = categoria ? all.filter((g) => g.category === categoria) : all;
  return (
    <Container className="py-16">
      <SectionHeading eyebrow="Galeria" title="Fotos da pousada" />
      {categories.length > 1 ? (
        <nav className="mb-8 flex flex-wrap gap-2" aria-label="Categorias">
          <Link href="/galeria" className={`rounded-full px-4 py-1.5 text-sm ${!categoria ? "bg-brand text-white" : "bg-sand text-brown-dark"}`}>Todas</Link>
          {categories.map((c) => (
            <Link key={c} href={`/galeria?categoria=${encodeURIComponent(c)}`} className={`rounded-full px-4 py-1.5 text-sm capitalize ${categoria === c ? "bg-brand text-white" : "bg-sand text-brown-dark"}`}>{c}</Link>
          ))}
        </nav>
      ) : null}
      {items.length ? (
        <div className="columns-2 gap-3 md:columns-3 [&>*]:mb-3">
          {items.map((g) => (
            <figure key={g.id} className="relative overflow-hidden rounded-xl">
              <Image src={g.url} alt={g.alt} width={800} height={600} className="h-auto w-full object-cover" sizes="(min-width: 768px) 33vw, 50vw" />
              <figcaption className="sr-only">{g.alt}</figcaption>
            </figure>
          ))}
        </div>
      ) : (
        <EmptyState title="Ainda não há fotos nesta categoria" />
      )}
    </Container>
  );
}
