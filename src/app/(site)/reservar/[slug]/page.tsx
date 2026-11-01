import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Container, Notice } from "@/components/site/ui";
import { formatDateLongBR } from "@/lib/dates";
import { formatBRL } from "@/lib/money";
import { getAccommodationBySlug } from "@/services/content";
import { unitsAvailable } from "@/services/availability";
import { quoteStay } from "@/services/pricing";
import { ReservationError, assertSearchDatesNotPast, searchSchema } from "@/services/reservations";
import { db } from "@/db";
import { ReserveForm } from "./reserve-form";

export const metadata: Metadata = { title: "Solicitar reserva" };

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<{ checkIn?: string; checkOut?: string; guests?: string }> };

export default async function ReserveTypePage({ params, searchParams }: Props) {
  const { slug } = await params;
  const sp = await searchParams;
  const parsed = searchSchema.safeParse({ checkIn: sp.checkIn, checkOut: sp.checkOut, guests: sp.guests ?? 2 });
  if (!parsed.success) redirect(`/reservar?tipo=${slug}`);
  const type = await getAccommodationBySlug(slug);
  if (!type || !type.active) notFound();

  let blocker: string | null = null;
  try {
    assertSearchDatesNotPast(parsed.data);
  } catch (e) {
    blocker = e instanceof ReservationError ? e.message : "Datas inválidas";
  }
  if (type.capacity < parsed.data.guests) blocker = `Esta acomodação comporta até ${type.capacity} hóspedes.`;
  const quote = quoteStay(type.basePriceCents, type.ratePlans, parsed.data.checkIn, parsed.data.checkOut);
  if (!blocker && quote.nights < quote.minNightsRequired) blocker = `Mínimo de ${quote.minNightsRequired} noites para este período.`;
  const available = blocker ? 0 : await unitsAvailable(db, type, parsed.data.checkIn, parsed.data.checkOut);
  if (!blocker && available <= 0) blocker = "Não há unidades disponíveis para as datas escolhidas.";
  const img = type.images[0];

  return (
    <Container className="py-12">
      <Link href={`/reservar?checkIn=${parsed.data.checkIn}&checkOut=${parsed.data.checkOut}&guests=${parsed.data.guests}`} className="text-sm text-muted hover:text-brand">← Voltar aos resultados</Link>
      <h1 className="mt-3 text-4xl font-semibold text-brown-dark">Solicitar reserva</h1>
      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_400px]">
        <div className="card p-6">
          {blocker ? <Notice kind="error">{blocker}</Notice> : <ReserveForm accommodationTypeId={type.id} checkIn={parsed.data.checkIn} checkOut={parsed.data.checkOut} guests={parsed.data.guests} />}
        </div>
        <aside className="card h-fit">
          {img ? <div className="relative aspect-[16/10]"><Image src={img.url} alt={img.alt} fill sizes="400px" className="object-cover" /></div> : null}
          <div className="p-5">
            <h2 className="text-xl font-semibold text-brown-dark">{type.name}</h2>
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between"><dt className="text-muted">Check-in</dt><dd>{formatDateLongBR(parsed.data.checkIn)}</dd></div>
              <div className="flex justify-between"><dt className="text-muted">Check-out</dt><dd>{formatDateLongBR(parsed.data.checkOut)}</dd></div>
              <div className="flex justify-between"><dt className="text-muted">Hóspedes</dt><dd>{parsed.data.guests}</dd></div>
              <div className="flex justify-between"><dt className="text-muted">Noites</dt><dd>{quote.nights}</dd></div>
            </dl>
            <details className="mt-4 text-sm">
              <summary className="cursor-pointer text-muted">Ver valor por noite</summary>
              <ul className="mt-2 space-y-1">
                {quote.breakdown.map((n) => <li key={n.date} className="flex justify-between"><span>{n.date.split("-").reverse().join("/")}</span><span>{formatBRL(n.priceCents)}</span></li>)}
              </ul>
            </details>
            <div className="mt-4 flex items-center justify-between border-t border-sand-dark pt-4">
              <span className="font-semibold text-brown-dark">Total</span>
              <span className="text-2xl font-semibold text-brown-dark">{formatBRL(quote.totalCents)}</span>
            </div>
          </div>
        </aside>
      </div>
    </Container>
  );
}
