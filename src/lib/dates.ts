// Datas de hospedagem são "datas civis" (YYYY-MM-DD) no fuso do estabelecimento.
// Nunca convertemos para Date com hora local para evitar deslocamento de dia.

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export function isIsoDate(value: string): boolean {
  if (!ISO_DATE.test(value)) return false;
  const [y, m, d] = value.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d;
}

export function toUtcDate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

export function fromUtcDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function addDays(iso: string, days: number): string {
  const dt = toUtcDate(iso);
  dt.setUTCDate(dt.getUTCDate() + days);
  return fromUtcDate(dt);
}

export function diffNights(checkIn: string, checkOut: string): number {
  return Math.round((toUtcDate(checkOut).getTime() - toUtcDate(checkIn).getTime()) / 86_400_000);
}

/** Lista de noites (datas) entre check-in (inclusivo) e check-out (exclusivo). */
export function nightsBetween(checkIn: string, checkOut: string): string[] {
  const out: string[] = [];
  let cur = checkIn;
  while (cur < checkOut) {
    out.push(cur);
    cur = addDays(cur, 1);
  }
  return out;
}

/** Data de hoje no fuso do estabelecimento (YYYY-MM-DD). */
export function todayInTimezone(timezone = process.env.ESTABLISHMENT_TIMEZONE ?? "America/Sao_Paulo"): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")}`;
}

export function formatDateBR(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

export function formatDateLongBR(iso: string): string {
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "long", timeZone: "UTC" }).format(toUtcDate(iso));
}
