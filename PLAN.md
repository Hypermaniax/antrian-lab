# Development Plan

## Dynamic Laboratory Queue Management System

**Stack**

```text
Backend  : Nextjs
Frontend : Nextjs
Database : PostgreSQL
Orm      : drizzle
component: shadcn
template : tailwind
```

---

# Phase 1 — Requirement & Business Workflow

## Objective

Memastikan seluruh business flow sudah jelas sebelum implementation.

## Tasks

* [ ] Define patient queue flow.
* [ ] Define registration workflow.
* [ ] Define blood collection workflow.
* [ ] Define stage.
* [ ] Define station.
* [ ] Define manual calling.
* [ ] Define automatic calling.
* [ ] Define recall.
* [ ] Define queue completion.
* [ ] Define skip/cancel.
* [ ] Define multi-station behavior.
* [ ] Define concurrency rules.

## Output

```text
Business Flow
State Transition
Station Flow
Calling Rules
```

---

# Phase 2 — Domain Modeling

## Core Entities

```text
Patient
Queue
QueueService
QueueSequence
QueueEvent
Station
StationAssignment
```

## Tasks

* [ ] Define Queue.
* [ ] Define QueueService.
* [ ] Define QueueStage.
* [ ] Define Station.
* [ ] Define StationAssignment.
* [ ] Define QueueEvent.
* [ ] Define QueueStatus.
* [ ] Define state transitions.
* [ ] Define relationship antar entity.

---

# Phase 3 — Database Design

## Tables

```text
patients
queue_services
stations
station_assignments
queues
queue_sequences
queue_events
```

## Tasks

* [ ] Create migrations.
* [ ] Define foreign keys.
* [ ] Define indexes.
* [ ] Define unique constraints.
* [ ] Define status strategy.
* [ ] Define delete/restrict behavior.
* [ ] Define transaction boundaries.
* [ ] Test migration from empty database.

---

# Phase 4 — Queue Service Management

## Backend

Implement:

```text
QueueServiceController
QueueService
QueueServiceRequest
```

Operations:

```text
index
store
show
update
activate
deactivate
```

## Acceptance Criteria

Administrator dapat:

```text
Create
Read
Update
Activate
Deactivate
```

queue service.

---

# Phase 5 — Station Management

## Objective

Membangun station yang dapat dikonfigurasi.

Contoh:

```text
Registration
└── Loket 1

Blood Collection
├── Meja 1
├── Meja 2
└── Meja 3
```

## Tasks

* [ ] Station CRUD.
* [ ] Station activation.
* [ ] Station deactivation.
* [ ] Assign service/stage.
* [ ] Assign user.
* [ ] Prevent inactive station from processing queue.

---

# Phase 6 — Station Assignment

## Objective

Menghubungkan operator dengan station.

Contoh:

```text
Doctor A
    ↓
Meja 1
```

## Tasks

* [ ] Create assignment.
* [ ] Remove assignment.
* [ ] Validate active station.
* [ ] Validate user permission.
* [ ] Ensure user can only operate assigned station.

---

# Phase 7 — Queue Number Generator

## Objective

Membangun queue numbering engine.

Input:

```text
queue_service
date
```

Output:

```text
sequence_number
queue_number
```

Example:

```text
B001
B002
B003
```

## Requirements

Tidak boleh:

```sql
COUNT(*) + 1
```

Gunakan:

```text
Transaction
+
Row Lock
+
Atomic Increment
+
Database Constraint
```

## Tests

* [ ] First queue.
* [ ] Multiple queues.
* [ ] Different service.
* [ ] Different date.
* [ ] Concurrent requests.
* [ ] Duplicate prevention.

---

# Phase 8 — Queue Creation

## Flow

```text
Request
   ↓
Validate Patient
   ↓
Validate Service
   ↓
Check Service Active
   ↓
Generate Sequence
   ↓
Create Queue
   ↓
Create CREATED Event
   ↓
Commit
```

Initial state:

```text
stage  = REGISTRATION
status = WAITING
```

---

# Phase 9 — Queue State Machine

## State

```text
WAITING
CALLED
SERVING
COMPLETED
SKIPPED
CANCELLED
```

## Stage

```text
REGISTRATION
BLOOD_COLLECTION
```

## Rules

Registration:

```text
WAITING
   ↓
CALLED
   ↓
SERVING
   ↓
COMPLETED
```

Kemudian:

```text
REGISTRATION COMPLETED
        ↓
BLOOD_COLLECTION WAITING
```

Blood collection:

```text
WAITING
   ↓
CALLED
   ↓
SERVING
   ↓
COMPLETED
```

---

# Phase 10 — Registration Queue Calling

## Objective

Membangun manual calling untuk admin.

Flow:

```text
Admin
  ↓
Panggil Berikutnya
  ↓
Find eligible queue
  ↓
Lock
  ↓
Assign Loket 1
  ↓
CALLED
  ↓
Create Event
  ↓
Broadcast
```

## Acceptance Criteria

```text
B001
→ Loket 1
```

harus muncul pada display.

---

# Phase 11 — Registration Completion

Flow:

```text
B001
REGISTRATION / SERVING
        ↓
Selesai
        ↓
REGISTRATION COMPLETED
        ↓
BLOOD_COLLECTION WAITING
```

Create event:

```text
REGISTRATION_COMPLETED
```

---

# Phase 12 — Blood Collection Queue Engine

## Objective

Membangun queue claiming untuk tiga station.

```text
Meja 1
Meja 2
Meja 3
```

Ketika station melakukan call:

```text
Find WAITING
        ↓
Lock Queue
        ↓
Assign Station
        ↓
CALLED
        ↓
Create Event
        ↓
Broadcast
```

---

# Phase 13 — Blood Collection Operator Flow

