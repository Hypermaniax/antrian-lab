import { queueService } from "@/services/queue.service";
import { AutoRefresh } from "@/components/AutoRefresh";
import { Volume2 } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DaftarDisplayPage() {
  const { loket1, loket2, today } = await queueService.getDisplayData();

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
      <div className="flex-1 grid grid-cols-2 gap-10 p-10 lg:p-12">
        
        {/* LOKET 1 */}
        <div className={`rounded-[2.5rem] border flex flex-col items-center justify-center relative overflow-hidden transition-all duration-700 ${getBorderColor(loket1?.displayStatus)}`}>
          <div className="absolute top-10 text-4xl font-bold tracking-[0.2em] text-zinc-500">LOKET 1</div>
          
          {loket1 ? (
            <div className="flex flex-col items-center mt-12 w-full px-8">
              <div className="text-zinc-500 text-2xl tracking-[0.3em] font-medium mb-6">NOMOR ANTREAN</div>
              <div className={`text-[12vw] leading-none font-black tracking-tighter ${getStatusColor(loket1.displayStatus)}`}>
                {loket1.queueNumber}
              </div>
              <div className="text-2xl text-zinc-500 mt-4 font-medium tracking-widest">{loket1.patientName ?? "—"}</div>
              
              <div className="mt-16 h-24 flex items-center justify-center w-full max-w-2xl">
                {loket1.displayStatus === "COMPLETED" ? (
                  <div className="w-full h-full flex items-center justify-center rounded-2xl bg-zinc-800/40 text-zinc-500 text-4xl font-semibold tracking-wide">
                    Pelayanan Selesai
                  </div>
                ) : loket1.displayStatus === "SERVING" ? (
                  <div className="w-full h-full flex items-center justify-center rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 text-4xl font-bold tracking-wide shadow-[0_0_30px_rgba(52,211,153,0.15)]">
                    Sedang Dilayani
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center rounded-2xl bg-amber-950/60 border border-amber-500/50 text-amber-400 text-4xl font-bold tracking-wide shadow-[0_0_30px_rgba(251,191,36,0.15)] gap-4">
                    <Volume2 className="h-10 w-10 animate-pulse" />
                    Silakan Menuju Loket 1
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-[10vw] font-black text-zinc-800/50">—</div>
          )}
        </div>

        {/* LOKET 2 */}
        <div className={`rounded-[2.5rem] border flex flex-col items-center justify-center relative overflow-hidden transition-all duration-700 ${getBorderColor(loket2?.displayStatus)}`}>
          <div className="absolute top-10 text-4xl font-bold tracking-[0.2em] text-zinc-500">LOKET 2</div>
          
          {loket2 ? (
            <div className="flex flex-col items-center mt-12 w-full px-8">
              <div className="text-zinc-500 text-2xl tracking-[0.3em] font-medium mb-6">NOMOR ANTREAN</div>
              <div className={`text-[12vw] leading-none font-black tracking-tighter ${getStatusColor(loket2.displayStatus)}`}>
                {loket2.queueNumber}
              </div>
              <div className="text-2xl text-zinc-500 mt-4 font-medium tracking-widest">{loket2.patientName ?? "—"}</div>
              
              <div className="mt-16 h-24 flex items-center justify-center w-full max-w-2xl">
                {loket2.displayStatus === "COMPLETED" ? (
                  <div className="w-full h-full flex items-center justify-center rounded-2xl bg-zinc-800/40 text-zinc-500 text-4xl font-semibold tracking-wide">
                    Pelayanan Selesai
                  </div>
                ) : loket2.displayStatus === "SERVING" ? (
                  <div className="w-full h-full flex items-center justify-center rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 text-4xl font-bold tracking-wide shadow-[0_0_30px_rgba(52,211,153,0.15)]">
                    Sedang Dilayani
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center rounded-2xl bg-amber-950/60 border border-amber-500/50 text-amber-400 text-4xl font-bold tracking-wide shadow-[0_0_30px_rgba(251,191,36,0.15)] gap-4">
                    <Volume2 className="h-10 w-10 animate-pulse" />
                    Silakan Menuju Loket 2
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-[10vw] font-black text-zinc-800/50">—</div>
          )}
        </div>

      </div>
      
      {/* FOOTER TICKER */}
      <div className="h-14 bg-zinc-900 border-t border-zinc-800/80 flex items-center px-12 text-zinc-500 text-base tracking-[0.2em] uppercase font-semibold">
        <span className="flex items-center gap-3">
          <div className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(52,211,153,0.8)]" /> 
          Sistem Antrean Realtime
        </span>
      </div>
    </main>
  );
}
