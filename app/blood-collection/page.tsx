import { stationService } from '@/services/station.service';
import { queueService } from '@/services/queue.service';
import { BloodCollectionClient } from '@/components/blood-collection-client';
import { QueueHistoryTable } from '@/components/queue-history-table';

export const dynamic = 'force-dynamic';

export default async function BloodCollectionPage(props: { searchParams: Promise<{ page?: string; stage?: string; date?: string }> }) {
  const searchParams = await props.searchParams;
  const page = Number(searchParams.page) || 1;
  const stage = searchParams.stage || "BLOOD_COLLECTION"; // Default for this page
  const date = searchParams.date || "";

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
        <h1 className="text-2xl font-bold tracking-tight">Pengambilan Darah</h1>
        <p className="text-sm text-muted-foreground">Meja pengambilan darah untuk antrean B dan C (semua meja paralel).</p>
      </div>
      <BloodCollectionClient
        stations={allStations}
        waiting={waiting as never}
        byStation={byStation as never}
      />
      <QueueHistoryTable page={page} stage={stage} date={date} />
    </main>
  );
}
