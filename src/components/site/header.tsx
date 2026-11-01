"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X, UserRound } from "lucide-react";

const links = [
  { href: "/", label: "Início" },
  { href: "/acomodacoes", label: "Acomodações" },
  { href: "/experiencias", label: "Experiências" },
  { href: "/galeria", label: "Galeria" },
  { href: "/sobre", label: "Sobre" },
  { href: "/contato", label: "Contato" },
];

export function SiteHeader({ name, logoUrl, tagline }: { name: string; logoUrl: string | null; tagline?: string | null }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  return (
    <header className="sticky top-0 z-40 bg-graphite text-cream shadow-md">
      <div className={`mx-auto flex max-w-6xl items-center justify-between px-4 transition-[height] duration-300 sm:px-6 ${scrolled ? "h-16" : "h-20 sm:h-24"}`}
        style={{ background: "radial-gradient(ellipse at 8% 50%, rgba(212,160,23,0.35), rgba(43,42,40,0) 42%)" }}>
        <Link href="/" className="flex items-center gap-3 sm:gap-4" aria-label={`${name} — página inicial`}>
          {logoUrl ? (
            <span className={`flex items-center justify-center overflow-hidden rounded-full bg-black ring-2 ring-accent shadow-[0_0_28px_rgba(212,160,23,0.55)] transition-all duration-300 ${scrolled ? "h-11 w-11" : "h-14 w-14 sm:h-16 sm:w-16"}`}>
              <Image src={logoUrl} alt="" width={96} height={70} className={`w-auto object-contain ${scrolled ? "h-7" : "h-9 sm:h-11"}`} priority />
            </span>
          ) : null}
          <span className="flex flex-col leading-none">
            <span className={`font-display font-bold uppercase tracking-[0.2em] text-cream ${scrolled ? "text-base sm:text-lg" : "text-lg sm:text-2xl"}`}>{name}</span>
            {tagline ? <span className="mt-1.5 hidden text-[10px] tracking-[0.35em] text-accent uppercase sm:block">{tagline}</span> : null}
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Principal">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              aria-current={pathname === l.href ? "page" : undefined}
              className={`rounded-full px-3 py-2 text-xs tracking-[0.12em] uppercase transition-colors hover:text-accent ${
                pathname === l.href ? "font-semibold text-accent" : "text-cream/85"
              }`}
            >
              {l.label}
            </Link>
          ))}
          <Link href="/conta" aria-label="Minha conta" className="rounded-full p-2 text-cream/85 hover:text-accent"><UserRound size={18} /></Link>
          <Link href="/reservar" className="btn btn-sm ml-1 bg-accent font-bold text-graphite hover:bg-gold">
            Reservar
          </Link>
        </nav>

        <button
          type="button"
          className="rounded-full p-2 text-cream hover:bg-white/10 md:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? "Fechar menu" : "Abrir menu"}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open ? (
        <nav id="mobile-nav" className="border-t border-white/10 bg-graphite px-4 pb-4 text-cream md:hidden" aria-label="Principal">
          <ul className="flex flex-col py-2">
            {links.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className={`block rounded-lg px-3 py-3 text-base ${pathname === l.href ? "font-semibold text-accent" : ""}`}
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
          <Link href="/conta" className="mb-2 block rounded-lg px-3 py-3 text-base">Minha conta</Link>
          <Link href="/reservar" className="btn w-full bg-accent font-bold text-graphite">
            Reservar agora
          </Link>
        </nav>
      ) : null}
    </header>
  );
}
