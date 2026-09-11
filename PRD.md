# Product Requirements Document (PRD)

## Dynamic Laboratory Queue Management System

**Version:** 2.0
**Status:** Draft
**Platform:** Web Application
**Backend:** Nextjs
**Frontend:** nextjs
**Database:** PostgreSQL

---

# 1. Product Overview

## 1.1 Background

Laboratorium rumah sakit memiliki proses pelayanan yang terdiri dari beberapa tahap.

Pada proses pengambilan darah, pasien tidak langsung dilayani oleh dokter. Pasien terlebih dahulu:

1. Mengambil nomor antrean.
2. Menunggu pemanggilan di loket administrasi.
3. Dipanggil oleh petugas administrasi.
4. Melakukan proses registrasi.
5. Berkas pasien diteruskan kepada petugas/dokter pengambilan darah.
6. Menunggu pemanggilan di station pengambilan darah.
7. Dipanggil oleh dokter/petugas pengambilan darah.
8. Melakukan pengambilan darah.
9. Setelah selesai, sistem otomatis memanggil pasien berikutnya.

Sistem harus mampu merepresentasikan seluruh proses tersebut.

---

# 2. Product Goal

Membangun sistem antrean laboratorium yang:

1. Mendukung multiple queue service.
2. Memiliki queue numbering yang independen berdasarkan service dan tanggal.
3. Mendukung multi-stage queue workflow.
4. Mendukung multiple station pada suatu service.
5. Mendukung pemanggilan manual oleh petugas.
6. Mendukung automatic next queue calling.
7. Menampilkan pemanggilan kepada pasien melalui display.
8. Menjamin queue number tidak duplicate.
9. Menjamin queue calling aman terhadap concurrent requests.
10. Menyimpan history seluruh aktivitas queue.
11. Dapat dikembangkan menjadi sistem antrean rumah sakit yang lebih besar.

---

# 3. Scope

## 3.1 MVP Scope

MVP mencakup:

* Queue Service Management.
* Queue creation.
* Queue numbering.
* Registration stage.
* Registration station.
* Blood Collection stage.
* Multiple Blood Collection Stations.
* Manual queue calling.
* Automatic next queue calling.
* Queue lifecycle.
* Queue event history.
* Public queue display.
* Station management.
* Station assignment.
* Authorization.
* Concurrency-safe queue operations.

---

# 4. Non-Goals

Versi ini tidak mencakup:

* Medical record lengkap.
* Billing.
* Payment gateway.
* Inventory laboratorium.
* Laboratory result processing.
* Doctor consultation.
* Appointment management rumah sakit secara keseluruhan.
* BPJS integration.
* HIS/LIS integration.

---

# 5. Actors

## 5.1 Administrator

Administrator mengelola konfigurasi sistem.

Responsibilities:

* Manage queue services.
* Manage stations.
* Assign stations.
* Activate/deactivate queue services.
* View queue history.
* View queue monitoring.

---

## 5.2 Registration Officer

Registration Officer bekerja pada registration station.

Responsibilities:

* Melihat queue registration.
* Memanggil pasien.
* Melayani proses registrasi.
* Menyelesaikan registrasi.
* Melihat queue berikutnya.

---

## 5.3 Blood Collection Officer

Blood Collection Officer bekerja pada station pengambilan darah.

Responsibilities:

* Melihat queue yang sudah selesai registrasi.
* Memanggil pasien.
* Memanggil ulang pasien.
* Memulai pelayanan.
* Menyelesaikan pelayanan.
* Setelah menyelesaikan pasien, sistem otomatis memanggil queue berikutnya.

---

## 5.4 Display

Display bersifat read-only.

Display menampilkan:

* Queue number.
* Stage/service.
* Station tujuan.
* Current queue.
* Queue history terbaru.

---

# 6. Core Domain Concepts

## 6.1 Queue Service

Queue Service merupakan jenis layanan.

Contoh:

```text
BLOOD_COLLECTION
Pengambilan Darah
Prefix: B
```

Service bersifat dynamic.

Administrator dapat menambahkan service baru tanpa mengubah source code.

---

# 7. Queue

Queue merupakan representasi antrean pasien.

Contoh:

