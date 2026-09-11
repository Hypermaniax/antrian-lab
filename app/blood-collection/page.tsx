import { stationService } from '@/services/station.service';
import { queueService } from '@/services/queue.service';
import { BloodCollectionClient } from '@/components/blood-collection-client';

export const dynamic = 'force-dynamic';

export default async function BloodCollectionPage() {
  const allStations = await stationService.getStationsByStage('BLOOD_COLLECTION');
  const waiting = await queueService.getWaitingByStage('BLOOD_COLLECTION');

  // Single query via service — tanpa perulangan query
  const stationIds = allStations.map((s) => s.id);
  const allCurrentRows = await queueService.getActiveQueuesByStationIds(stationIds);

  const grouped = new Map<string, typeof allCurrentRows>();
  for (const row of allCurrentRows) {
    const sid = row.currentStationId!;
    if (!grouped.has(sid)) grouped.set(sid, []);
    grouped.get(sid)!.push(row);
  }

  const byStation: Record<string, (typeof waiting)[number] | null> = {};
  for (const st of allStations) {
    const rows = grouped.get(st.id) ?? [];
    byStation[st.id] = (rows.find((q) => q.status === 'CALLED' || q.status === 'SERVING') as never) ?? null;
  }

  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Pengambilan Darah — Meja 1 • 2 • 3</h1>
        <p className="text-sm text-muted-foreground">
          Satu layanan, banyak station. Claim antrean pakai transaction + FOR UPDATE. Selesai = COMPLETED + auto-call berikutnya ke meja yang sama.
        </p>
      </div>
      <BloodCollectionClient
        stations={allStations.map((s) => ({ id: s.id, name: s.name, code: s.code }))}
        waiting={waiting as never}
        byStation={byStation as never}
      />
    </main>
  );
}
