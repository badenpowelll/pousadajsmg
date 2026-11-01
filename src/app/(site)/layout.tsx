import type { Metadata } from "next";
import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";
import { WhatsAppButton } from "@/components/site/whatsapp-button";
import { getSite } from "@/services/content";

// Conteúdo vem do banco e muda pelo painel: renderizar sob demanda (também evita acesso ao banco no build).
export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const { establishment: est, settings } = await getSite();
  return {
    title: { default: `${est.name}${est.city ? ` — ${est.city}` : ""}`, template: `%s · ${est.name}` },
    description: est.description ?? settings.heroSubtitle,
    openGraph: { title: est.name, description: est.description ?? undefined, images: settings.heroImageUrl ? [settings.heroImageUrl] : [] },
  };
}

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const { establishment: est, settings } = await getSite();
  const brandVars = { "--color-brand": settings.primaryColor, "--color-accent": settings.accentColor } as React.CSSProperties;
  return (
    <div style={brandVars} className="flex min-h-screen flex-col">
      <SiteHeader name={est.name} logoUrl={settings.logoUrl} tagline={[est.city, est.state].filter(Boolean).join(" · ")} />
      <main className="flex-1">{children}</main>
      <SiteFooter est={est} logoUrl={settings.logoUrl} />
      <WhatsAppButton number={est.whatsapp} message={`Olá! Vim pelo site da ${est.name} e gostaria de informações sobre hospedagem.`} />
    </div>
  );
}
