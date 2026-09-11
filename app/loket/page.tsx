import { stationService } from '@/services/station.service';
import { queueService } from '@/services/queue.service';
import { LoketClient } from '@/components/loket-client';

export const dynamic = 'force-dynamic';

export default async function LoketPage() {
  // Data diambil dari service, bukan query langsung di page
  const lokets = await stationService.getStationsByStage('REGISTRATION');
  const hasilLokets = await stationService.getStationsByStage('RESULT_PICKUP');
  const allLokets = [...lokets, ...hasilLokets].sort((a, b) => a.code.localeCompare(b.code));

  if (allLokets.length === 0) {
    return (
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="rounded-md border border-destructive/30 bg-destructive/10 p-6 text-sm text-destructive">
          Belum ada loket. Buat di /admin → Stations: <b>LOKET_1 REGISTRATION</b> (Daftar Darah) dan <b>LOKET_2 RESULT_PICKUP</b> (Pengambilan Hasil).
        </div>
      </main>
    );
  }

  const [waitingReg, waitingHasil] = await Promise.all([
    queueService.getWaitingByStage('REGISTRATION'),
    queueService.getWaitingByStage('RESULT_PICKUP'),
  ]);

  const waitingByStage: Record<string, typeof waitingReg> = {
    REGISTRATION: waitingReg,
    RESULT_PICKUP: waitingHasil,
  };

  // Single query via service — tanpa perulangan query
  const stationIds = allLokets.map((s) => s.id);
  const allCurrentRows = await queueService.getActiveQueuesByStationIds(stationIds);

  // Grouping di JS (bukan query loop)
  const grouped = new Map<string, typeof allCurrentRows>();
  for (const row of allCurrentRows) {
    const sid = row.currentStationId!;
    if (!grouped.has(sid)) grouped.set(sid, []);
    grouped.get(sid)!.push(row);
  }

  const currentByStation: Record<string, (typeof waitingReg)[number] | null> = {};
  for (const st of allLokets) {
    const rows = grouped.get(st.id) ?? [];
    currentByStation[st.id] = (rows.find((q) => q.status === 'CALLED' || q.status === 'SERVING') as never) ?? null;
  }

  const stationsForClient = allLokets.map((s) => ({
    id: s.id,
    name: s.name,
    code: s.code,
    stage: s.stage,
    purpose: s.stage === 'REGISTRATION' ? 'Daftar Pengambil Darah' : 'Pengambilan Hasil',
  }));

  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Loket</h1>
        <p className="text-sm text-muted-foreground">
          <b>Loket 1</b> khusus daftar pengambil darah (REGISTRATION → Meja) • <b>Loket 2</b> khusus pengambilan hasil (RESULT_PICKUP) — terpisah stage & antrean (B vs H).
        </p>
      </div>
      <LoketClient stations={stationsForClient} waitingByStage={waitingByStage as never} currentByStation={currentByStation as never} />
    </main>
  );
}