```text
Queue Number:
B001

Patient:
John Doe

Service:
Pengambilan Darah
```

Queue memiliki lifecycle yang melibatkan beberapa stage.

---

# 8. Queue Stage

Queue Stage menunjukkan tahapan pelayanan yang sedang dijalani pasien.

Contoh:

```text
REGISTRATION
BLOOD_COLLECTION
```

Contoh lifecycle:

```text
B001

REGISTRATION
    ↓
BLOOD_COLLECTION
    ↓
COMPLETED
```

Stage berbeda dengan Queue Service.

Stage menjelaskan **tahapan proses**, sedangkan Service menjelaskan **jenis layanan**.

---

# 9. Station

Station merupakan lokasi tempat petugas melakukan pemanggilan atau pelayanan.

Contoh:

```text
Registration
├── Loket 1

Blood Collection
├── Meja 1
├── Meja 2
└── Meja 3
```

Station harus bersifat dynamic.

Administrator dapat menambahkan atau menonaktifkan station.

---

# 10. Station Assignment

User/operator dapat memiliki station assignment.

Contoh:

```text
User:
Doctor A

Stage:
BLOOD_COLLECTION

Station:
Meja 1
```

Doctor A hanya dapat melakukan operation pada station yang menjadi tanggung jawabnya.

---

# 11. Queue Status

Status queue:

```text
WAITING
CALLED
SERVING
COMPLETED
SKIPPED
CANCELLED
```

Status harus dikombinasikan dengan stage.

Contoh:

```text
REGISTRATION + WAITING
```

berarti pasien sedang menunggu dipanggil oleh registration officer.

Sedangkan:

```text
BLOOD_COLLECTION + WAITING
```

berarti pasien sudah selesai registrasi dan sedang menunggu station pengambilan darah.

---

# 12. Main Business Flow

## 12.1 Patient Takes Queue

```text
Patient
   ↓
Select Service
   ↓
Generate Queue Number
   ↓
B001
   ↓
REGISTRATION / WAITING
```

---

# 13. Registration Flow

Registration officer memiliki station:

```text
Loket 1
```

Officer menekan:

```text
[Panggil Berikutnya]
```

System:

```text
Find next eligible queue
        ↓
Lock queue
        ↓
B001 → CALLED
        ↓
Assign Loket 1
        ↓
Broadcast event
```

Display:

```text
B001
Silakan menuju
Loket 1
```

---

# 14. Registration Completion

Setelah pasien selesai melakukan registrasi:

```text
B001
REGISTRATION
SERVING
```

Officer menekan:

```text
[Selesai Registrasi]
```

System:

```text
B001
REGISTRATION → COMPLETED
```

Kemudian queue berpindah ke:

```text
B001
BLOOD_COLLECTION
WAITING
```

Pasien sekarang menunggu dipanggil oleh station pengambilan darah.

---

# 15. Blood Collection Flow

Terdapat tiga station:

```text
Meja 1
Meja 2
Meja 3
```

Ketiga station menggunakan service yang sama:

```text
Pengambilan Darah
```

Tidak dibuat menjadi tiga queue service berbeda.

---

# 16. Doctor Calling

Doctor pada station tertentu menekan:

```text
[Panggil Berikutnya]
```

System mencari:

```text
stage = BLOOD_COLLECTION
status = WAITING
queue_date = today
```

System mengambil queue paling awal yang belum diambil oleh station lain.

Queue menjadi:

```text
B001
BLOOD_COLLECTION
CALLED
station = Meja 2
```

Display:

```text
B001

Silakan menuju
Meja 2
```

---

# 17. Recall

Jika pasien belum datang atau tidak mendengar panggilan:

```text
[Panggil Ulang]
```

System membuat event:

```text
RECALLED
```

Queue tetap berada pada:

```text
CALLED
```

---

# 18. Start Service

Setelah pasien berada di station:

```text
[Mulai Layani]
```

Queue:

```text
CALLED
   ↓
SERVING
```

System mencatat:

```text
serving_at
station_id
actor_id
```

---

# 19. Complete Service

Setelah pengambilan darah selesai:

```text
[Selesai]
```

System melakukan:

```text
B001
SERVING
   ↓
COMPLETED
```

