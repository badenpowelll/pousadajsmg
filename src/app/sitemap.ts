import type { MetadataRoute } from "next";
import { listActiveAccommodations } from "@/services/content";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const types = await listActiveAccommodations().catch(() => []);
  const pages = ["", "/acomodacoes", "/experiencias", "/galeria", "/sobre", "/contato", "/reservar", "/politicas"];
  return [
    ...pages.map((p) => ({ url: `${base}${p}`, changeFrequency: "weekly" as const, priority: p === "" ? 1 : 0.7 })),
    ...types.map((t) => ({ url: `${base}/acomodacoes/${t.slug}`, changeFrequency: "weekly" as const, priority: 0.8 })),
  ];
}
