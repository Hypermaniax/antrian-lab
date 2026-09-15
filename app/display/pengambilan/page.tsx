import { queueService } from "@/services/queue.service";
import { PengambilanDisplayClient } from "@/components/pengambilan-display-client";
import type { Queue } from "@/db/schema";

export const dynamic = "force-dynamic";

export default async function PengambilanDisplayPage() {
  const { bloodDisplayData, mejaStations } = await queueService.getDisplayData();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mejaMap: Record<string, { queueNumber: string; patientName: string | null; status: string } | null> = {};
  for (const st of mejaStations) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const found = bloodDisplayData.find((r: any) => r.s.id === st.id);
    mejaMap[st.id] = found ? { queueNumber: found.q.queueNumber, patientName: found.q.patientName, status: found.q.displayStatus } : null;
  }

  return (
    <main className="h-screen w-screen overflow-hidden bg-zinc-950 text-white flex flex-col font-sans">
      <PengambilanDisplayClient initialMejaMap={mejaMap} mejaStations={mejaStations} />
      
      {/* FOOTER TICKER */}
      <div className="h-14 bg-zinc-900 border-t border-zinc-800/80 flex items-center px-12 text-zinc-500 text-base tracking-[0.2em] uppercase font-semibold">
        <span className="flex items-center gap-3">
          <div className="h-3 w-3 rounded-full bg-rose-500 animate-pulse shadow-[0_0_10px_rgba(225,29,72,0.8)]" /> 
          Sistem Antrean Realtime
        </span>
      </div>
    </main>
  );
}