Kemudian system mencari queue berikutnya.

---

# 20. Automatic Next Calling

Setelah sebuah queue selesai dilayani, station otomatis mencari queue berikutnya.

Contoh:

```text
B001 → COMPLETED
```

System:

```text
Find next eligible queue
        ↓
B002
        ↓
B002 → CALLED
        ↓
station = Meja 2
```

Display:

```text
B002
Silakan menuju
Meja 2
```

Tidak diperlukan operator menekan tombol `Panggil Berikutnya` lagi.

---

# 21. Automatic Calling Rules

Automatic calling hanya dilakukan jika:

1. Queue sebelumnya berhasil menjadi `COMPLETED`.
2. Station masih aktif.
3. Terdapat queue `WAITING`.
4. Queue berada pada stage yang sesuai.
5. Queue belum sedang diproses station lain.
6. Transaction berhasil.

Jika tidak ada queue:

```text
No Waiting Queue
```

Station menjadi:

```text
IDLE
```

---

# 22. Multi-Station Concurrency

Contoh:

```text
Meja 1 → B001
Meja 2 → B002
Meja 3 → B003
```

Jika tiga dokter menyelesaikan pelayanan secara bersamaan:

```text
Doctor 1 → complete
Doctor 2 → complete
Doctor 3 → complete
```

System tidak boleh menghasilkan:

```text
Meja 1 → B004
Meja 2 → B004
Meja 3 → B004
```

Harus:

```text
Meja 1 → B004
Meja 2 → B005
Meja 3 → B006
```

Queue claiming harus menggunakan transaction dan concurrency control.

---

# 23. Queue Events

Setiap aktivitas penting disimpan sebagai event.

Contoh:

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
SKIPPED
CANCELLED
```

Event menyimpan:

```text
queue_id
stage
station_id
actor_id
event
metadata
created_at
```

---

# 24. Queue Numbering

Format:

```text
PREFIX + SEQUENCE
```

Contoh:

```text
B001
B002
B003
```

Sequence reset berdasarkan tanggal.

Sequence harus atomic.

Tidak diperbolehkan:

```sql
COUNT(*) + 1
```

Gunakan:

```text
Transaction
+
Row Lock / Atomic Increment
+
Database Constraint
```

---

# 25. Data Model

Core entities:

```text
Patient
   │
   ▼
Queue
   │
   ├── QueueService
   ├── QueueSequence
   ├── QueueEvents
   └── Station

QueueService
   │
   └── Stations

User
   │
   └── StationAssignment
```

---

# 26. Conceptual Tables

## patients

```text
id
...
```

## queue_services

```text
id
code
name
prefix
description
is_active
created_at
updated_at
```

## stations

```text
id
queue_service_id
name
code
stage
is_active
created_at
updated_at
```

## station_assignments

```text
id
station_id
user_id
created_at
updated_at
```

## queues

```text
id
queue_service_id
patient_id
queue_date
sequence_number
queue_number
current_stage
current_station_id
status
called_at
serving_at
completed_at
cancelled_at
created_at
updated_at
```

## queue_sequences

```text
id
queue_service_id
queue_date
last_number
created_at
updated_at
```

## queue_events

```text
id
queue_id
event
stage
station_id
actor_id
metadata
created_at
```

---

# 27. Data Integrity

Database harus menjamin:

```text
UNIQUE(
    queue_service_id,
    queue_date,
    sequence_number
)
```

dan:

```text
UNIQUE(
    queue_service_id,
    queue_date,
    queue_number
)
```

Selain itu:

* Station harus valid.
* Station harus aktif.
* Service harus aktif ketika queue dibuat.
* Queue hanya dapat di-claim satu station.
* Invalid state transition ditolak.
* Queue number tidak boleh duplicate.

---

# 28. Queue Claiming

Calling queue harus dianggap sebagai operasi **claim**.

Contoh:

```text
WAITING
   ↓
CLAIM
   ↓
CALLED
```

Saat station mengambil queue:

```text
BEGIN TRANSACTION

Find eligible queue
Lock queue
Validate state
Assign station
Update status
Create event

