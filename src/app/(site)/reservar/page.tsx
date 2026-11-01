import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Users } from "lucide-react";
import { Container, EmptyState, Notice } from "@/components/site/ui";
import { SearchForm } from "@/components/site/search-form";
import { formatDateBR } from "@/lib/dates";
import { formatBRL } from "@/lib/money";
import { ReservationError, searchAvailability, searchSchema } from "@/services/reservations";

export const metadata: Metadata = { title: "Reservar" };

type SP = { checkIn?: string; checkOut?: string; guests?: string; tipo?: string };

export default async function ReservePage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const hasSearch = Boolean(sp.checkIn && sp.checkOut);
  let error: string | null = null;
  let results: Awaited<ReturnType<typeof searchAvailability>> = [];
  let parsed: ReturnType<typeof searchSchema.safeParse> | null = null;

  if (hasSearch) {
    parsed = searchSchema.safeParse({ checkIn: sp.checkIn, checkOut: sp.checkOut, guests: sp.guests ?? 2 });
    if (!parsed.success) error = parsed.error.issues[0]?.message ?? "Dados inválidos";
    else {
      try {
        results = await searchAvailability(parsed.data);
        if (sp.tipo) results = results.filter((r) => r.type.slug === sp.tipo);
      } catch (e) {
        error = e instanceof ReservationError ? e.message : "Não foi possível consultar a disponibilidade.";
      }
    }
  }

  const q = parsed?.success ? parsed.data : undefined;

  return (
    <Container className="py-12">
      <span className="eyebrow">Reservas</span>
      <h1 className="text-4xl font-semibold text-brown-dark">Verifique a disponibilidade</h1>
      <p className="mt-3 max-w-2xl text-muted">Escolha as datas e o número de hóspedes. Você envia uma solicitação e a pousada confirma por WhatsApp ou e-mail.</p>
      <div className="mt-8">
        <SearchForm defaults={{ checkIn: sp.checkIn, checkOut: sp.checkOut, guests: Number(sp.guests) || undefined }} typeSlug={sp.tipo} />
      </div>

      <div className="mt-10">
        {error ? <Notice kind="error">{error}</Notice> : null}
        {q && !error ? (
          results.length ? (
            <>
              <p className="mb-6 text-sm text-muted">
                {formatDateBR(q.checkIn)} → {formatDateBR(q.checkOut)} · {q.guests} {q.guests === 1 ? "hóspede" : "hóspedes"} · {results.length} {results.length === 1 ? "opção" : "opções"}
              </p>
              <ul className="space-y-5">
                {results.map((r) => {
                  const img = r.type.images[0];
                  const params = new URLSearchParams({ checkIn: q.checkIn, checkOut: q.checkOut, guests: String(q.guests) });
                  return (
                    <li key={r.type.id} className="card grid gap-0 md:grid-cols-[280px_1fr]">
                      <div className="relative aspect-[4/3] md:aspect-auto">
                        {img ? <Image src={img.url} alt={img.alt} fill sizes="(min-width: 768px) 280px, 100vw" className="object-cover" /> : null}
                      </div>
                      <div className="flex flex-col p-5">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <h2 className="text-xl font-semibold text-brown-dark"><Link href={`/acomodacoes/${r.type.slug}`}>{r.type.name}</Link></h2>
                            <p className="mt-1 text-sm text-muted">{r.type.shortDescription}</p>
                            <p className="mt-2 flex items-center gap-1 text-xs text-muted"><Users size={14} /> até {r.type.capacity} hóspedes · {r.availableUnits} {r.availableUnits === 1 ? "unidade disponível" : "unidades disponíveis"}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-semibold text-brown-dark">{formatBRL(r.quote.totalCents)}</p>
                            <p className="text-xs text-muted">{r.quote.nights} {r.quote.nights === 1 ? "noite" : "noites"} · média {formatBRL(Math.round(r.quote.totalCents / r.quote.nights))}/noite</p>
                          </div>
                        </div>
                        <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-5">
                          {r.meetsMinNights ? (
                            <Link href={`/reservar/${r.type.slug}?${params}`} className="btn-primary">Solicitar reserva <ArrowRight size={16} /></Link>
                          ) : (
                            <Notice kind="warning">Mínimo de {r.quote.minNightsRequired} noites para estas datas.</Notice>
                          )}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </>
          ) : (
            <EmptyState title="Sem disponibilidade para estas datas" text="Tente outras datas ou um número diferente de hóspedes. Se preferir, fale com a pousada pelo WhatsApp." />
          )
        ) : null}
      </div>
    </Container>
  );
}
