CREATE TABLE "queue_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"queue_id" uuid NOT NULL,
	"event" varchar(100) NOT NULL,
	"stage" varchar(50),
	"station_id" uuid,
	"actor_id" varchar(255),
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "queue_sequences" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"queue_service_id" uuid NOT NULL,
	"queue_date" date NOT NULL,
	"last_number" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "queue_sequences_service_date_unique" UNIQUE("queue_service_id","queue_date")
);
--> statement-breakpoint
CREATE TABLE "queue_services" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" varchar(50) NOT NULL,
	"name" varchar(255) NOT NULL,
	"prefix" varchar(5) NOT NULL,
	"description" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "queue_services_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "queues" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"queue_service_id" uuid NOT NULL,
	"patient_id" varchar(255),
	"patient_name" varchar(255),
	"queue_date" date NOT NULL,
	"sequence_number" integer NOT NULL,
	"queue_number" varchar(20) NOT NULL,
	"current_stage" varchar(50) NOT NULL,
	"current_station_id" uuid,
	"status" varchar(50) NOT NULL,
	"called_at" timestamp,
	"serving_at" timestamp,
	"completed_at" timestamp,
	"cancelled_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "queues_service_date_seq_unique" UNIQUE("queue_service_id","queue_date","sequence_number"),
	CONSTRAINT "queues_service_date_number_unique" UNIQUE("queue_service_id","queue_date","queue_number")
);
--> statement-breakpoint
CREATE TABLE "station_assignments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"station_id" uuid NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "station_assignments_unique" UNIQUE("station_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "stations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"queue_service_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"code" varchar(50) NOT NULL,
	"stage" varchar(50) NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "stations_code_unique" UNIQUE("code")
);
--> statement-breakpoint
ALTER TABLE "queue_events" ADD CONSTRAINT "queue_events_queue_id_queues_id_fk" FOREIGN KEY ("queue_id") REFERENCES "public"."queues"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "queue_events" ADD CONSTRAINT "queue_events_station_id_stations_id_fk" FOREIGN KEY ("station_id") REFERENCES "public"."stations"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "queue_sequences" ADD CONSTRAINT "queue_sequences_queue_service_id_queue_services_id_fk" FOREIGN KEY ("queue_service_id") REFERENCES "public"."queue_services"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "queues" ADD CONSTRAINT "queues_queue_service_id_queue_services_id_fk" FOREIGN KEY ("queue_service_id") REFERENCES "public"."queue_services"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "queues" ADD CONSTRAINT "queues_current_station_id_stations_id_fk" FOREIGN KEY ("current_station_id") REFERENCES "public"."stations"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "station_assignments" ADD CONSTRAINT "station_assignments_station_id_stations_id_fk" FOREIGN KEY ("station_id") REFERENCES "public"."stations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stations" ADD CONSTRAINT "stations_queue_service_id_queue_services_id_fk" FOREIGN KEY ("queue_service_id") REFERENCES "public"."queue_services"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "queue_events_queue_idx" ON "queue_events" USING btree ("queue_id");--> statement-breakpoint
CREATE INDEX "queue_events_event_idx" ON "queue_events" USING btree ("event");--> statement-breakpoint
CREATE INDEX "queue_events_station_idx" ON "queue_events" USING btree ("station_id");--> statement-breakpoint
CREATE INDEX "queue_events_created_idx" ON "queue_events" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "queues_service_date_idx" ON "queues" USING btree ("queue_service_id","queue_date");--> statement-breakpoint
CREATE INDEX "queues_status_idx" ON "queues" USING btree ("status");--> statement-breakpoint
CREATE INDEX "queues_stage_idx" ON "queues" USING btree ("current_stage");--> statement-breakpoint
CREATE INDEX "queues_station_idx" ON "queues" USING btree ("current_station_id");--> statement-breakpoint
CREATE INDEX "queues_service_date_stage_status_idx" ON "queues" USING btree ("queue_service_id","queue_date","current_stage","status");--> statement-breakpoint
CREATE INDEX "station_assignments_station_idx" ON "station_assignments" USING btree ("station_id");--> statement-breakpoint
CREATE INDEX "station_assignments_user_idx" ON "station_assignments" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "stations_service_idx" ON "stations" USING btree ("queue_service_id");--> statement-breakpoint
CREATE INDEX "stations_stage_idx" ON "stations" USING btree ("stage");--> statement-breakpoint
CREATE INDEX "stations_active_idx" ON "stations" USING btree ("is_active");