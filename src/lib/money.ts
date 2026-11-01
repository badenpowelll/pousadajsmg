export function formatBRL(cents: number): string {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100);
}

/** Converte "1.234,56" ou "1234.56" para centavos inteiros. */
export function parseBRLToCents(input: string): number {
  const normalized = input.trim().replace(/\s|R\$/g, "").replace(/\./g, "").replace(",", ".");
  const value = Number(normalized);
  if (!Number.isFinite(value) || value < 0) throw new Error("Valor monetário inválido");
  return Math.round(value * 100);
}
