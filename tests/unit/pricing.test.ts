import { describe, expect, it } from "vitest";
import { quoteStay } from "@/services/pricing";
import { addDays, diffNights, isIsoDate, nightsBetween } from "@/lib/dates";
import { parseBRLToCents, formatBRL } from "@/lib/money";
import { canTransition, searchSchema } from "@/services/reservations";

describe("datas", () => {
  it("valida ISO e calcula noites sem deslocar o dia", () => {
    expect(isIsoDate("2026-02-29")).toBe(false);
    expect(isIsoDate("2028-02-29")).toBe(true);
    expect(diffNights("2026-11-10", "2026-11-13")).toBe(3);
    expect(nightsBetween("2026-12-30", "2027-01-02")).toEqual(["2026-12-30", "2026-12-31", "2027-01-01"]);
    expect(addDays("2026-10-31", 1)).toBe("2026-11-01");
  });
  it("rejeita check-out antes do check-in e estadias longas demais", () => {
    expect(searchSchema.safeParse({ checkIn: "2026-11-10", checkOut: "2026-11-10", guests: 2 }).success).toBe(false);
    expect(searchSchema.safeParse({ checkIn: "2026-11-10", checkOut: "2026-12-20", guests: 2 }).success).toBe(false);
    expect(searchSchema.safeParse({ checkIn: "2026-11-10", checkOut: "2026-11-12", guests: 0 }).success).toBe(false);
    expect(searchSchema.safeParse({ checkIn: "2026-11-10", checkOut: "2026-11-12", guests: "2" }).success).toBe(true);
  });
});

describe("tarifas", () => {
  const plans = [
    { id: "alta", startDate: "2026-12-26", endDate: "2027-01-03", priceCents: 32000, minNights: 3, priority: 10, active: true },
    { id: "promo", startDate: "2026-12-28", endDate: "2026-12-28", priceCents: 10000, minNights: 1, priority: 20, active: true },
    { id: "inativa", startDate: "2026-11-01", endDate: "2026-11-30", priceCents: 1, minNights: 1, priority: 99, active: false },
  ];
  it("usa a tarifa base fora dos períodos", () => {
    const q = quoteStay(22000, plans, "2026-11-10", "2026-11-12");
    expect(q.nights).toBe(2);
    expect(q.totalCents).toBe(44000);
    expect(q.breakdown.every((n) => n.ratePlanId === null)).toBe(true);
    expect(q.minNightsRequired).toBe(1);
  });
  it("aplica o plano de maior prioridade por noite e exige mínimo de noites", () => {
    const q = quoteStay(22000, plans, "2026-12-25", "2026-12-29");
    expect(q.breakdown.map((n) => n.priceCents)).toEqual([22000, 32000, 32000, 10000]);
    expect(q.totalCents).toBe(96000);
    expect(q.minNightsRequired).toBe(3);
  });
});

describe("dinheiro", () => {
  it("converte formatos brasileiros para centavos", () => {
    expect(parseBRLToCents("1.234,56")).toBe(123456);
    expect(parseBRLToCents("R$ 250,00")).toBe(25000);
    expect(parseBRLToCents("250")).toBe(25000);
    expect(() => parseBRLToCents("abc")).toThrow();
    expect(formatBRL(25000)).toMatch(/250,00/);
  });
});

describe("transições de status", () => {
  it("permite apenas as transições definidas", () => {
    expect(canTransition("REQUESTED", "CONFIRMED")).toBe(true);
    expect(canTransition("REQUESTED", "COMPLETED")).toBe(false);
    expect(canTransition("CONFIRMED", "COMPLETED")).toBe(true);
    expect(canTransition("CANCELLED", "CONFIRMED")).toBe(false);
  });
});
