import { addDays, toUtcDate } from "@/lib/dates";

const WEEK = ["D", "S", "T", "Q", "Q", "S", "S"];

/** Grade de 60 dias: verde = há unidades, cinza = esgotado. Server component. */
export function AvailabilityCalendar({ calendar, from }: { calendar: Record<string, number>; from: string }) {
  const days = Object.keys(calendar).sort();
  if (!days.length) return null;
  const firstWeekday = toUtcDate(from).getUTCDay();
  const months = new Map<string, string[]>();
  for (const d of days) {
    const key = d.slice(0, 7);
    months.set(key, [...(months.get(key) ?? []), d]);
  }
  return (
    <div className="mt-4 space-y-6">
      {[...months.entries()].map(([month, list], mi) => {
        const label = new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric", timeZone: "UTC" }).format(toUtcDate(`${month}-01`));
        const offset = mi === 0 ? firstWeekday : toUtcDate(list[0]).getUTCDay();
        return (
          <div key={month}>
            <p className="mb-2 text-sm font-semibold text-brown-dark capitalize">{label}</p>
            <div className="grid grid-cols-7 gap-1 text-center text-[11px] text-muted">
              {WEEK.map((w, i) => <span key={i}>{w}</span>)}
              {Array.from({ length: offset }).map((_, i) => <span key={`o${i}`} />)}
              {list.map((d) => {
                const n = calendar[d];
                return (
                  <span
                    key={d}
                    title={`${d}: ${n} ${n === 1 ? "unidade" : "unidades"}`}
                    className={`rounded-md py-1.5 text-xs ${n > 0 ? "bg-success/15 text-success" : "bg-sand-dark/60 text-muted line-through"}`}
                  >
                    {Number(d.slice(8))}
                  </span>
                );
              })}
            </div>
          </div>
        );
      })}
      <p className="text-xs text-muted">Última noite exibida: {addDays(days.at(-1)!, 0)}. Disponibilidade sujeita a confirmação.</p>
    </div>
  );
}
