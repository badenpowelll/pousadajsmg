import Link from "next/link";
import { db } from "@/db";
import { Flash, PageTitle, Table } from "@/components/admin/ui";
import { formatBRL } from "@/lib/money";
import { toggleActive } from "./actions";

export default async function AccommodationsAdmin({ searchParams }: { searchParams: Promise<{ ok?: string; erro?: string }> }) {
  const sp = await searchParams;
  const types = await db.query.accommodationTypes.findMany({ with: { images: true }, orderBy: (t, { asc }) => [asc(t.sortOrder), asc(t.name)] });
  return (
    <>
      <PageTitle title="Acomodações"><Link href="/admin/acomodacoes/nova" className="btn-primary btn-sm">Nova acomodação</Link></PageTitle>
      <Flash ok={sp.ok} erro={sp.erro} />
      <Table head={["Nome", "Capacidade", "Unidades", "Tarifa base", "Fotos", "Status", ""]}>
        {types.map((t) => (
          <tr key={t.id}>
            <td className="px-4 py-2"><Link href={`/admin/acomodacoes/${t.id}`} className="font-medium text-brand">{t.name}</Link><span className="block text-xs text-muted">/{t.slug}</span></td>
            <td className="px-4 py-2">{t.capacity}</td>
            <td className="px-4 py-2">{t.units}</td>
            <td className="px-4 py-2">{formatBRL(t.basePriceCents)}</td>
            <td className="px-4 py-2">{t.images.length}</td>
            <td className="px-4 py-2">{t.active ? <span className="text-success">Ativa</span> : <span className="text-muted">Inativa</span>}</td>
            <td className="px-4 py-2 text-right">
              <form action={toggleActive}><input type="hidden" name="id" value={t.id} /><input type="hidden" name="active" value={String(!t.active)} /><button className="btn-ghost btn-sm">{t.active ? "Desativar" : "Ativar"}</button></form>
            </td>
          </tr>
        ))}
      </Table>
    </>
  );
}
