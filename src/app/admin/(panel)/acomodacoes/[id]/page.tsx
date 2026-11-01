import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { accommodationTypes } from "@/db/schema";
import { Card, Flash, PageTitle } from "@/components/admin/ui";
import { AccommodationForm } from "@/components/admin/accommodation-form";
import { addImage, removeImage } from "../actions";

export default async function EditAccommodation({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ ok?: string; erro?: string }> }) {
  const { id } = await params;
  const sp = await searchParams;
  const [type, amenities] = await Promise.all([
    db.query.accommodationTypes.findFirst({ where: eq(accommodationTypes.id, id), with: { images: { orderBy: (i, { asc }) => [asc(i.sortOrder)] }, amenities: true } }),
    db.query.amenities.findMany(),
  ]);
  if (!type) notFound();
  return (
    <>
      <PageTitle title={type.name}><Link href={`/acomodacoes/${type.slug}`} target="_blank" className="btn-ghost btn-sm">Ver no site</Link></PageTitle>
      <Flash ok={sp.ok} erro={sp.erro} />
      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <Card><AccommodationForm type={type} amenities={amenities} selected={new Set(type.amenities.map((a) => a.amenityId))} /></Card>
        <Card>
          <h2 className="mb-3 font-semibold text-brown-dark">Fotos</h2>
          <ul className="space-y-3">
            {type.images.map((img) => (
              <li key={img.id} className="flex items-center gap-3">
                <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded-md bg-sand"><Image src={img.url} alt={img.alt} fill sizes="80px" className="object-cover" /></div>
                <div className="min-w-0 flex-1 text-xs"><p className="truncate">{img.alt}</p><p className="truncate text-muted">{img.url}</p></div>
                <form action={removeImage}><input type="hidden" name="id" value={img.id} /><input type="hidden" name="typeId" value={type.id} /><button className="text-xs text-danger">Remover</button></form>
              </li>
            ))}
          </ul>
          <form action={addImage} className="mt-4 space-y-2 border-t border-sand-dark pt-4">
            <input type="hidden" name="typeId" value={type.id} />
            <label><span className="label">URL da foto</span><input name="url" className="field" placeholder="https://… ou /fotos/suite.jpg" required /></label>
            <label><span className="label">Descrição (alt)</span><input name="alt" className="field" required /></label>
            <label><span className="label">Ordem</span><input name="sortOrder" type="number" className="field" defaultValue={type.images.length} /></label>
            <button className="btn-secondary btn-sm">Adicionar foto</button>
            <p className="text-xs text-muted">Upload de arquivos: hospede as fotos em um serviço de imagens (ou na pasta /public) e informe a URL. Upload direto é um próximo passo documentado.</p>
          </form>
        </Card>
      </div>
    </>
  );
}
