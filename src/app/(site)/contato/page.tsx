import type { Metadata } from "next";
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { Container } from "@/components/site/ui";
import { getSite } from "@/services/content";
import { whatsappLink } from "@/lib/whatsapp";
import { ContactForm } from "./contact-form";

export const metadata: Metadata = { title: "Contato" };

export default async function ContactPage() {
  const { establishment: est } = await getSite();
  const wa = whatsappLink(est.whatsapp, `Olá! Vim pelo site da ${est.name}.`);
  return (
    <Container className="py-16">
      <div className="grid gap-12 md:grid-cols-[1fr_1.2fr]">
        <div>
          <span className="eyebrow">Contato</span>
          <h1 className="text-4xl font-semibold text-brown-dark">Fale com a gente</h1>
          <p className="mt-4 text-muted">Dúvidas sobre datas, tarifas ou como chegar? Respondemos pelo WhatsApp, telefone ou e-mail.</p>
          <ul className="mt-8 space-y-4 text-sm">
            {wa ? <li><a href={wa} target="_blank" rel="noreferrer" className="flex items-center gap-3 text-brown-dark hover:text-brand"><MessageCircle size={18} /> WhatsApp</a></li> : null}
            {est.phone ? <li><a href={`tel:${est.phone.replace(/\D/g, "")}`} className="flex items-center gap-3 text-brown-dark hover:text-brand"><Phone size={18} /> {est.phone}</a></li> : null}
            {est.email ? <li><a href={`mailto:${est.email}`} className="flex items-center gap-3 text-brown-dark hover:text-brand"><Mail size={18} /> {est.email}</a></li> : null}
            {est.city ? <li className="flex items-start gap-3 text-brown-dark"><MapPin size={18} className="mt-0.5" /> <span>{est.addressLine ? `${est.addressLine}, ` : ""}{est.city}{est.state ? ` – ${est.state}` : ""}</span></li> : null}
          </ul>
        </div>
        <div className="card p-6"><ContactForm /></div>
      </div>
    </Container>
  );
}
