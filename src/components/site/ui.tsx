import Image from "next/image";
import Link from "next/link";
import { Users, BedDouble, Maximize2 } from "lucide-react";
import { formatBRL } from "@/lib/money";

export function Container({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`mx-auto max-w-6xl px-4 sm:px-6 ${className}`}>{children}</div>;
}

export function SectionHeading({
  eyebrow,
  title,
  text,
  align = "left",
}: {
  eyebrow?: string;
  title: string;
  text?: string;
  align?: "left" | "center";
}) {
  return (
    <div className={`mb-10 max-w-2xl ${align === "center" ? "mx-auto text-center" : ""}`}>
      {eyebrow ? <span className="eyebrow">{eyebrow}</span> : null}
      <h2 className="text-3xl font-semibold text-brown-dark sm:text-4xl">{title}</h2>
      {text ? <p className="mt-4 text-base leading-relaxed text-muted">{text}</p> : null}
    </div>
  );
}

export type AccommodationCardData = {
  slug: string;
  name: string;
  shortDescription: string | null;
  capacity: number;
  sizeM2: number | null;
  bedDescription: string | null;
  basePriceCents: number;
  images: { url: string; alt: string }[];
};

export function AccommodationCard({ item, href }: { item: AccommodationCardData; href?: string }) {
  const img = item.images[0];
  const target = href ?? `/acomodacoes/${item.slug}`;
  return (
    <article className="card group flex flex-col">
      <Link href={target} className="relative block aspect-[4/3] overflow-hidden bg-sand">
        {img ? (
          <Image
            src={img.url}
            alt={img.alt}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : null}
      </Link>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-xl font-semibold text-brown-dark">
          <Link href={target}>{item.name}</Link>
        </h3>
        {item.shortDescription ? <p className="mt-1 text-sm text-muted">{item.shortDescription}</p> : null}
        <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
          <li className="flex items-center gap-1"><Users size={14} /> até {item.capacity} hóspedes</li>
          {item.bedDescription ? <li className="flex items-center gap-1"><BedDouble size={14} /> {item.bedDescription}</li> : null}
          {item.sizeM2 ? <li className="flex items-center gap-1"><Maximize2 size={14} /> {item.sizeM2} m²</li> : null}
        </ul>
        <div className="mt-auto flex items-end justify-between pt-5">
          <p className="text-sm text-muted">
            a partir de <span className="text-lg font-semibold text-brown-dark">{formatBRL(item.basePriceCents)}</span>
            <span className="text-xs"> /noite</span>
          </p>
          <Link href={`/reservar?tipo=${item.slug}`} className="btn-primary btn-sm">
            Reservar
          </Link>
        </div>
      </div>
    </article>
  );
}

export function Notice({ kind = "info", children }: { kind?: "info" | "success" | "error" | "warning"; children: React.ReactNode }) {
  const styles = {
    info: "border-sand-dark bg-sand/60 text-brown-dark",
    success: "border-success/30 bg-success/10 text-success",
    error: "border-danger/30 bg-danger/10 text-danger",
    warning: "border-warning/30 bg-warning/10 text-warning",
  }[kind];
  return (
    <div role={kind === "error" ? "alert" : "status"} className={`rounded-xl border px-4 py-3 text-sm ${styles}`}>
      {children}
    </div>
  );
}

export function EmptyState({ title, text }: { title: string; text?: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-sand-dark bg-white/60 px-6 py-12 text-center">
      <p className="font-display text-xl text-brown-dark">{title}</p>
      {text ? <p className="mt-2 text-sm text-muted">{text}</p> : null}
    </div>
  );
}
