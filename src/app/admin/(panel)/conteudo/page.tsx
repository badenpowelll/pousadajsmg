import Image from "next/image";
import { asc } from "drizzle-orm";
import { db } from "@/db";
import { experiences, galleryImages, instagramPosts, testimonials } from "@/db/schema";
import { Card, Flash, PageTitle } from "@/components/admin/ui";
import { addExperience, addGalleryImage, addInstagramPost, addTestimonial, removeExperience, removeGalleryImage, removeInstagramPost, removeTestimonial } from "./actions";

export default async function ContentPage({ searchParams }: { searchParams: Promise<{ ok?: string; erro?: string }> }) {
  const sp = await searchParams;
  const [gallery, exps, tests, posts] = await Promise.all([
    db.select().from(galleryImages).orderBy(asc(galleryImages.sortOrder)),
    db.select().from(experiences).orderBy(asc(experiences.sortOrder)),
    db.select().from(testimonials),
    db.select().from(instagramPosts).orderBy(asc(instagramPosts.sortOrder)),
  ]);
  const hasToken = Boolean(process.env.INSTAGRAM_ACCESS_TOKEN);
  return (
    <>
      <PageTitle title="Galeria, experiências, depoimentos e Instagram" />
      <Flash ok={sp.ok} erro={sp.erro} />
      <div className="grid gap-8 lg:grid-cols-2">
        <section>
          <h2 className="mb-3 text-lg font-semibold text-brown-dark">Galeria</h2>
          <Card>
            <ul className="mb-4 grid grid-cols-3 gap-2">
              {gallery.map((g) => (
                <li key={g.id} className="relative aspect-square overflow-hidden rounded-md bg-sand">
                  <Image src={g.url} alt={g.alt} fill sizes="120px" className="object-cover" />
                  <form action={removeGalleryImage} className="absolute right-1 bottom-1"><input type="hidden" name="id" value={g.id} /><button className="rounded bg-white/90 px-1.5 py-0.5 text-[10px] text-danger">remover</button></form>
                </li>
              ))}
            </ul>
            <form action={addGalleryImage} className="grid gap-2 sm:grid-cols-2">
              <label className="sm:col-span-2"><span className="label">URL</span><input name="url" className="field" required /></label>
              <label><span className="label">Descrição</span><input name="alt" className="field" required /></label>
              <label><span className="label">Categoria</span><input name="category" className="field" defaultValue="geral" /></label>
              <button className="btn-secondary btn-sm sm:col-span-2">Adicionar foto</button>
            </form>
          </Card>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-brown-dark">Instagram</h2>
          <Card>
            {hasToken ? (
              <p className="mb-3 rounded-lg bg-success/10 p-3 text-sm text-success">Token da API configurado: o site mostra o feed automático (fotos e vídeos).</p>
            ) : (
              <p className="mb-3 rounded-lg bg-sand/60 p-3 text-xs text-muted">Sem token da API da Meta. O site incorpora os posts cadastrados abaixo (embed oficial). Para o feed automático, configure <code>INSTAGRAM_ACCESS_TOKEN</code> no servidor (veja docs/INSTAGRAM.md).</p>
            )}
            <ul className="mb-4 space-y-2 text-sm">
              {posts.map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-2"><a href={p.url} target="_blank" rel="noreferrer" className="truncate text-brand">{p.url}</a><form action={removeInstagramPost}><input type="hidden" name="id" value={p.id} /><button className="text-xs text-danger">remover</button></form></li>
              ))}
              {!posts.length ? <li className="text-muted">Nenhum post cadastrado.</li> : null}
            </ul>
            <form action={addInstagramPost} className="grid gap-2">
              <label><span className="label">Link do post ou reel</span><input name="url" className="field" placeholder="https://www.instagram.com/p/XXXX/" required /></label>
              <button className="btn-secondary btn-sm">Adicionar post</button>
            </form>
          </Card>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-brown-dark">Experiências</h2>
          <Card>
            <ul className="mb-4 space-y-2 text-sm">
              {exps.map((e) => <li key={e.id} className="flex items-center justify-between gap-2"><span>{e.title}</span><form action={removeExperience}><input type="hidden" name="id" value={e.id} /><button className="text-xs text-danger">remover</button></form></li>)}
            </ul>
            <form action={addExperience} className="grid gap-2">
              <label><span className="label">Título</span><input name="title" className="field" required /></label>
              <label><span className="label">Descrição</span><textarea name="description" rows={2} className="field" required /></label>
              <label><span className="label">URL da imagem (opcional)</span><input name="imageUrl" className="field" /></label>
              <button className="btn-secondary btn-sm">Adicionar experiência</button>
            </form>
          </Card>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-brown-dark">Depoimentos</h2>
          <Card>
            <ul className="mb-4 space-y-2 text-sm">
              {tests.map((t) => <li key={t.id} className="flex items-center justify-between gap-2"><span>{t.author} · {t.rating}★ · <span className="text-muted">{t.text.slice(0, 50)}…</span></span><form action={removeTestimonial}><input type="hidden" name="id" value={t.id} /><button className="text-xs text-danger">remover</button></form></li>)}
            </ul>
            <form action={addTestimonial} className="grid gap-2">
              <label><span className="label">Autor</span><input name="author" className="field" required /></label>
              <label><span className="label">Texto</span><textarea name="text" rows={2} className="field" required /></label>
              <label><span className="label">Nota (1 a 5)</span><input name="rating" type="number" min={1} max={5} className="field" defaultValue={5} /></label>
              <button className="btn-secondary btn-sm">Adicionar depoimento</button>
            </form>
          </Card>
        </section>
      </div>
    </>
  );
}
