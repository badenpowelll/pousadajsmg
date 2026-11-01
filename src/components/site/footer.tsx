import Image from "next/image";
import Link from "next/link";
import { MapPin, Phone, Mail } from "lucide-react";
import { InstagramIcon, FacebookIcon } from "./social-icons";
import type { Establishment } from "@/db/schema";

export function SiteFooter({ est, logoUrl }: { est: Establishment; logoUrl?: string | null }) {
  return (
    <footer className="mt-24 border-t border-sand-dark/60 bg-sand/60">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-3">
        <div>
          {logoUrl ? <div className="mb-3 inline-flex rounded-lg bg-graphite px-3 py-2"><Image src={logoUrl} alt={est.name} width={120} height={86} className="h-14 w-auto object-contain" /></div> : null}
          <p className="font-display text-xl font-semibold text-brown-dark">{est.name}</p>
          {est.tagline ? <p className="mt-2 text-sm text-muted">{est.tagline}</p> : null}
          <div className="mt-4 flex gap-3">
            {est.instagramUrl ? (
              <a href={est.instagramUrl} target="_blank" rel="noreferrer" aria-label="Instagram" className="rounded-full bg-white p-2 text-brown-dark hover:text-brand">
                <InstagramIcon />
              </a>
            ) : null}
            {est.facebookUrl ? (
              <a href={est.facebookUrl} target="_blank" rel="noreferrer" aria-label="Facebook" className="rounded-full bg-white p-2 text-brown-dark hover:text-brand">
                <FacebookIcon />
              </a>
            ) : null}
          </div>
        </div>

        <div className="text-sm">
          <p className="mb-3 font-semibold text-brown-dark">Contato</p>
          <ul className="space-y-2 text-muted">
            {est.addressLine || est.city ? (
              <li className="flex items-start gap-2">
                <MapPin size={16} className="mt-0.5 shrink-0" />
                <span>
                  {est.addressLine ? `${est.addressLine}, ` : ""}
                  {est.city}
                  {est.state ? ` – ${est.state}` : ""}
                </span>
              </li>
            ) : null}
            {est.phone ? (
              <li className="flex items-center gap-2">
                <Phone size={16} />
                <a href={`tel:${est.phone.replace(/\D/g, "")}`}>{est.phone}</a>
              </li>
            ) : null}
            {est.email ? (
              <li className="flex items-center gap-2">
                <Mail size={16} />
                <a href={`mailto:${est.email}`}>{est.email}</a>
              </li>
            ) : null}
            <li>
              Check-in {est.checkInTime} · Check-out {est.checkOutTime}
            </li>
          </ul>
        </div>

        <div className="text-sm">
          <p className="mb-3 font-semibold text-brown-dark">Informações</p>
          <ul className="space-y-2 text-muted">
            <li><Link href="/acomodacoes" className="hover:text-brand">Acomodações</Link></li>
            <li><Link href="/reservar" className="hover:text-brand">Reservar</Link></li>
            <li><Link href="/politicas" className="hover:text-brand">Políticas de hospedagem</Link></li>
            <li><Link href="/privacidade" className="hover:text-brand">Privacidade</Link></li>
            <li><Link href="/termos" className="hover:text-brand">Termos</Link></li>
            <li><Link href="/admin" className="hover:text-brand">Área administrativa</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-sand-dark/60 py-5 text-center text-xs text-muted">
        © {new Date().getFullYear()} {est.name}. Todos os direitos reservados.
      </div>
    </footer>
  );
}
