import type { Metadata } from "next";
import Image from "next/image";
import { Container } from "@/components/site/ui";
import { getSite, listGallery } from "@/services/content";

export const metadata: Metadata = { title: "Sobre" };

export default async function AboutPage() {
  const [{ establishment: est, settings }, gallery] = await Promise.all([getSite(), listGallery()]);
  return (
    <Container className="py-16">
      <div className="grid items-start gap-12 md:grid-cols-2">
        <div>
          <span className="eyebrow">Sobre</span>
          <h1 className="text-4xl font-semibold text-brown-dark">{settings.aboutTitle ?? est.name}</h1>
          <div className="prose-site mt-6 leading-relaxed text-graphite">
            {(settings.aboutText ?? est.description ?? "").split("\n").map((p, i) => <p key={i}>{p}</p>)}
          </div>
          <dl className="mt-8 grid grid-cols-2 gap-4 text-sm">
            <div className="rounded-xl bg-sand/60 p-4"><dt className="text-muted">Check-in</dt><dd className="font-semibold text-brown-dark">a partir das {est.checkInTime}</dd></div>
            <div className="rounded-xl bg-sand/60 p-4"><dt className="text-muted">Check-out</dt><dd className="font-semibold text-brown-dark">até as {est.checkOutTime}</dd></div>
          </dl>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {gallery.slice(0, 4).map((g) => (
            <div key={g.id} className="relative aspect-square overflow-hidden rounded-xl"><Image src={g.url} alt={g.alt} fill sizes="25vw" className="object-cover" /></div>
          ))}
        </div>
      </div>
    </Container>
  );
}
