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

export function SiteHeader({ name, logoUrl }: { name: string; logoUrl: string | null }) {
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
    <header
      className={`sticky top-0 z-40 transition-colors duration-300 ${
        scrolled || open ? "bg-cream/95 shadow-sm backdrop-blur" : "bg-cream/80 backdrop-blur"
      }`}
    >
      <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-3" aria-label={`${name} — página inicial`}>
          {logoUrl ? (
            <span className="flex h-12 items-center rounded-lg bg-graphite px-2 shadow-sm">
              <Image src={logoUrl} alt={name} width={84} height={60} className="h-10 w-auto object-contain" priority />
            </span>
          ) : null}
          <span className="font-display text-xl font-semibold tracking-tight text-brown-dark sm:text-2xl">{name}</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Principal">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              aria-current={pathname === l.href ? "page" : undefined}
              className={`rounded-full px-3 py-2 text-sm transition-colors hover:bg-sand ${
                pathname === l.href ? "font-semibold text-brand" : "text-graphite"
              }`}
            >
              {l.label}
            </Link>
          ))}
          <Link href="/conta" aria-label="Minha conta" className="rounded-full p-2 text-graphite hover:bg-sand"><UserRound size={18} /></Link>
          <Link href="/reservar" className="btn-primary btn-sm ml-1">
            Reservar
          </Link>
        </nav>

        <button
          type="button"
          className="rounded-full p-2 hover:bg-sand md:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? "Fechar menu" : "Abrir menu"}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open ? (
        <nav id="mobile-nav" className="border-t border-sand-dark/60 px-4 pb-4 md:hidden" aria-label="Principal">
          <ul className="flex flex-col py-2">
            {links.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className={`block rounded-lg px-3 py-3 text-base ${pathname === l.href ? "font-semibold text-brand" : ""}`}
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
          <Link href="/conta" className="mb-2 block rounded-lg px-3 py-3 text-base">Minha conta</Link>
          <Link href="/reservar" className="btn-primary w-full">
            Reservar agora
          </Link>
        </nav>
      ) : null}
    </header>
  );
}
