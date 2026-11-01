CREATE TABLE "guest_accounts" (
	"id" text PRIMARY KEY NOT NULL,
	"google_sub" text NOT NULL,
	"email" text NOT NULL,
	"name" text,
	"whatsapp" text,
	"avatar_url" text,
	"profile_completed" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "guest_accounts_google_sub_unique" UNIQUE("google_sub")
);
--> statement-breakpoint
CREATE TABLE "guest_sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"token_hash" text NOT NULL,
	"account_id" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "guest_sessions_token_hash_unique" UNIQUE("token_hash")
);
--> statement-breakpoint
ALTER TABLE "reservations" ADD COLUMN "guest_account_id" text;--> statement-breakpoint
ALTER TABLE "guest_sessions" ADD CONSTRAINT "guest_sessions_account_id_guest_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."guest_accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "guest_accounts_email_idx" ON "guest_accounts" USING btree ("email");--> statement-breakpoint
CREATE INDEX "guest_sessions_account_idx" ON "guest_sessions" USING btree ("account_id");--> statement-breakpoint
CREATE INDEX "reservations_account_idx" ON "reservations" USING btree ("guest_account_id");