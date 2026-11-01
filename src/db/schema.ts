// Modelo de dados — Plataforma de Hotelaria (um estabelecimento).
// Decisão de inventário: QUANTIDADE DE UNIDADES POR CATEGORIA (accommodationTypes.units).
// Disponibilidade de uma categoria em um intervalo = units - reservas ativas sobrepostas - bloqueios.
// Ver docs/ARCHITECTURE.md e docs/DECISIONS.md.

import {
  boolean,
  date,
  doublePrecision,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createId } from "@/lib/ids";

const id = () => text("id").primaryKey().$defaultFn(createId);
const createdAt = () => timestamp("created_at", { withTimezone: true }).notNull().defaultNow();
const updatedAt = () =>
  timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdateFn(() => new Date());

// ---------- Estabelecimento e site ----------

export const establishments = pgTable("establishments", {
  id: id(),
  name: text("name").notNull(),
  tagline: text("tagline"),
  description: text("description"),
  phone: text("phone"),
  whatsapp: text("whatsapp"), // somente dígitos com DDI, ex.: 5584999999999
  email: text("email"),
  addressLine: text("address_line"),
  city: text("city"),
  state: text("state"),
  postalCode: text("postal_code"),
  country: text("country").notNull().default("BR"),
  latitude: doublePrecision("latitude"),
  longitude: doublePrecision("longitude"),
  mapsUrl: text("maps_url"),
  checkInTime: text("check_in_time").notNull().default("14:00"),
  checkOutTime: text("check_out_time").notNull().default("12:00"),
  timezone: text("timezone").notNull().default("America/Sao_Paulo"),
  instagramUrl: text("instagram_url"),
  facebookUrl: text("facebook_url"),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const siteSettings = pgTable("site_settings", {
  id: id(),
  establishmentId: text("establishment_id")
    .notNull()
    .unique()
    .references(() => establishments.id, { onDelete: "cascade" }),
  logoUrl: text("logo_url"),
  primaryColor: text("primary_color").notNull().default("#7A4F2B"),
  accentColor: text("accent_color").notNull().default("#C2A365"),
  heroImageUrl: text("hero_image_url"),
  heroTitle: text("hero_title").notNull().default("Conforto e natureza em um só lugar"),
  heroSubtitle: text("hero_subtitle")
    .notNull()
    .default("Viva momentos inesquecíveis em meio à tranquilidade."),
  aboutTitle: text("about_title"),
  aboutText: text("about_text"),
  cancellationPolicy: text("cancellation_policy"),
  housePolicies: text("house_policies"),
  privacyPolicy: text("privacy_policy"),
  termsText: text("terms_text"),
  updatedAt: updatedAt(),
});

// ---------- Acomodações ----------

export const accommodationTypes = pgTable(
  "accommodation_types",
  {
    id: id(),
    slug: text("slug").notNull().unique(),
    name: text("name").notNull(),
    shortDescription: text("short_description"),
    description: text("description"),
    capacity: integer("capacity").notNull(), // hóspedes máximos por unidade
    units: integer("units").notNull().default(1), // unidades físicas desta categoria
    basePriceCents: integer("base_price_cents").notNull(),
    sizeM2: integer("size_m2"),
    bedDescription: text("bed_description"),
    active: boolean("active").notNull().default(true),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index("accommodation_types_active_idx").on(t.active, t.sortOrder)],
);

export const accommodationImages = pgTable(
  "accommodation_images",
  {
    id: id(),
    accommodationTypeId: text("accommodation_type_id")
      .notNull()
      .references(() => accommodationTypes.id, { onDelete: "cascade" }),
    url: text("url").notNull(),
    alt: text("alt").notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (t) => [index("accommodation_images_type_idx").on(t.accommodationTypeId, t.sortOrder)],
);

export const amenities = pgTable("amenities", {
  id: id(),
  key: text("key").notNull().unique(),
  label: text("label").notNull(),
  icon: text("icon"), // nome do ícone lucide
});

export const accommodationAmenities = pgTable(
  "accommodation_amenities",
  {
    accommodationTypeId: text("accommodation_type_id")
      .notNull()
      .references(() => accommodationTypes.id, { onDelete: "cascade" }),
    amenityId: text("amenity_id")
      .notNull()
      .references(() => amenities.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.accommodationTypeId, t.amenityId] })],
);

// Tarifa por período. A noite usa o plano de maior prioridade que cobre a data; senão, basePriceCents.
export const ratePlans = pgTable(
  "rate_plans",
  {
    id: id(),
    accommodationTypeId: text("accommodation_type_id")
      .notNull()
      .references(() => accommodationTypes.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    startDate: date("start_date").notNull(), // inclusivo
    endDate: date("end_date").notNull(), // inclusivo (última noite)
    priceCents: integer("price_cents").notNull(),
    minNights: integer("min_nights").notNull().default(1),
    priority: integer("priority").notNull().default(0),
    active: boolean("active").notNull().default(true),
    createdAt: createdAt(),
  },
  (t) => [index("rate_plans_type_dates_idx").on(t.accommodationTypeId, t.startDate, t.endDate)],
);

// Bloqueio administrativo (manutenção, uso próprio). units = quantas unidades ficam indisponíveis.
export const availabilityBlocks = pgTable(
  "availability_blocks",
  {
    id: id(),
    accommodationTypeId: text("accommodation_type_id")
      .notNull()
      .references(() => accommodationTypes.id, { onDelete: "cascade" }),
    startDate: date("start_date").notNull(), // inclusivo
    endDate: date("end_date").notNull(), // exclusivo (como check-out)
    units: integer("units").notNull().default(1),
    reason: text("reason"),
    createdAt: createdAt(),
  },
  (t) => [index("availability_blocks_type_dates_idx").on(t.accommodationTypeId, t.startDate, t.endDate)],
);

// ---------- Reservas ----------

export const guests = pgTable(
  "guests",
  {
    id: id(),
    fullName: text("full_name").notNull(),
    email: text("email").notNull(),
    phone: text("phone").notNull(),
    document: text("document"),
    createdAt: createdAt(),
  },
  (t) => [index("guests_email_idx").on(t.email)],
);

export const reservationStatus = pgEnum("reservation_status", [
  "REQUESTED", // solicitação enviada pelo hóspede; ocupa inventário até decisão
  "CONFIRMED", // confirmada pelo estabelecimento
  "CANCELLED", // cancelada (libera inventário)
  "COMPLETED", // estadia concluída
]);

export const reservations = pgTable(
  "reservations",
  {
    id: id(),
    code: text("code").notNull().unique(), // identificador legível, ex.: RSV-7K3M2Q
    idempotencyKey: text("idempotency_key"),
    accommodationTypeId: text("accommodation_type_id")
      .notNull()
      .references(() => accommodationTypes.id),
    guestId: text("guest_id")
      .notNull()
      .references(() => guests.id),
    guestAccountId: text("guest_account_id"), // conta logada (Google) que fez a solicitação, se houver
    checkIn: date("check_in").notNull(),
    checkOut: date("check_out").notNull(),
    nights: integer("nights").notNull(),
    guests: integer("guests").notNull(),
    status: reservationStatus("status").notNull().default("REQUESTED"),
    totalCents: integer("total_cents").notNull(),
    breakdown: jsonb("breakdown").notNull().$type<NightPrice[]>(),
    notes: text("notes"),
    internalNotes: text("internal_notes"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    uniqueIndex("reservations_idempotency_idx").on(t.idempotencyKey),
    index("reservations_type_dates_idx").on(t.accommodationTypeId, t.checkIn, t.checkOut, t.status),
    index("reservations_status_checkin_idx").on(t.status, t.checkIn),
    index("reservations_account_idx").on(t.guestAccountId),
  ],
);

export const reservationStatusChanges = pgTable(
  "reservation_status_changes",
  {
    id: id(),
    reservationId: text("reservation_id")
      .notNull()
      .references(() => reservations.id, { onDelete: "cascade" }),
    fromStatus: reservationStatus("from_status"),
    toStatus: reservationStatus("to_status").notNull(),
    changedById: text("changed_by_id"),
    reason: text("reason"),
    createdAt: createdAt(),
  },
  (t) => [index("reservation_status_changes_res_idx").on(t.reservationId, t.createdAt)],
);

// ---------- Conteúdo ----------

export const galleryImages = pgTable("gallery_images", {
  id: id(),
  url: text("url").notNull(),
  alt: text("alt").notNull(),
  category: text("category").notNull().default("geral"),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const experiences = pgTable("experiences", {
  id: id(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  imageUrl: text("image_url"),
  sortOrder: integer("sort_order").notNull().default(0),
  active: boolean("active").notNull().default(true),
});

export const testimonials = pgTable("testimonials", {
  id: id(),
  author: text("author").notNull(),
  text: text("text").notNull(),
  rating: integer("rating").notNull().default(5),
  active: boolean("active").notNull().default(true),
  createdAt: createdAt(),
});

export const contactMessages = pgTable("contact_messages", {
  id: id(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  message: text("message").notNull(),
  ip: text("ip"),
  read: boolean("read").notNull().default(false),
  createdAt: createdAt(),
});

// ---------- Administração ----------

export const adminRole = pgEnum("admin_role", ["OWNER", "STAFF"]);

export const adminUsers = pgTable("admin_users", {
  id: id(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  passwordHash: text("password_hash").notNull(),
  role: adminRole("role").notNull().default("STAFF"),
  active: boolean("active").notNull().default(true),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const sessions = pgTable(
  "sessions",
  {
    id: id(),
    tokenHash: text("token_hash").notNull().unique(),
    userId: text("user_id")
      .notNull()
      .references(() => adminUsers.id, { onDelete: "cascade" }),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: createdAt(),
  },
  (t) => [index("sessions_user_idx").on(t.userId)],
);

export const auditLogs = pgTable(
  "audit_logs",
  {
    id: id(),
    userId: text("user_id").references(() => adminUsers.id, { onDelete: "set null" }),
    action: text("action").notNull(), // ex.: reservation.status_change
    entity: text("entity").notNull(),
    entityId: text("entity_id"),
    details: jsonb("details"),
    createdAt: createdAt(),
  },
  (t) => [index("audit_logs_entity_idx").on(t.entity, t.entityId), index("audit_logs_created_idx").on(t.createdAt)],
);

// ---------- Relações ----------

export const accommodationTypesRelations = relations(accommodationTypes, ({ many }) => ({
  images: many(accommodationImages),
  amenities: many(accommodationAmenities),
  ratePlans: many(ratePlans),
  blocks: many(availabilityBlocks),
  reservations: many(reservations),
}));

export const accommodationImagesRelations = relations(accommodationImages, ({ one }) => ({
  accommodationType: one(accommodationTypes, {
    fields: [accommodationImages.accommodationTypeId],
    references: [accommodationTypes.id],
  }),
}));

export const accommodationAmenitiesRelations = relations(accommodationAmenities, ({ one }) => ({
  accommodationType: one(accommodationTypes, {
    fields: [accommodationAmenities.accommodationTypeId],
    references: [accommodationTypes.id],
  }),
  amenity: one(amenities, { fields: [accommodationAmenities.amenityId], references: [amenities.id] }),
}));

export const ratePlansRelations = relations(ratePlans, ({ one }) => ({
  accommodationType: one(accommodationTypes, {
    fields: [ratePlans.accommodationTypeId],
    references: [accommodationTypes.id],
  }),
}));

export const availabilityBlocksRelations = relations(availabilityBlocks, ({ one }) => ({
  accommodationType: one(accommodationTypes, {
    fields: [availabilityBlocks.accommodationTypeId],
    references: [accommodationTypes.id],
  }),
}));

export const reservationsRelations = relations(reservations, ({ one, many }) => ({
  accommodationType: one(accommodationTypes, {
    fields: [reservations.accommodationTypeId],
    references: [accommodationTypes.id],
  }),
  guest: one(guests, { fields: [reservations.guestId], references: [guests.id] }),
  statusHistory: many(reservationStatusChanges),
}));

export const reservationStatusChangesRelations = relations(reservationStatusChanges, ({ one }) => ({
  reservation: one(reservations, {
    fields: [reservationStatusChanges.reservationId],
    references: [reservations.id],
  }),
}));

export const guestsRelations = relations(guests, ({ many }) => ({
  reservations: many(reservations),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(adminUsers, { fields: [sessions.userId], references: [adminUsers.id] }),
}));

// ---------- Tipos ----------

export type NightPrice = { date: string; priceCents: number; ratePlanId: string | null };
export type ReservationStatus = (typeof reservationStatus.enumValues)[number];
export type AccommodationType = typeof accommodationTypes.$inferSelect;
export type Reservation = typeof reservations.$inferSelect;
export type Guest = typeof guests.$inferSelect;
export type AdminUser = typeof adminUsers.$inferSelect;
export type Establishment = typeof establishments.$inferSelect;
export type SiteSettingsRow = typeof siteSettings.$inferSelect;

// ---------- Instagram ----------
// Posts incorporados manualmente (embed oficial do Instagram) enquanto não há token da API.
export const instagramPosts = pgTable("instagram_posts", {
  id: id(),
  url: text("url").notNull().unique(), // ex.: https://www.instagram.com/p/XXXX/ ou /reel/XXXX/
  caption: text("caption"),
  sortOrder: integer("sort_order").notNull().default(0),
  active: boolean("active").notNull().default(true),
  createdAt: createdAt(),
});

// ---------- Contas de hóspedes (login com Google) ----------
export const guestAccounts = pgTable(
  "guest_accounts",
  {
    id: id(),
    googleSub: text("google_sub").notNull().unique(), // identificador estável do usuário no Google
    email: text("email").notNull(),
    name: text("name"), // preenchido/confirmado pelo hóspede
    whatsapp: text("whatsapp"), // só dígitos com DDI
    avatarUrl: text("avatar_url"),
    profileCompleted: boolean("profile_completed").notNull().default(false),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index("guest_accounts_email_idx").on(t.email)],
);

export const guestSessions = pgTable(
  "guest_sessions",
  {
    id: id(),
    tokenHash: text("token_hash").notNull().unique(),
    accountId: text("account_id")
      .notNull()
      .references(() => guestAccounts.id, { onDelete: "cascade" }),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: createdAt(),
  },
  (t) => [index("guest_sessions_account_idx").on(t.accountId)],
);

export type GuestAccount = typeof guestAccounts.$inferSelect;
