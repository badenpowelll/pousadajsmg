CREATE TYPE "public"."admin_role" AS ENUM('OWNER', 'STAFF');--> statement-breakpoint
CREATE TYPE "public"."reservation_status" AS ENUM('REQUESTED', 'CONFIRMED', 'CANCELLED', 'COMPLETED');--> statement-breakpoint
CREATE TABLE "accommodation_amenities" (
	"accommodation_type_id" text NOT NULL,
	"amenity_id" text NOT NULL,
	CONSTRAINT "accommodation_amenities_accommodation_type_id_amenity_id_pk" PRIMARY KEY("accommodation_type_id","amenity_id")
);
--> statement-breakpoint
CREATE TABLE "accommodation_images" (
	"id" text PRIMARY KEY NOT NULL,
	"accommodation_type_id" text NOT NULL,
	"url" text NOT NULL,
	"alt" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "accommodation_types" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"short_description" text,
	"description" text,
	"capacity" integer NOT NULL,
	"units" integer DEFAULT 1 NOT NULL,
	"base_price_cents" integer NOT NULL,
	"size_m2" integer,
	"bed_description" text,
	"active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "accommodation_types_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "admin_users" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"name" text NOT NULL,
	"password_hash" text NOT NULL,
	"role" "admin_role" DEFAULT 'STAFF' NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "admin_users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "amenities" (
	"id" text PRIMARY KEY NOT NULL,
	"key" text NOT NULL,
	"label" text NOT NULL,
	"icon" text,
	CONSTRAINT "amenities_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text,
	"action" text NOT NULL,
	"entity" text NOT NULL,
	"entity_id" text,
	"details" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "availability_blocks" (
	"id" text PRIMARY KEY NOT NULL,
	"accommodation_type_id" text NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"units" integer DEFAULT 1 NOT NULL,
	"reason" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "contact_messages" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"message" text NOT NULL,
	"ip" text,
	"read" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "establishments" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"tagline" text,
	"description" text,
	"phone" text,
	"whatsapp" text,
	"email" text,
	"address_line" text,
	"city" text,
	"state" text,
	"postal_code" text,
	"country" text DEFAULT 'BR' NOT NULL,
	"latitude" double precision,
	"longitude" double precision,
	"maps_url" text,
	"check_in_time" text DEFAULT '14:00' NOT NULL,
	"check_out_time" text DEFAULT '12:00' NOT NULL,
	"timezone" text DEFAULT 'America/Sao_Paulo' NOT NULL,
	"instagram_url" text,
	"facebook_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "experiences" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"image_url" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "gallery_images" (
	"id" text PRIMARY KEY NOT NULL,
	"url" text NOT NULL,
	"alt" text NOT NULL,
	"category" text DEFAULT 'geral' NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "guests" (
	"id" text PRIMARY KEY NOT NULL,
	"full_name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text NOT NULL,
	"document" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rate_plans" (
	"id" text PRIMARY KEY NOT NULL,
	"accommodation_type_id" text NOT NULL,
	"name" text NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"price_cents" integer NOT NULL,
	"min_nights" integer DEFAULT 1 NOT NULL,
	"priority" integer DEFAULT 0 NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reservation_status_changes" (
	"id" text PRIMARY KEY NOT NULL,
	"reservation_id" text NOT NULL,
	"from_status" "reservation_status",
	"to_status" "reservation_status" NOT NULL,
	"changed_by_id" text,
	"reason" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reservations" (
	"id" text PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"idempotency_key" text,
	"accommodation_type_id" text NOT NULL,
	"guest_id" text NOT NULL,
	"check_in" date NOT NULL,
	"check_out" date NOT NULL,
	"nights" integer NOT NULL,
	"guests" integer NOT NULL,
	"status" "reservation_status" DEFAULT 'REQUESTED' NOT NULL,
	"total_cents" integer NOT NULL,
	"breakdown" jsonb NOT NULL,
	"notes" text,
	"internal_notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "reservations_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"token_hash" text NOT NULL,
	"user_id" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "sessions_token_hash_unique" UNIQUE("token_hash")
);
--> statement-breakpoint
CREATE TABLE "site_settings" (
	"id" text PRIMARY KEY NOT NULL,
	"establishment_id" text NOT NULL,
	"logo_url" text,
	"primary_color" text DEFAULT '#7A4F2B' NOT NULL,
	"accent_color" text DEFAULT '#C2A365' NOT NULL,
	"hero_image_url" text,
	"hero_title" text DEFAULT 'Conforto e natureza em um só lugar' NOT NULL,
	"hero_subtitle" text DEFAULT 'Viva momentos inesquecíveis em meio à tranquilidade.' NOT NULL,
	"about_title" text,
	"about_text" text,
	"cancellation_policy" text,
	"house_policies" text,
	"privacy_policy" text,
	"terms_text" text,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "site_settings_establishment_id_unique" UNIQUE("establishment_id")
);
--> statement-breakpoint
CREATE TABLE "testimonials" (
	"id" text PRIMARY KEY NOT NULL,
	"author" text NOT NULL,
	"text" text NOT NULL,
	"rating" integer DEFAULT 5 NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "accommodation_amenities" ADD CONSTRAINT "accommodation_amenities_accommodation_type_id_accommodation_types_id_fk" FOREIGN KEY ("accommodation_type_id") REFERENCES "public"."accommodation_types"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "accommodation_amenities" ADD CONSTRAINT "accommodation_amenities_amenity_id_amenities_id_fk" FOREIGN KEY ("amenity_id") REFERENCES "public"."amenities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "accommodation_images" ADD CONSTRAINT "accommodation_images_accommodation_type_id_accommodation_types_id_fk" FOREIGN KEY ("accommodation_type_id") REFERENCES "public"."accommodation_types"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_admin_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."admin_users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "availability_blocks" ADD CONSTRAINT "availability_blocks_accommodation_type_id_accommodation_types_id_fk" FOREIGN KEY ("accommodation_type_id") REFERENCES "public"."accommodation_types"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rate_plans" ADD CONSTRAINT "rate_plans_accommodation_type_id_accommodation_types_id_fk" FOREIGN KEY ("accommodation_type_id") REFERENCES "public"."accommodation_types"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reservation_status_changes" ADD CONSTRAINT "reservation_status_changes_reservation_id_reservations_id_fk" FOREIGN KEY ("reservation_id") REFERENCES "public"."reservations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_accommodation_type_id_accommodation_types_id_fk" FOREIGN KEY ("accommodation_type_id") REFERENCES "public"."accommodation_types"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_guest_id_guests_id_fk" FOREIGN KEY ("guest_id") REFERENCES "public"."guests"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_admin_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."admin_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_establishment_id_establishments_id_fk" FOREIGN KEY ("establishment_id") REFERENCES "public"."establishments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "accommodation_images_type_idx" ON "accommodation_images" USING btree ("accommodation_type_id","sort_order");--> statement-breakpoint
CREATE INDEX "accommodation_types_active_idx" ON "accommodation_types" USING btree ("active","sort_order");--> statement-breakpoint
CREATE INDEX "audit_logs_entity_idx" ON "audit_logs" USING btree ("entity","entity_id");--> statement-breakpoint
CREATE INDEX "audit_logs_created_idx" ON "audit_logs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "availability_blocks_type_dates_idx" ON "availability_blocks" USING btree ("accommodation_type_id","start_date","end_date");--> statement-breakpoint
CREATE INDEX "guests_email_idx" ON "guests" USING btree ("email");--> statement-breakpoint
CREATE INDEX "rate_plans_type_dates_idx" ON "rate_plans" USING btree ("accommodation_type_id","start_date","end_date");--> statement-breakpoint
CREATE INDEX "reservation_status_changes_res_idx" ON "reservation_status_changes" USING btree ("reservation_id","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "reservations_idempotency_idx" ON "reservations" USING btree ("idempotency_key");--> statement-breakpoint
CREATE INDEX "reservations_type_dates_idx" ON "reservations" USING btree ("accommodation_type_id","check_in","check_out","status");--> statement-breakpoint
CREATE INDEX "reservations_status_checkin_idx" ON "reservations" USING btree ("status","check_in");--> statement-breakpoint
CREATE INDEX "sessions_user_idx" ON "sessions" USING btree ("user_id");