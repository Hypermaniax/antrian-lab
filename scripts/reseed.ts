import 'dotenv/config';
import { db } from '../db';
import { queueEvents, queues, queueSequences, stations, queueServices } from '../db/schema';

async function seed() {
  console.log('Clearing database...');
  await db.delete(queueEvents);
  await db.delete(queues);
  await db.delete(queueSequences);
  await db.delete(stations);
  await db.delete(queueServices);

  console.log('Seeding Services...');
  const [svcLab] = await db.insert(queueServices).values([
    { code: 'LAB', name: 'Pemeriksaan Lab', prefix: 'B', isActive: true },
  ]).returning();
  
  const [svcResult] = await db.insert(queueServices).values([
    { code: 'RESULT_PICKUP', name: 'Pengambilan Hasil', prefix: 'H', isActive: true },
  ]).returning();

  console.log('Seeding Stations...');
  await db.insert(stations).values([
    { queueServiceId: svcLab.id, code: 'L1', name: 'Loket 1', stage: 'REGISTRATION', isActive: true },
    { queueServiceId: svcResult.id, code: 'L2', name: 'Loket 2', stage: 'RESULT_PICKUP', isActive: true },
    { queueServiceId: svcLab.id, code: 'M1', name: 'Meja 1', stage: 'BLOOD_COLLECTION', isActive: true },
    { queueServiceId: svcLab.id, code: 'M2', name: 'Meja 2', stage: 'BLOOD_COLLECTION', isActive: true },
    { queueServiceId: svcLab.id, code: 'M3', name: 'Meja 3', stage: 'BLOOD_COLLECTION', isActive: true },
  ]);

  console.log('Database seeded successfully! (Queue is reset, Stations created)');
  process.exit(0);
}

seed().catch(console.error);
