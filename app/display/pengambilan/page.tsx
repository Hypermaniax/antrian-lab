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
    <main className="h-screen w-screen overflow-hidden mesh-bg text-white flex flex-col font-sans">
      <PengambilanDisplayClient initialMejaMap={mejaMap} mejaStations={mejaStations} />
      
      {/* FOOTER TICKER */}
      <div className="h-12 bg-zinc-900/80 backdrop-blur-sm border-t border-zinc-800/60 flex items-center overflow-hidden relative">
        <div className="flex items-center gap-4 px-8 animate-ticker whitespace-nowrap">
          <span className="flex items-center gap-2 text-zinc-400 text-sm tracking-[0.15em] uppercase font-semibold">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500 shadow-[0_0_8px_rgba(225,29,72,0.8)]" />
            </span>
            Pengambilan Darah — Realtime
          </span>
          <span className="text-zinc-700 mx-4">•</span>
          <span className="text-zinc-500 text-sm tracking-wider">Meja 1 — Meja 2 — Meja 3</span>
          <span className="text-zinc-700 mx-4">•</span>
          <span className="text-zinc-500 text-sm tracking-wider">Silakan menunggu nomor Anda dipanggil</span>
          <span className="text-zinc-700 mx-4">•</span>
          <span className="text-zinc-500 text-sm tracking-wider">Pastikan nomor antrean Anda sudah terdaftar</span>
          {/* Duplicate for seamless loop */}
          <span className="text-zinc-700 mx-8">•</span>
          <span className="flex items-center gap-2 text-zinc-400 text-sm tracking-[0.15em] uppercase font-semibold">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(225,29,72,0.8)]" />
            Pengambilan Darah — Realtime
          </span>
          <span className="text-zinc-700 mx-4">•</span>
          <span className="text-zinc-500 text-sm tracking-wider">Meja 1 — Meja 2 — Meja 3</span>
          <span className="text-zinc-700 mx-4">•</span>
          <span className="text-zinc-500 text-sm tracking-wider">Silakan menunggu nomor Anda dipanggil</span>
          <span className="text-zinc-700 mx-4">•</span>
          <span className="text-zinc-500 text-sm tracking-wider">Pastikan nomor antrean Anda sudah terdaftar</span>
        </div>
      </div>
    </main>
  );
}
