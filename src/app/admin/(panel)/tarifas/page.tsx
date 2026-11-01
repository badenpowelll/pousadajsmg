import { db } from "@/db";
import { Card, Flash, PageTitle, Table } from "@/components/admin/ui";
import { addDays, formatDateBR, todayInTimezone } from "@/lib/dates";
import { formatBRL } from "@/lib/money";
import { availabilityCalendar } from "@/services/availability";
import { deleteBlock, deleteRatePlan, saveBlock, saveRatePlan } from "./actions";

export default async function RatesPage({ searchParams }: { searchParams: Promise<{ ok?: string; erro?: string; tipo?: string }> }) {
  const sp = await searchParams;
  const types = await db.query.accommodationTypes.findMany({ with: { ratePlans: { orderBy: (r, { asc }) => [asc(r.startDate)] }, blocks: { orderBy: (b, { asc }) => [asc(b.startDate)] } }, orderBy: (t, { asc }) => [asc(t.sortOrder)] });
  const today = todayInTimezone();
  const selected = types.find((t) => t.id === sp.tipo) ?? types[0];
  const calendar = selected ? await availabilityCalendar(selected.id, today, addDays(today, 42)) : {};

  return (
    <>
      <PageTitle title="Tarifas, bloqueios e ocupação" />
      <Flash ok={sp.ok} erro={sp.erro} />

      <section className="mb-8">
        <h2 className="mb-3 text-lg font-semibold text-brown-dark">Ocupação dos próximos 42 dias</h2>
        <form method="get" className="mb-3"><select name="tipo" className="field w-72" defaultValue={selected?.id}>{types.map((t) => <option key={t.id} value={t.id}>{t.name} ({t.units} un.)</option>)}</select> <button className="btn-secondary btn-sm ml-2">Ver</button></form>
        {selected ? (
          <div className="grid grid-cols-7 gap-1 text-center text-xs sm:grid-cols-14">
            {Object.entries(calendar).map(([d, free]) => (
              <div key={d} className={`rounded-md py-2 ${free === 0 ? "bg-danger/15 text-danger" : free < selected.units ? "bg-warning/15 text-warning" : "bg-success/15 text-success"}`} title={d}>
                <div className="font-semibold">{Number(d.slice(8))}/{Number(d.slice(5, 7))}</div><div>{free} livre{free === 1 ? "" : "s"}</div>
              </div>
            ))}
          </div>
        ) : null}
      </section>

      <div className="grid gap-8 lg:grid-cols-2">
        <section>
          <h2 className="mb-3 text-lg font-semibold text-brown-dark">Tarifas por período</h2>
          <p className="mb-3 text-xs text-muted">Substituem a tarifa base nas datas indicadas (início e fim inclusivos). Prioridade maior vence em sobreposições.</p>
          <Card className="mb-4">
            <form action={saveRatePlan} className="grid gap-3 sm:grid-cols-2">
              <label className="sm:col-span-2"><span className="label">Acomodação</span><select name="accommodationTypeId" className="field" required>{types.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}</select></label>
              <label className="sm:col-span-2"><span className="label">Nome</span><input name="name" className="field" placeholder="Alta temporada" required /></label>
              <label><span className="label">Início</span><input name="startDate" type="date" className="field" required /></label>
              <label><span className="label">Fim (inclusivo)</span><input name="endDate" type="date" className="field" required /></label>
              <label><span className="label">Preço/noite (R$)</span><input name="price" className="field" placeholder="350,00" required /></label>
              <label><span className="label">Mínimo de noites</span><input name="minNights" type="number" min={1} className="field" defaultValue={1} /></label>
              <label><span className="label">Prioridade</span><input name="priority" type="number" min={0} className="field" defaultValue={10} /></label>
              <label className="flex items-end gap-2 pb-3 text-sm"><input type="checkbox" name="active" defaultChecked /> Ativa</label>
              <button className="btn-primary btn-sm sm:col-span-2">Adicionar tarifa</button>
            </form>
          </Card>
          <Table head={["Acomodação", "Nome", "Período", "Preço", "Mín.", ""]}>
            {types.flatMap((t) => t.ratePlans.map((r) => (
              <tr key={r.id} className={r.active ? "" : "opacity-50"}>
                <td className="px-4 py-2">{t.name}</td><td className="px-4 py-2">{r.name}</td>
                <td className="px-4 py-2 whitespace-nowrap">{formatDateBR(r.startDate)} – {formatDateBR(r.endDate)}</td>
                <td className="px-4 py-2">{formatBRL(r.priceCents)}</td><td className="px-4 py-2">{r.minNights}</td>
                <td className="px-4 py-2"><form action={deleteRatePlan}><input type="hidden" name="id" value={r.id} /><button className="text-xs text-danger">Remover</button></form></td>
              </tr>
            )))}
          </Table>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-brown-dark">Bloqueios de datas</h2>
          <p className="mb-3 text-xs text-muted">Manutenção ou uso próprio. O fim funciona como check-out (exclusivo).</p>
          <Card className="mb-4">
            <form action={saveBlock} className="grid gap-3 sm:grid-cols-2">
              <label className="sm:col-span-2"><span className="label">Acomodação</span><select name="accommodationTypeId" className="field" required>{types.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}</select></label>
              <label><span className="label">Início</span><input name="startDate" type="date" className="field" required /></label>
              <label><span className="label">Fim (exclusivo)</span><input name="endDate" type="date" className="field" required /></label>
              <label><span className="label">Unidades bloqueadas</span><input name="units" type="number" min={1} className="field" defaultValue={1} /></label>
              <label><span className="label">Motivo</span><input name="reason" className="field" placeholder="Manutenção" /></label>
              <button className="btn-primary btn-sm sm:col-span-2">Adicionar bloqueio</button>
            </form>
          </Card>
          <Table head={["Acomodação", "Período", "Unid.", "Motivo", ""]}>
            {types.flatMap((t) => t.blocks.map((b) => (
              <tr key={b.id}>
                <td className="px-4 py-2">{t.name}</td>
                <td className="px-4 py-2 whitespace-nowrap">{formatDateBR(b.startDate)} – {formatDateBR(b.endDate)}</td>
                <td className="px-4 py-2">{b.units}</td><td className="px-4 py-2">{b.reason ?? "—"}</td>
                <td className="px-4 py-2"><form action={deleteBlock}><input type="hidden" name="id" value={b.id} /><button className="text-xs text-danger">Remover</button></form></td>
              </tr>
            )))}
          </Table>
        </section>
      </div>
    </>
  );
}
