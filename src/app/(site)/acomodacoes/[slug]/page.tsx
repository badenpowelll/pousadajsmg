import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { BedDouble, Maximize2, Users } from "lucide-react";
import { Container } from "@/components/site/ui";
import { SearchForm } from "@/components/site/search-form";
import { AmenityIcon } from "@/components/site/amenity-icon";
import { AvailabilityCalendar } from "@/components/site/availability-calendar";
import { getAccommodationBySlug, getSite } from "@/services/content";
import { availabilityCalendar } from "@/services/availability";
import { addDays, todayInTimezone, formatDateBR } from "@/lib/dates";
import { formatBRL } from "@/lib/money";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const type = await getAccommodationBySlug(slug);
  if (!type) return { title: "Acomodação" };
  return { title: type.name, description: type.shortDescription ?? undefined };
}

export default async function AccommodationPage({ params }: Props) {
  const { slug } = await params;
  const type = await getAccommodationBySlug(slug);
  if (!type || !type.active) notFound();
  const { settings } = await getSite();
  const today = todayInTimezone();
  const calendar = await availabilityCalendar(type.id, today, addDays(today, 60));
  const activePlans = type.ratePlans.filter((p) => p.active && p.endDate >= today).sort((a, b) => a.startDate.localeCompare(b.startDate));

  return (
    <Container className="py-12">
      <div className="grid gap-3 md:grid-cols-[2fr_1fr]">
        {type.images.slice(0, 3).map((img, i) => (
          <div key={img.id} className={`relative overflow-hidden rounded-[var(--radius)] ${i === 0 ? "aspect-[16/10] md:row-span-2" : "aspect-[16/10] md:aspect-auto md:min-h-0"}`}>
            <Image src={img.url} alt={img.alt} fill sizes="(min-width: 768px) 66vw, 100vw" className="object-cover" priority={i === 0} />
          </div>
        ))}
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_380px]">
        <div>
          <h1 className="text-4xl font-semibold text-brown-dark">{type.name}</h1>
          <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-sm text-muted">
            <li className="flex items-center gap-1"><Users size={16} /> até {type.capacity} hóspedes</li>
            {type.bedDescription ? <li className="flex items-center gap-1"><BedDouble size={16} /> {type.bedDescription}</li> : null}
            {type.sizeM2 ? <li className="flex items-center gap-1"><Maximize2 size={16} /> {type.sizeM2} m²</li> : null}
            <li>{type.units} {type.units === 1 ? "unidade" : "unidades"}</li>
          </ul>
          <div className="prose-site mt-6 text-base leading-relaxed text-graphite">
            {(type.description ?? "").split("\n").map((p, i) => <p key={i}>{p}</p>)}
          </div>

          {type.amenities.length ? (
            <section className="mt-10">
              <h2 className="text-2xl font-semibold text-brown-dark">Comodidades</h2>
              <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {type.amenities.map(({ amenity }) => (
                  <li key={amenity.id} className="flex items-center gap-2 text-sm text-graphite">
                    <span className="text-brand"><AmenityIcon name={amenity.icon} size={18} /></span>{amenity.label}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <section className="mt-10">
            <h2 className="text-2xl font-semibold text-brown-dark">Tarifas</h2>
            <p className="mt-2 text-sm text-muted">Tarifa base de <strong className="text-brown-dark">{formatBRL(type.basePriceCents)}</strong> por noite. O valor exato da estadia é calculado na busca.</p>
            {activePlans.length ? (
              <ul className="mt-4 divide-y divide-sand-dark rounded-xl border border-sand-dark bg-white text-sm">
                {activePlans.map((p) => (
                  <li key={p.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
                    <span><strong>{p.name}</strong> · {formatDateBR(p.startDate)} a {formatDateBR(p.endDate)}{p.minNights > 1 ? ` · mínimo ${p.minNights} noites` : ""}</span>
                    <span className="font-semibold text-brown-dark">{formatBRL(p.priceCents)}/noite</span>
                  </li>
                ))}
              </ul>
            ) : null}
          </section>

          <section className="mt-10">
            <h2 className="text-2xl font-semibold text-brown-dark">Disponibilidade nos próximos 60 dias</h2>
            <AvailabilityCalendar calendar={calendar} from={today} />
          </section>

          {settings.housePolicies ? (
            <section className="mt-10">
              <h2 className="text-2xl font-semibold text-brown-dark">Condições de hospedagem</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted">{settings.housePolicies}</p>
            </section>
          ) : null}
        </div>

        <aside className="h-fit lg:sticky lg:top-24">
          <div className="card p-5">
            <p className="text-sm text-muted">a partir de</p>
            <p className="text-3xl font-semibold text-brown-dark">{formatBRL(type.basePriceCents)} <span className="text-sm font-normal text-muted">/noite</span></p>
            <div className="mt-5">
              <SearchForm compact typeSlug={type.slug} />
            </div>
            <p className="mt-4 text-xs text-muted">A solicitação de reserva é confirmada pela pousada. Nenhum pagamento é cobrado pelo site.</p>
          </div>
        </aside>
      </div>
    </Container>
  );
}