COMMIT
```

Tujuannya memastikan dua station tidak mendapatkan queue yang sama.

---

# 29. Display System

Display memiliki minimal dua jenis view.

## Registration Display

```text
REGISTRATION

NOW SERVING

B001

LOKET 1
```

## Blood Collection Display

```text
PENGAMBILAN DARAH

MEJA 1     MEJA 2     MEJA 3

B002       B005       B008
```

Display hanya read-only.

---

# 30. Real-Time Requirement

Setiap calling event harus dapat dikirim ke display.

Architecture:

```text
Next.js
   │
   ▼
Queue Event
   │
   ▼
Broadcast
   │
   ▼
WebSocket
   │
   ▼
Next.js (React) Display
```

Event yang dibroadcast:

```text
QUEUE_CALLED
QUEUE_RECALLED
QUEUE_COMPLETED
QUEUE_AUTO_CALLED
```

---

# 31. API Requirements

Contoh:

```text
GET    /queue-services
POST   /queue-services
GET    /queue-services/{id}
PUT    /queue-services/{id}
PATCH  /queue-services/{id}/status
```

Station:

```text
GET    /stations
POST   /stations
PUT    /stations/{id}
PATCH  /stations/{id}/status
```

Queue:

```text
POST   /queues
GET    /queues
GET    /queues/{id}
```

Registration:

```text
POST /queues/{id}/registration/call
POST /queues/{id}/registration/recall
POST /queues/{id}/registration/start
POST /queues/{id}/registration/complete
```

Blood Collection:

```text
POST /stations/{station}/queues/call
POST /stations/{station}/queues/{queue}/recall
POST /stations/{station}/queues/{queue}/start
POST /stations/{station}/queues/{queue}/complete
```

Automatic calling menjadi bagian dari operation `complete`.

---

# 32. Authorization

Permission minimal:

```text
queue.view
queue.create

queue.registration.call
queue.registration.recall
queue.registration.start
queue.registration.complete

queue.blood_collection.call
queue.blood_collection.recall
queue.blood_collection.start
queue.blood_collection.complete

queue-service.view
queue-service.create
queue-service.update
queue-service.activate
queue-service.deactivate

station.view
station.create
station.update
station.activate
station.deactivate

queue.history.view
```

Authorization harus mempertimbangkan:

```text
User
+
Permission
+
Stage
+
Station Assignment
```

---

# 33. Non-Functional Requirements

## Performance

Queue call harus cepat dan tidak melakukan query yang tidak diperlukan.

## Consistency

Queue claiming harus strongly consistent.

## Concurrency

Tidak boleh ada satu queue yang berhasil di-claim oleh dua station.

## Security

Semua operational endpoint harus authenticated dan authorized.

## Auditability

Setiap perubahan penting harus memiliki queue event.

## Scalability

Sistem harus mampu mendukung:

* Multiple services.
* Multiple stages.
* Multiple stations.
* Multiple operators.
* Real-time display.
* Concurrent queue operations.

---

# 34. Success Criteria

MVP berhasil apabila:

1. Pasien mendapatkan queue number.
2. Queue masuk registration stage.
3. Admin dapat memanggil queue.
4. Display menampilkan queue dan loket.
5. Admin dapat menyelesaikan registrasi.
6. Queue otomatis berpindah ke blood collection stage.
7. Tiga station pengambilan darah dapat bekerja secara bersamaan.
8. Dokter dapat memanggil queue.
9. Display menampilkan station tujuan.
10. Dokter dapat recall queue.
11. Dokter dapat memulai pelayanan.
12. Dokter dapat menyelesaikan pelayanan.
13. Setelah selesai, sistem otomatis memanggil queue berikutnya.
14. Dua station tidak pernah mendapatkan queue yang sama.
15. Semua event tercatat.
16. Queue number tidak duplicate.
17. Queue history tidak hilang.

---

# 35. Future Enhancements

Setelah MVP stabil:

* Priority queue.
* VIP queue.
* Emergency queue.
* Queue transfer.
* Estimated waiting time.
* Sound announcement.
* Daily reports.
* Average waiting time.
* Average service time.
* Audit dashboard.
* Multi-branch hospital.
* HIS/LIS integration.
* Mobile operator interface.
* Advanced queue analytics.
