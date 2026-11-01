import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MapPin, Star } from "lucide-react";
import { AccommodationCard, Container, SectionHeading } from "@/components/site/ui";
import { SearchForm } from "@/components/site/search-form";
import { getSite, listActiveAccommodations, listExperiences, listGallery, listTestimonials } from "@/services/content";
import { AmenityIcon } from "@/components/site/amenity-icon";
import { InstagramSection } from "@/components/site/instagram-section";

export default async function HomePage() {
  const [{ establishment: est, settings }, types, gallery, experiences, testimonials] = await Promise.all([
    getSite(),
    listActiveAccommodations(),
    listGallery(),
    listExperiences(),
    listTestimonials(),
  ]);
  const amenityMap = new Map<string, { label: string; icon: string | null }>();
  for (const t of types) for (const a of t.amenities) amenityMap.set(a.amenity.key, { label: a.amenity.label, icon: a.amenity.icon });

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LodgingBusiness",
    name: est.name,
    description: est.description,
    telephone: est.phone,
    email: est.email,
    url: process.env.NEXT_PUBLIC_SITE_URL,
    address: { "@type": "PostalAddress", streetAddress: est.addressLine, addressLocality: est.city, addressRegion: est.state, postalCode: est.postalCode, addressCountry: est.country },
    checkinTime: est.checkInTime,
    checkoutTime: est.checkOutTime,
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Hero */}
      <section className="relative isolate">
        <div className="relative h-[78vh] min-h-[520px] w-full overflow-hidden">
          {settings.heroImageUrl ? (
            <Image src={settings.heroImageUrl} alt="" fill priority sizes="100vw" className="object-cover" />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-brown to-graphite" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-graphite/80 via-graphite/30 to-graphite/10" />
          <Container className="relative flex h-full flex-col justify-end pb-16 text-white">
            {settings.logoUrl ? (
              <div className="fade-in mb-6 inline-flex w-fit items-center gap-4 rounded-2xl bg-graphite/85 px-4 py-3 shadow-lg ring-1 ring-white/10 backdrop-blur">
                <Image src={settings.logoUrl} alt="" width={140} height={100} className="h-16 w-auto object-contain sm:h-20" priority />
                <div className="pr-2">
                  <p className="font-display text-2xl font-semibold leading-none sm:text-3xl">{est.name}</p>
                  <p className="mt-1 inline-flex items-center gap-1 text-xs text-white/80"><MapPin size={12} /> {est.city}{est.state ? `, ${est.state}` : ""}</p>
                </div>
              </div>
            ) : (
              <p className="fade-in mb-3 inline-flex items-center gap-2 text-sm text-white/85">
                <MapPin size={16} /> {est.city}{est.state ? `, ${est.state}` : ""}
              </p>
            )}
            <h1 className="fade-in max-w-3xl text-4xl font-semibold leading-tight sm:text-6xl">{settings.heroTitle}</h1>
            <p className="fade-in mt-4 max-w-xl text-lg text-white/85">{settings.heroSubtitle}</p>
            <div className="fade-in mt-8 flex flex-wrap gap-3">
              <Link href="/reservar" className="btn-primary">Reservar agora <ArrowRight size={16} /></Link>
              <Link href="/acomodacoes" className="btn border border-white/60 text-white hover:bg-white/10">Ver acomodações</Link>
            </div>
          </Container>
        </div>
        <Container className="relative -mt-12 pb-4">
          <SearchForm />
        </Container>
      </section>

      {/* Sobre */}
      <section className="py-20">
        <Container className="grid items-center gap-12 md:grid-cols-2">
          <div>
            <span className="eyebrow">A pousada</span>
            <h2 className="text-3xl font-semibold text-brown-dark sm:text-4xl">{settings.aboutTitle ?? est.name}</h2>
            <p className="mt-5 text-base leading-relaxed text-muted">{settings.aboutText ?? est.description}</p>
            <Link href="/sobre" className="btn-secondary mt-8">Conheça a pousada</Link>
          </div>
          {gallery[0] ? (
            <div className="relative aspect-[4/3] overflow-hidden rounded-[var(--radius)] shadow-[var(--shadow-soft)]">
              <Image src={gallery[0].url} alt={gallery[0].alt} fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
            </div>
          ) : null}
        </Container>
      </section>

      {/* Acomodações */}
      <section className="bg-sand/50 py-20">
        <Container>
          <SectionHeading eyebrow="Acomodações" title="Nossas acomodações" text="Quartos e suítes pensados para o descanso, com tarifa transparente e reserva direta com a pousada." />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {types.map((t) => <AccommodationCard key={t.id} item={t} />)}
          </div>
        </Container>
      </section>

      {/* Comodidades */}
      {amenityMap.size ? (
        <section className="py-20">
          <Container>
            <SectionHeading eyebrow="Comodidades" title="Tudo para a sua estadia" align="center" />
            <ul className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {[...amenityMap.entries()].map(([key, a]) => (
                <li key={key} className="flex items-center gap-3 rounded-2xl border border-sand-dark/70 bg-white px-4 py-4 text-sm text-brown-dark">
                  <span className="rounded-full bg-sand p-2 text-brand"><AmenityIcon name={a.icon} size={18} /></span>
                  {a.label}
                </li>
              ))}
            </ul>
          </Container>
        </section>
      ) : null}

      {/* Experiências */}
      {experiences.length ? (
        <section className="bg-sand/50 py-20">
          <Container>
            <SectionHeading eyebrow="Experiências" title="O que fazer por aqui" />
            <div className="grid gap-6 md:grid-cols-3">
              {experiences.map((e) => (
                <article key={e.id} className="card">
                  {e.imageUrl ? (
                    <div className="relative aspect-[4/3]"><Image src={e.imageUrl} alt={e.title} fill sizes="(min-width: 768px) 33vw, 100vw" className="object-cover" /></div>
                  ) : null}
                  <div className="p-5">
                    <h3 className="text-lg font-semibold text-brown-dark">{e.title}</h3>
                    <p className="mt-2 text-sm text-muted">{e.description}</p>
                  </div>
                </article>
              ))}
            </div>
          </Container>
        </section>
      ) : null}

      {/* Galeria */}
      {gallery.length > 1 ? (
        <section className="py-20">
          <Container>
            <SectionHeading eyebrow="Galeria" title="Um pouco do que você vai encontrar" />
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {gallery.slice(0, 8).map((g, i) => (
                <div key={g.id} className={`relative overflow-hidden rounded-xl ${i === 0 ? "col-span-2 row-span-2 aspect-square" : "aspect-square"}`}>
                  <Image src={g.url} alt={g.alt} fill sizes="(min-width: 768px) 25vw, 50vw" className="object-cover" />
                </div>
              ))}
            </div>
            <div className="mt-8 text-center"><Link href="/galeria" className="btn-secondary">Ver galeria completa</Link></div>
          </Container>
        </section>
      ) : null}

      {/* Depoimentos */}
      {testimonials.length ? (
        <section className="bg-sand/50 py-20">
          <Container>
            <SectionHeading eyebrow="Hóspedes" title="Quem já se hospedou" align="center" />
            <div className="grid gap-6 md:grid-cols-3">
              {testimonials.map((t) => (
                <blockquote key={t.id} className="card p-6">
                  <div className="flex gap-0.5 text-accent" aria-label={`${t.rating} de 5 estrelas`}>
                    {Array.from({ length: t.rating }).map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
                  </div>
                  <p className="mt-4 text-sm leading-relaxed text-graphite">“{t.text}”</p>
                  <footer className="mt-4 text-xs font-semibold text-muted">{t.author}</footer>
                </blockquote>
              ))}
            </div>
          </Container>
        </section>
      ) : null}

      <InstagramSection profileUrl={est.instagramUrl} />

      {/* Localização */}
      <section className="py-20">
        <Container className="grid items-center gap-10 md:grid-cols-2">
          <div>
            <span className="eyebrow">Localização</span>
            <h2 className="text-3xl font-semibold text-brown-dark sm:text-4xl">Como chegar</h2>
            <p className="mt-4 text-muted">
              {est.addressLine ? `${est.addressLine}, ` : ""}{est.city}{est.state ? ` – ${est.state}` : ""}
            </p>
            {est.mapsUrl ? <a href={est.mapsUrl} target="_blank" rel="noreferrer" className="btn-secondary mt-6">Abrir no mapa <ArrowRight size={16} /></a> : null}
          </div>
          {est.latitude && est.longitude ? (
            <iframe
              title="Mapa de localização"
              className="h-72 w-full rounded-[var(--radius)] border border-sand-dark"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              src={`https://www.openstreetmap.org/export/embed.html?bbox=${est.longitude - 0.02}%2C${est.latitude - 0.015}%2C${est.longitude + 0.02}%2C${est.latitude + 0.015}&layer=mapnik&marker=${est.latitude}%2C${est.longitude}`}
            />
          ) : null}
        </Container>
      </section>

      {/* CTA final */}
      <section className="pb-8">
        <Container>
          <div className="rounded-[var(--radius)] bg-brown-dark px-6 py-14 text-center text-white sm:px-12">
            <h2 className="text-3xl font-semibold sm:text-4xl">Reserve direto com a pousada</h2>
            <p className="mx-auto mt-3 max-w-xl text-white/80">Sem intermediários: melhor atendimento, condições especiais e contato direto com quem vai receber você.</p>
            <Link href="/reservar" className="btn-primary mt-8">Verificar disponibilidade <ArrowRight size={16} /></Link>
          </div>
        </Container>
      </section>
    </>
  );
}
