CREATE TABLE "instagram_posts" (
	"id" text PRIMARY KEY NOT NULL,
	"url" text NOT NULL,
	"caption" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "instagram_posts_url_unique" UNIQUE("url")
);
