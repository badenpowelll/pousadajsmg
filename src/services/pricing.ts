import type { NightPrice } from "@/db/schema";
import { nightsBetween } from "@/lib/dates";

export type RatePlanLike = {
  id: string;
  startDate: string; // inclusivo
  endDate: string; // inclusivo
  priceCents: number;
  minNights: number;
  priority: number;
  active: boolean;
};

export type Quote = {
  nights: number;
  totalCents: number;
  breakdown: NightPrice[];
  minNightsRequired: number;
};

/**
 * Calcula o preço de cada noite. Função pura, testável.
 * Regra: o plano ativo de maior prioridade que cobre a data vence; empate → o mais recente na lista perde (primeiro vence).
 */
export function quoteStay(
  basePriceCents: number,
  ratePlans: RatePlanLike[],
  checkIn: string,
  checkOut: string,
): Quote {
  const nights = nightsBetween(checkIn, checkOut);
  const active = ratePlans.filter((p) => p.active).sort((a, b) => b.priority - a.priority);
  let minNightsRequired = 1;
  const breakdown: NightPrice[] = nights.map((date) => {
    const plan = active.find((p) => p.startDate <= date && date <= p.endDate);
    if (plan) {
      minNightsRequired = Math.max(minNightsRequired, plan.minNights);
      return { date, priceCents: plan.priceCents, ratePlanId: plan.id };
    }
    return { date, priceCents: basePriceCents, ratePlanId: null };
  });
  const totalCents = breakdown.reduce((s, n) => s + n.priceCents, 0);
  return { nights: nights.length, totalCents, breakdown, minNightsRequired };
}
