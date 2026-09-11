import { queueService } from "@/services/queue.service";
import { AutoRefresh } from "@/components/AutoRefresh";
import { Volume2 } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function PengambilanDisplayPage() {
  const { bloodDisplayData, mejaStations, today } = await queueService.getDisplayData();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mejaMap: Record<string, { queueNumber: string; patientName: string | null; status: string } | null> = {};
  for (const st of mejaStations) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const found = bloodDisplayData.find((r: any) => r.s.id === st.id);
    mejaMap[st.id] = found ? { queueNumber: found.q.queueNumber, patientName: found.q.patientName, status: found.q.displayStatus } : null;
  }

  const getStatusColor = (status?: string) => {
    if (status === "SERVING") return "text-emerald-400 drop-shadow-[0_0_25px_rgba(52,211,153,0.4)]";
    if (status === "CALLED") return "text-amber-400 drop-shadow-[0_0_25px_rgba(251,191,36,0.5)] animate-pulse";
    return "text-zinc-600";
  };

  const getBorderColor = (status?: string) => {
    if (status === "SERVING") return "border-emerald-500/40 shadow-[0_0_40px_rgba(52,211,153,0.1)] bg-emerald-950/10";
    if (status === "CALLED") return "border-amber-500/50 shadow-[0_0_40px_rgba(251,191,36,0.15)] bg-amber-950/10";
    return "border-zinc-800/50 bg-zinc-900/20";
  };

  return (
    <main className="h-screen w-screen overflow-hidden bg-zinc-950 text-white flex flex-col font-sans">
      <AutoRefresh intervalMs={3000} />
      


      {/* CONTENT */}
      <div className={`flex-1 grid gap-8 p-10 lg:p-12 ${mejaStations.length > 2 ? 'grid-cols-3' : 'grid-cols-2'}`}>
        {mejaStations.map((st) => {
          const item = mejaMap[st.id];
          return (
            <div key={st.id} className={`rounded-[2.5rem] border flex flex-col items-center justify-center relative overflow-hidden transition-all duration-700 ${getBorderColor(item?.status)}`}>
              <div className="absolute top-10 text-3xl font-bold tracking-[0.2em] text-zinc-500">{st.name.toUpperCase()}</div>
              
              {item ? (
                <div className="flex flex-col items-center mt-12 w-full px-6">
                  <div className="text-zinc-500 text-xl tracking-[0.3em] font-medium mb-4">NOMOR ANTREAN</div>
                  <div className={`text-[8vw] xl:text-[9vw] leading-none font-black tracking-tighter ${getStatusColor(item.status)}`}>
                    {item.queueNumber}
                  </div>
                  <div className="text-xl text-zinc-500 mt-4 font-medium tracking-widest">{item.patientName ?? "—"}</div>
                  
                  <div className="mt-12 h-20 flex items-center justify-center w-full max-w-xl">
                    {item.status === "COMPLETED" ? (
                      <div className="w-full h-full flex items-center justify-center rounded-2xl bg-zinc-800/40 text-zinc-500 text-2xl xl:text-3xl font-semibold tracking-wide">
                        Pelayanan Selesai
                      </div>
                    ) : item.status === "SERVING" ? (
                      <div className="w-full h-full flex items-center justify-center rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 text-2xl xl:text-3xl font-bold tracking-wide shadow-[0_0_30px_rgba(52,211,153,0.15)]">
                        Sedang Dilayani
                      </div>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center rounded-2xl bg-amber-950/60 border border-amber-500/50 text-amber-400 text-2xl xl:text-3xl font-bold tracking-wide shadow-[0_0_30px_rgba(251,191,36,0.15)] gap-3">
                        <Volume2 className="h-8 w-8 animate-pulse" />
                        Silakan Menuju {st.name}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-[8vw] font-black text-zinc-800/50">—</div>
              )}
            </div>
          );
        })}
      </div>
      
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
