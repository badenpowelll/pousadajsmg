import { CalendarDays, Users, Search } from "lucide-react";
import { addDays, todayInTimezone } from "@/lib/dates";

/** Formulário de busca (GET /reservar). Funciona sem JavaScript. */
export function SearchForm({
  defaults,
  compact = false,
  typeSlug,
}: {
  defaults?: { checkIn?: string; checkOut?: string; guests?: number };
  compact?: boolean;
  typeSlug?: string;
}) {
  const today = todayInTimezone();
  const checkIn = defaults?.checkIn ?? today;
  const checkOut = defaults?.checkOut ?? addDays(checkIn, 2);
  return (
    <form
      action="/reservar"
      method="get"
      className={`grid gap-3 ${compact ? "grid-cols-2" : "rounded-2xl bg-white p-4 shadow-[var(--shadow-soft)] sm:grid-cols-[1fr_1fr_auto_auto] sm:p-5"}`}
      aria-label="Buscar disponibilidade"
    >
      {typeSlug ? <input type="hidden" name="tipo" value={typeSlug} /> : null}
      <label className="text-left">
        <span className="label flex items-center gap-1"><CalendarDays size={12} /> Entrada</span>
        <input className="field" type="date" name="checkIn" defaultValue={checkIn} min={today} required />
      </label>
      <label className="text-left">
        <span className="label flex items-center gap-1"><CalendarDays size={12} /> Saída</span>
        <input className="field" type="date" name="checkOut" defaultValue={checkOut} min={addDays(today, 1)} required />
      </label>
      <label className="text-left">
        <span className="label flex items-center gap-1"><Users size={12} /> Hóspedes</span>
        <select className={`field ${compact ? "w-full" : "sm:w-32"}`} name="guests" defaultValue={defaults?.guests ?? 2}>
          {Array.from({ length: 8 }, (_, i) => i + 1).map((n) => (
            <option key={n} value={n}>{n} {n === 1 ? "hóspede" : "hóspedes"}</option>
          ))}
        </select>
      </label>
      <button type="submit" className={`btn-primary self-end ${compact ? "w-full" : ""}`}>
        <Search size={16} /> Buscar
      </button>
    </form>
  );
}