UI:

```text
CURRENT QUEUE

B001

[Panggil Ulang]
[Mulai Layani]
[Selesai]
```

Flow:

```text
CALLED
   ↓
Mulai Layani
   ↓
SERVING
   ↓
Selesai
   ↓
COMPLETED
```

---

# Phase 14 — Automatic Next Queue Calling

Ini merupakan core requirement.

Ketika:

```text
B001
SERVING
```

menjadi:

```text
B001
COMPLETED
```

system langsung menjalankan:

```text
Find Next Eligible Queue
        ↓
Lock
        ↓
Assign Current Station
        ↓
CALLED
        ↓
Create AUTO_CALLED Event
        ↓
Broadcast
```

Example:

```text
B001 → COMPLETED
B002 → AUTO_CALLED
       ↓
     Meja 2
```

---

# Phase 15 — Multi-Station Concurrency

Test scenario:

```text
Meja 1 → complete B001
Meja 2 → complete B002
Meja 3 → complete B003
```

Expected:

```text
Meja 1 → B004
Meja 2 → B005
Meja 3 → B006
```

Never:

```text
Meja 1 → B004
Meja 2 → B004
Meja 3 → B004
```

## Tasks

* [ ] Transaction.
* [ ] Row locking.
* [ ] Queue claiming.
* [ ] Race condition test.
* [ ] Concurrent station test.

---

# Phase 16 — Queue Event / History

Implement:

```text
QueueEvent
```

Events:

```text
CREATED
REGISTRATION_CALLED
REGISTRATION_RECALLED
REGISTRATION_STARTED
REGISTRATION_COMPLETED
BLOOD_COLLECTION_CALLED
BLOOD_COLLECTION_RECALLED
BLOOD_COLLECTION_STARTED
BLOOD_COLLECTION_COMPLETED
AUTO_CALLED
SKIPPED
CANCELLED
```

Setiap event menyimpan:

```text
queue
actor
stage
station
metadata
timestamp
```

---

# Phase 17 — Display

## Registration Display

```text
NOW SERVING

B001

LOKET 1
```

## Blood Collection Display

```text
PENGAMBILAN DARAH

MEJA 1    MEJA 2    MEJA 3

B002      B005      B008
```

Display harus:

* [ ] Read-only.
* [ ] Real-time.
* [ ] Menampilkan station.
* [ ] Menampilkan current queue.
* [ ] Menampilkan recall.

---

# Phase 18 — Real-Time

Architecture:

```text
Next.js
   ↓
Domain Event
   ↓
Broadcast
   ↓
WebSocket
   ↓
Next.js (React)
```

Events:

```text
QUEUE_CALLED
QUEUE_RECALLED
QUEUE_COMPLETED
QUEUE_AUTO_CALLED
```

---

# Phase 19 — Authorization

Implement:

```text
Permission
+
Role
+
Stage
+
Station Assignment
```

Test:

```text
Admin
→ Registration

Doctor A
→ Blood Collection / Meja 1

Doctor B
→ Blood Collection / Meja 2
```

User tidak boleh melakukan operation pada station yang bukan assignment-nya.

---

# Phase 20 — Testing

## Unit Test

```text
QueueNumberGenerator
QueueStateTransition
QueueClaimService
AutomaticCallingService
StationAssignment
```

## Feature Test

```text
Create Queue
Registration Call
Registration Complete
Blood Collection Call
Blood Collection Start
Blood Collection Complete
Automatic Next Call
Recall
Skip
Cancel
```

## Concurrency Test

Simulasikan:

```text
100 concurrent queue creation
```

Expected:

```text
B001
B002
...
B100
```

dan:

```text
3 concurrent stations
```

Expected setiap queue hanya berhasil di-claim satu station.

---

# Phase 21 — Database Integrity

Constraints:

```text
UNIQUE(
    queue_service_id,
    queue_date,
    sequence_number
)
```

```text
UNIQUE(
    queue_service_id,
    queue_date,
    queue_number
)
```

Tambahkan index untuk operation yang sering dilakukan:

```text
queue_service_id
queue_date
status
current_stage
current_station_id
```

Index final ditentukan setelah query pattern implementation jelas.

---

# Phase 22 — Security Review

Review:

* [ ] Authentication.
* [ ] Authorization.
* [ ] Station assignment enforcement.
* [ ] Mass assignment protection.
* [ ] Request validation.
* [ ] CSRF.
* [ ] Rate limiting.
* [ ] Audit trail.
* [ ] Sensitive data exposure.
* [ ] Display endpoint access.

---

# Phase 23 — Performance Review

Review:

* [ ] Queue claiming query.
* [ ] Index usage.
* [ ] Lock duration.
* [ ] Transaction duration.
* [ ] WebSocket broadcast.
* [ ] Display polling/fallback.
* [ ] Database query count.

---

# Phase 24 — MVP Definition of Done

Flow berikut harus berhasil:

```text
PATIENT
   ↓
TAKE QUEUE
   ↓
B001
   ↓
REGISTRATION WAITING
   ↓
ADMIN CALL
   ↓
LOKET 1
   ↓
REGISTRATION
   ↓
COMPLETE
   ↓
BLOOD COLLECTION WAITING
   ↓
┌──────────┬──────────┬──────────┐
│  MEJA 1  │  MEJA 2  │  MEJA 3  │
└──────────┴──────────┴──────────┘
   ↓
DOCTOR CALL
   ↓
PATIENT
   ↓
SERVING
   ↓
COMPLETE
   ↓
AUTO CALL NEXT
   ↓
NEXT PATIENT
```

MVP dianggap berhasil apabila seluruh flow tersebut berjalan secara concurrency-safe dan setiap perubahan memiliki history/event.
