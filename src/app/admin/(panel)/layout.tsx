import type { Metadata } from "next";
import Link from "next/link";
import { BedDouble, CalendarRange, Home, Inbox, LayoutDashboard, LogOut, Settings, Tag, Images } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getSite } from "@/services/content";
import { logout } from "./actions";

export const metadata: Metadata = { title: { default: "Painel", template: "%s · Painel" }, robots: { index: false } };

const nav = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/reservas", label: "Reservas", icon: CalendarRange },
  { href: "/admin/acomodacoes", label: "Acomodações", icon: BedDouble },
  { href: "/admin/tarifas", label: "Tarifas e bloqueios", icon: Tag },
  { href: "/admin/conteudo", label: "Galeria e Instagram", icon: Images },
  { href: "/admin/mensagens", label: "Mensagens", icon: Inbox },
  { href: "/admin/configuracoes", label: "Configurações", icon: Settings },
];

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const { establishment } = await getSite();
  return (
    <div className="min-h-screen bg-sand/30 md:grid md:grid-cols-[240px_1fr]">
      <aside className="border-b border-sand-dark bg-white md:border-r md:border-b-0">
        <div className="px-5 py-5">
          <p className="text-xs tracking-wide text-muted uppercase">Painel</p>
          <p className="font-display text-lg font-semibold text-brown-dark">{establishment.name}</p>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-3 md:flex-col md:pb-0" aria-label="Painel">
          {nav.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} className="flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm text-graphite hover:bg-sand">
              <Icon size={16} /> {label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto px-5 py-5 text-xs text-muted">
          <p className="truncate">{user.name} · {user.role === "OWNER" ? "Proprietário" : "Equipe"}</p>
          <div className="mt-2 flex gap-3">
            <Link href="/" className="flex items-center gap-1 hover:text-brand"><Home size={14} /> Ver site</Link>
            <form action={logout}><button className="flex items-center gap-1 hover:text-brand"><LogOut size={14} /> Sair</button></form>
          </div>
        </div>
      </aside>
      <main className="px-4 py-8 sm:px-8">{children}</main>
    </div>
  );
}
