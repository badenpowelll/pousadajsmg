import type { AccommodationType } from "@/db/schema";
import { saveAccommodation } from "@/app/admin/(panel)/acomodacoes/actions";

type Amenity = { id: string; label: string };

export function AccommodationForm({ type, amenities, selected }: { type?: AccommodationType; amenities: Amenity[]; selected: Set<string> }) {
  const price = type ? (type.basePriceCents / 100).toFixed(2).replace(".", ",") : "";
  return (
    <form action={saveAccommodation} className="space-y-4">
      {type ? <input type="hidden" name="id" value={type.id} /> : null}
      <div className="grid gap-4 sm:grid-cols-2">
        <label><span className="label">Nome</span><input name="name" className="field" defaultValue={type?.name} required /></label>
        <label><span className="label">Slug (URL)</span><input name="slug" className="field" defaultValue={type?.slug} pattern="[a-z0-9-]+" required placeholder="suite-varanda" /></label>
      </div>
      <label><span className="label">Descrição curta</span><input name="shortDescription" className="field" defaultValue={type?.shortDescription ?? ""} maxLength={160} /></label>
      <label><span className="label">Descrição completa</span><textarea name="description" rows={5} className="field" defaultValue={type?.description ?? ""} /></label>
      <div className="grid gap-4 sm:grid-cols-4">
        <label><span className="label">Capacidade</span><input name="capacity" type="number" min={1} className="field" defaultValue={type?.capacity ?? 2} required /></label>
        <label><span className="label">Unidades</span><input name="units" type="number" min={1} className="field" defaultValue={type?.units ?? 1} required /></label>
        <label><span className="label">Tarifa base (R$/noite)</span><input name="basePrice" className="field" defaultValue={price} placeholder="250,00" required /></label>
        <label><span className="label">Área (m²)</span><input name="sizeM2" type="number" min={0} className="field" defaultValue={type?.sizeM2 ?? ""} /></label>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label><span className="label">Camas</span><input name="bedDescription" className="field" defaultValue={type?.bedDescription ?? ""} placeholder="1 cama de casal + 1 solteiro" /></label>
        <label><span className="label">Ordem de exibição</span><input name="sortOrder" type="number" min={0} className="field" defaultValue={type?.sortOrder ?? 0} /></label>
      </div>
      <fieldset>
        <legend className="label">Comodidades</legend>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {amenities.map((a) => (
            <label key={a.id} className="flex items-center gap-2 text-sm"><input type="checkbox" name="amenities" value={a.id} defaultChecked={selected.has(a.id)} /> {a.label}</label>
          ))}
        </div>
      </fieldset>
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="active" defaultChecked={type?.active ?? true} /> Ativa (visível no site e disponível para reservas)</label>
      <button className="btn-primary">Salvar</button>
    </form>
  );
}
