import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  timestamp,
  integer,
  date,
  jsonb,
  unique,
  index,
} from 'drizzle-orm/pg-core';
import type { InferSelectModel, InferInsertModel } from 'drizzle-orm';

// =========================
// Queue Services
// =========================
export const queueServices = pgTable('queue_services', {
  id: uuid('id').defaultRandom().primaryKey(),
  code: varchar('code', { length: 50 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  prefix: varchar('prefix', { length: 5 }).notNull(),
  description: text('description'),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// =========================
// Stations
// Dynamic per service & stage
// stage: REGISTRATION | BLOOD_COLLECTION
// =========================
export const stations = pgTable(
  'stations',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    queueServiceId: uuid('queue_service_id')
      .references(() => queueServices.id, { onDelete: 'restrict' })
      .notNull(),
    name: varchar('name', { length: 255 }).notNull(),
    code: varchar('code', { length: 50 }).notNull().unique(),
    stage: varchar('stage', { length: 50 }).notNull(),
    isActive: boolean('is_active').default(true).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [
    index('stations_service_idx').on(table.queueServiceId),
    index('stations_stage_idx').on(table.stage),
    index('stations_active_idx').on(table.isActive),
  ]
);

// =========================
// Station Assignments
// Menghubungkan operator/user dengan station
// Untuk MVP tanpa auth, userId disimpan sebagai varchar
// Nanti bisa FK ke users table
// =========================
export const stationAssignments = pgTable(
  'station_assignments',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    stationId: uuid('station_id')
      .references(() => stations.id, { onDelete: 'cascade' })
      .notNull(),
    userId: varchar('user_id', { length: 255 }).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [
    index('station_assignments_station_idx').on(table.stationId),
    index('station_assignments_user_idx').on(table.userId),
    unique('station_assignments_unique').on(table.stationId, table.userId),
  ]
);

// =========================
// Queue Sequences
// Atomic counter per service per date
// lastNumber di-increment secara atomic dalam transaction
// =========================
export const queueSequences = pgTable(
  'queue_sequences',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    queueServiceId: uuid('queue_service_id')
      .references(() => queueServices.id, { onDelete: 'cascade' })
      .notNull(),
    queueDate: date('queue_date').notNull(),
    lastNumber: integer('last_number').default(0).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [
    unique('queue_sequences_service_date_unique').on(table.queueServiceId, table.queueDate),
  ]
);

// =========================
// Queues
// Core queue entity, lifecycle: WAITING -> CALLED -> SERVING -> COMPLETED
// currentStage: REGISTRATION | BLOOD_COLLECTION
// status: WAITING | CALLED | SERVING | COMPLETED | SKIPPED | CANCELLED
// =========================
export const queues = pgTable(
  'queues',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    queueServiceId: uuid('queue_service_id')
      .references(() => queueServices.id, { onDelete: 'restrict' })
      .notNull(),
    patientId: varchar('patient_id', { length: 255 }),
    patientName: varchar('patient_name', { length: 255 }),
    queueDate: date('queue_date').notNull(),
    sequenceNumber: integer('sequence_number').notNull(),
    queueNumber: varchar('queue_number', { length: 20 }).notNull(),
    currentStage: varchar('current_stage', { length: 50 }).notNull(),
    currentStationId: uuid('current_station_id').references(() => stations.id, {
      onDelete: 'set null',
    }),
    status: varchar('status', { length: 50 }).notNull(),
    calledAt: timestamp('called_at'),
    servingAt: timestamp('serving_at'),
    completedAt: timestamp('completed_at'),
    cancelledAt: timestamp('cancelled_at'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [
    unique('queues_service_date_seq_unique').on(
      table.queueServiceId,
      table.queueDate,
      table.sequenceNumber
    ),
    unique('queues_service_date_number_unique').on(
      table.queueServiceId,
      table.queueDate,
      table.queueNumber
    ),
    index('queues_service_date_idx').on(table.queueServiceId, table.queueDate),
    index('queues_status_idx').on(table.status),
    index('queues_stage_idx').on(table.currentStage),
    index('queues_station_idx').on(table.currentStationId),
    index('queues_service_date_stage_status_idx').on(
      table.queueServiceId,
      table.queueDate,
      table.currentStage,
      table.status
    ),
  ]
);

// =========================
// Queue Events
// Audit trail untuk semua aktivitas queue
// event: CREATED | REGISTRATION_CALLED | REGISTRATION_RECALLED | REGISTRATION_STARTED | REGISTRATION_COMPLETED
//        | BLOOD_COLLECTION_CALLED | BLOOD_COLLECTION_RECALLED | BLOOD_COLLECTION_STARTED | BLOOD_COLLECTION_COMPLETED
//        | AUTO_CALLED | SKIPPED | CANCELLED
// =========================
export const queueEvents = pgTable(
  'queue_events',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    queueId: uuid('queue_id')
      .references(() => queues.id, { onDelete: 'cascade' })
      .notNull(),
    event: varchar('event', { length: 100 }).notNull(),
    stage: varchar('stage', { length: 50 }),
    stationId: uuid('station_id').references(() => stations.id, { onDelete: 'set null' }),
    actorId: varchar('actor_id', { length: 255 }),
    metadata: jsonb('metadata'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    index('queue_events_queue_idx').on(table.queueId),
    index('queue_events_event_idx').on(table.event),
    index('queue_events_station_idx').on(table.stationId),
    index('queue_events_created_idx').on(table.createdAt),
  ]
);

// Centralized DB types — single source of truth (DRY)
// Repo / Service / Action impor dari sini, bukan duplikat InferSelectModel per file
export type QueueService = InferSelectModel<typeof queueServices>;
export type NewQueueService = InferInsertModel<typeof queueServices>;

export type Station = InferSelectModel<typeof stations>;
export type NewStation = InferInsertModel<typeof stations>;

export type StationAssignment = InferSelectModel<typeof stationAssignments>;
export type NewStationAssignment = InferInsertModel<typeof stationAssignments>;

export type QueueSequence = InferSelectModel<typeof queueSequences>;
export type NewQueueSequence = InferInsertModel<typeof queueSequences>;

export type Queue = InferSelectModel<typeof queues>;
export type NewQueue = InferInsertModel<typeof queues>;

export type QueueEvent = InferSelectModel<typeof queueEvents>;
export type NewQueueEvent = InferInsertModel<typeof queueEvents>;
