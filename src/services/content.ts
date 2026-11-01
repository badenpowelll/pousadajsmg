import { asc, eq } from "drizzle-orm";
import { cache } from "react";
import { db } from "@/db";
import {
  accommodationTypes,
  establishments,
  experiences,
  galleryImages,
  siteSettings,
  testimonials,
} from "@/db/schema";

/** Estabelecimento + configurações do site (único registro). Cacheado por requisição. */
export const getSite = cache(async () => {
  const est = await db.query.establishments.findFirst();
  if (!est) throw new Error("Estabelecimento não cadastrado. Execute npm run db:seed.");
  const settings =
    (await db.query.siteSettings.findFirst({ where: eq(siteSettings.establishmentId, est.id) })) ??
    (await db.insert(siteSettings).values({ establishmentId: est.id }).returning())[0];
  return { establishment: est, settings };
});

export const listActiveAccommodations = cache(async () =>
  db.query.accommodationTypes.findMany({
    where: eq(accommodationTypes.active, true),
    with: { images: { orderBy: (i, { asc }) => [asc(i.sortOrder)] }, amenities: { with: { amenity: true } } },
    orderBy: (t, { asc }) => [asc(t.sortOrder), asc(t.name)],
  }),
);

export const getAccommodationBySlug = cache(async (slug: string) =>
  db.query.accommodationTypes.findFirst({
    where: eq(accommodationTypes.slug, slug),
    with: {
      images: { orderBy: (i, { asc }) => [asc(i.sortOrder)] },
      amenities: { with: { amenity: true } },
      ratePlans: true,
    },
  }),
);

export const listGallery = cache(async () => db.select().from(galleryImages).orderBy(asc(galleryImages.sortOrder)));
export const listExperiences = cache(async () =>
  db.select().from(experiences).where(eq(experiences.active, true)).orderBy(asc(experiences.sortOrder)),
);
export const listTestimonials = cache(async () =>
  db.select().from(testimonials).where(eq(testimonials.active, true)).limit(6),
);

export { establishments };
