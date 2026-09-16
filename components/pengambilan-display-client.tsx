"use client";

import { useEffect, useState } from "react";
import { Volume2 } from "lucide-react";
import { fetchDisplayData } from "@/actions/queueActions";
import type { Station } from "@/db/schema";

type MejaMapItem = { queueNumber: string; patientName: string | null; status: string } | null;

export function PengambilanDisplayClient({
  initialMejaMap,
  mejaStations,
}: {
  initialMejaMap: Record<string, MejaMapItem>;
  mejaStations: Station[];
}) {
  const [mejaMap, setMejaMap] = useState<Record<string, MejaMapItem>>(initialMejaMap);
  const [audioEnabled, setAudioEnabled] = useState(false);

  const speak = (queueNumber: string, stationName: string) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      
      const letter = queueNumber.charAt(0);
      const numbers = queueNumber.slice(1).split("").join(" ");
      const text = `Nomor antrean, ${letter}, ${numbers}, silakan menuju, ${stationName}`;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "id-ID";
      utterance.rate = 0.85;
      window.speechSynthesis.speak(utterance);
    }
  };

  const [bloodDisplayData, setBloodDisplayData] = useState<any[]>([]);

  useEffect(() => {
    const fetchLatest = async () => {
      const res = await fetchDisplayData();
      if (res.success && res.data) {
        setBloodDisplayData(res.data.bloodDisplayData || []);
        const newMap: Record<string, MejaMapItem> = {};
        for (const st of mejaStations) {
          const found = res.data.bloodDisplayData.find((r: any) => r.s.id === st.id);
          newMap[st.id] = found ? { queueNumber: found.q.queueNumber, patientName: found.q.patientName, status: found.q.displayStatus } : null;
        }
        setMejaMap(newMap);
      }
    };

    const eventSource = new EventSource("/api/stream");

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.action === "refresh") {
          fetchLatest();
          if (audioEnabled && data.speakData && mejaStations.some(s => s.name === data.speakData.stationName)) {
            speak(data.speakData.queueNumber, data.speakData.stationName);
          }
        }
      } catch (err) {
        // Safe ignore
      }
    };

    eventSource.onerror = (error) => {
      console.error("SSE Error:", error);
    };

    const interval = setInterval(fetchLatest, 15000);

    return () => {
      eventSource.close();
      clearInterval(interval);
    };
  }, [mejaStations, audioEnabled]);

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

  if (!audioEnabled) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-10 bg-zinc-950/50">
        <Volume2 className="h-20 w-20 text-zinc-600 mb-6" />
        <h2 className="text-2xl font-bold text-zinc-300 mb-8">Tampilan Pengambilan Darah Siap</h2>
        <button
          onClick={() => {
            setAudioEnabled(true);
            // Play a silent utterance to unlock audio context in Safari/Chrome
            if ("speechSynthesis" in window) {
              const u = new SpeechSynthesisUtterance("");
              window.speechSynthesis.speak(u);
            }
          }}
          className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-xl transition-all shadow-lg shadow-blue-500/20"
        >
          Mulai & Aktifkan Suara
        </button>
      </div>
    );
  }

  return (
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
  );
}
