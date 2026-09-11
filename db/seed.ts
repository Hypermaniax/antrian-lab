import 'dotenv/config';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/lab_waiting_list';
const client = postgres(connectionString);
const db = drizzle(client, { schema });

async function seed() {
  console.log('🌱 Seeding lab_waiting_list...');

  // Bersihkan dulu (idempotent)
  await client`TRUNCATE queue_events, queues, queue_sequences, station_assignments, stations, queue_services CASCADE`;
  console.log('  truncated existing data');

  // Services — 2 utama: B (Daftar Darah via Loket 1 → Meja) & H (Ambil Hasil via Loket 2)
  const [bloodService] = await db
    .insert(schema.queueServices)
    .values({
      code: 'BLOOD_COLLECTION',
      name: 'Pengambilan Darah',
      prefix: 'B',
      description: 'Loket 1 khusus daftar pengambil darah (REGISTRATION → BLOOD_COLLECTION)',
      isActive: true,
    })
    .returning();
  console.log(`  service: ${bloodService.code} (${bloodService.prefix})`);

  const [hasilService] = await db
    .insert(schema.queueServices)
    .values({
      code: 'PENGAMBILAN_HASIL',
      name: 'Pengambilan Hasil',
      prefix: 'H',
      description: 'Loket 2 khusus pengambilan hasil (RESULT_PICKUP)',
      isActive: true,
    })
    .returning();
  console.log(`  service: ${hasilService.code} (${hasilService.prefix})`);

  // Opsional: simpan REGISTRATION untuk backward compat (tidak dipakai Loket 1 lagi karena Loket 1 sudah ke BLOOD_COLLECTION)
  // await db.insert(schema.queueServices).values({ code: 'REGISTRATION', name: 'Registrasi', prefix: 'R', description: 'Legacy', isActive: false });

  // Stations — Loket 1 (REGISTRATION) & Loket 2 (RESULT_PICKUP) + Meja 1-3 (BLOOD_COLLECTION)
  const stations = await db
    .insert(schema.stations)
    .values([
      { queueServiceId: bloodService.id, name: 'Loket 1', code: 'LOKET_1', stage: 'REGISTRATION', isActive: true },
      { queueServiceId: hasilService.id, name: 'Loket 2', code: 'LOKET_2', stage: 'RESULT_PICKUP', isActive: true },
      { queueServiceId: bloodService.id, name: 'Meja 1', code: 'MEJA_1', stage: 'BLOOD_COLLECTION', isActive: true },
      { queueServiceId: bloodService.id, name: 'Meja 2', code: 'MEJA_2', stage: 'BLOOD_COLLECTION', isActive: true },
      { queueServiceId: bloodService.id, name: 'Meja 3', code: 'MEJA_3', stage: 'BLOOD_COLLECTION', isActive: true },
    ])
    .returning();
  stations.forEach((s) => console.log(`  station: ${s.code} (${s.stage}) -> ${s.name}`));

  console.log('✅ Seed selesai');
  console.log('   B: Loket 1 → Meja 1-3');
  console.log('   H: Loket 2 langsung');
  await client.end();
}

seed().catch(async (e) => {
  console.error('❌ Seed gagal', e);
  await client.end();
  process.exit(1);
});
