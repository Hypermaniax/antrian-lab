"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { callNextQueue, recallQueue, startQueueService, completeQueueService } from "@/actions/queueActions"
import { Loader2, Megaphone, Play, CheckCircle2, Users, Hash } from "lucide-react"

type Queue = {
  id: string
  queueNumber: string
  patientName: string | null
  currentStage: string
  status: string
  currentStationId: string | null
  createdAt: string | Date
}

type LoketStation = {
  id: string
  name: string
  code: string
  stage: string
  purpose: string
}

export function LoketClient({
  stations,
  waitingByStage,
  currentByStation,
}: {
  stations: LoketStation[]
  waitingByStage: Record<string, Queue[]>
  currentByStation: Record<string, Queue | null>
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [active, setActive] = React.useState(() => {
    const tab = searchParams.get("tab")
    return tab && stations.some((s) => s.id === tab) ? tab : stations[0]?.id ?? ""
  })
  // sync jika user navigasi via URL/back
  React.useEffect(() => {
    const tab = searchParams.get("tab")
    if (tab && stations.some((s) => s.id === tab) && tab !== active) {
      setActive(tab)
    }
  }, [searchParams, stations, active])

  const handleTabChange = (v: string) => {
    setActive(v)
    const params = new URLSearchParams(searchParams.toString())
    params.set("tab", v)
    router.replace(`?${params.toString()}`, { scroll: false })
  }

  const station = stations.find((s) => s.id === active)!
  const [loading, setLoading] = React.useState<string | null>(null)
  const [msg, setMsg] = React.useState<string | null>(null)

  async function handleCall() {
    setLoading("call")
    setMsg(null)
    const res = await callNextQueue(active)
    setLoading(null)
    if (!res.success) setMsg(res.error)
    else router.refresh()
  }
  async function handleRecall(q: Queue) {
    setLoading(`recall-${q.id}`)
    const res = await recallQueue(q.id, active)
    setLoading(null)
    if (!res.success) setMsg(res.error)
    else setMsg(`Recall ${q.queueNumber} dikirim ke display`)
  }
  async function handleStart(q: Queue) {
    setLoading(`start-${q.id}`)
    const res = await startQueueService(q.id, active)
    setLoading(null)
    if (!res.success) setMsg(res.error)
    else router.refresh()
  }
  async function handleComplete(q: Queue) {
    setLoading(`complete-${q.id}`)
    const res = await completeQueueService(q.id, active)
    setLoading(null)
    if (!res.success) setMsg(res.error)
    else {
      const auto = (res.data as { autoCalled?: Queue | null })?.autoCalled
      if (station.stage === "REGISTRATION") {
        setMsg(auto ? `Selesai ${q.queueNumber} (Masuk Pengambilan) • Auto-call ${auto.queueNumber} ke ${station.name}` : `Selesai ${q.queueNumber} (Masuk Pengambilan) • Antrean pendaftaran kosong`)
      } else {
        setMsg(auto ? `Selesai ${q.queueNumber} • Auto-call ${auto.queueNumber} ke ${station.name}` : `Selesai ${q.queueNumber} • Tidak ada antrean menunggu di ${station.name}`)
      }
      setTimeout(() => router.refresh(), 900)
    }
  }

  if (stations.length === 0) {
    return <div className="rounded-xl border p-6 text-sm text-muted-foreground">Belum ada loket. Buat di /admin → Stations.</div>
  }

  return (
    <Tabs value={active} onValueChange={handleTabChange}>
      <TabsList className="w-full justify-start overflow-x-auto rounded-xl bg-muted/50 p-1">
        {stations.map((s) => (
          <TabsTrigger key={s.id} value={s.id} className="gap-2 rounded-lg data-[state=active]:shadow-sm">
            <div className={`h-2 w-2 rounded-full ${s.stage === "RESULT_PICKUP" ? "bg-amber-500" : "bg-blue-500"}`} />
            {s.name}
            {currentByStation[s.id] && <Badge variant="secondary" className="ml-1 text-[10px] bg-primary/10 text-primary border-0">{currentByStation[s.id]!.queueNumber}</Badge>}
          </TabsTrigger>
        ))}
      </TabsList>

      {stations.map((s) => (
        <TabsContent key={s.id} value={s.id} className="space-y-4 mt-4">
          <div className="grid lg:grid-cols-3 gap-6">
            <Card className={`lg:col-span-2 rounded-2xl shadow-sm transition-shadow hover:shadow-md ${
              s.stage === "RESULT_PICKUP" ? "border-amber-200/60" : "border-primary/20"
            }`}>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <div className={`h-8 w-8 rounded-xl grid place-items-center ${
                    s.stage === "RESULT_PICKUP" ? "bg-amber-500/10" : "bg-blue-500/10"
                  }`}>
                    <Hash className={`h-4 w-4 ${s.stage === "RESULT_PICKUP" ? "text-amber-600" : "text-blue-600"}`} />
                  </div>
                  {s.name}
                  <Badge variant="secondary" className="text-xs">{s.code}</Badge>
                  <Badge variant="outline" className="text-[10px] text-muted-foreground">{s.purpose}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {currentByStation[s.id] ? (
                  (() => {
                    const cur = currentByStation[s.id]!
                    const isResult = s.stage === "RESULT_PICKUP"
                    return (
                      <div className={`rounded-2xl border-2 p-6 text-center space-y-4 transition-all ${
                        isResult 
                          ? "border-amber-300/60 bg-gradient-to-b from-amber-50/60 to-background" 
                          : "border-primary/30 bg-gradient-to-b from-primary/5 to-background"
                      }`}>
                        <div className="text-xs font-medium text-muted-foreground tracking-wider uppercase">Nomor Antrean</div>
                        <div className={`text-5xl sm:text-6xl font-mono font-black tracking-widest ${
                          isResult ? "text-amber-600" : "text-primary"
                        }`}>{cur.queueNumber}</div>
                        <Badge variant="outline" className={`text-xs ${
                          cur.status === "CALLED" ? "border-amber-300 text-amber-700 bg-amber-50" :
                          cur.status === "SERVING" ? "border-emerald-300 text-emerald-700 bg-emerald-50" :
                          ""
                        }`}>{cur.status}</Badge>
                        <Separator />
                        <div className="grid grid-cols-2 gap-3">
                          <Button variant="outline" size="lg" disabled={loading !== null} onClick={() => handleRecall(cur)} className="rounded-xl">
                            {loading === `recall-${cur.id}` ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <Megaphone className="h-5 w-5 mr-2" />} Ulang
                          </Button>
                          <Button
                            size="lg"
                            disabled={(cur.status !== "CALLED" && cur.status !== "SERVING") || loading !== null}
                            onClick={() => handleComplete(cur)}
                            className={`rounded-xl shadow-md hover:shadow-lg transition-all hover:scale-[1.02] ${
                              isResult ? "bg-gradient-to-r from-amber-600 to-amber-500" : "bg-gradient-to-r from-primary to-primary/80"
                            }`}
                          >
                            {loading === `complete-${cur.id}` ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <CheckCircle2 className="h-5 w-5 mr-2" />} Selesai & Next
                          </Button>
                        </div>
                      </div>
                    )
                  })()
                ) : (
                  <div className="rounded-2xl border-2 border-dashed p-8 text-center space-y-4">
                    <div className="mx-auto h-14 w-14 rounded-2xl bg-muted/50 grid place-items-center">
                      <Megaphone className="h-6 w-6 text-muted-foreground/50" />
                    </div>
                    <div className="text-sm text-muted-foreground">Siap memanggil antrean berikutnya</div>
                    <Button onClick={handleCall} disabled={loading === "call" || (waitingByStage[s.stage]?.length ?? 0) === 0} size="lg" className="rounded-xl bg-gradient-to-r from-primary to-primary/80 shadow-md hover:shadow-lg transition-all hover:scale-[1.02]">
                      {loading === "call" ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Megaphone className="h-4 w-4 mr-1" />} Panggil
                      {(waitingByStage[s.stage]?.[0] as Queue | undefined) ? ` ${(waitingByStage[s.stage][0] as Queue).queueNumber}` : ""}
                    </Button>
                  </div>
                )}

                {msg && (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0 text-amber-600" />
                    {msg}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="rounded-2xl shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <div className="h-6 w-6 rounded-lg bg-muted grid place-items-center">
                    <Users className="h-3 w-3 text-muted-foreground" />
                  </div>
                  Antrean {s.stage === "RESULT_PICKUP" ? "Hasil" : "Daftar"}
                  {(waitingByStage[s.stage]?.length ?? 0) > 0 && (
                    <Badge variant="secondary" className="text-[10px] bg-primary/10 text-primary border-0">{waitingByStage[s.stage].length}</Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {(waitingByStage[s.stage]?.length ?? 0) === 0 ? (
                  <div className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
                    <div className="mx-auto h-10 w-10 rounded-xl bg-muted/50 grid place-items-center mb-2">
                      <Users className="h-4 w-4 text-muted-foreground/50" />
                    </div>
                    Kosong
                  </div>
                ) : (
                  <div className="max-h-[360px] overflow-auto rounded-xl border">
                    <table className="w-full text-sm">
                      <thead className="text-xs text-muted-foreground sticky top-0 bg-card z-10">
                        <tr className="bg-muted/40">
                          <th className="text-left p-2.5 font-semibold">Nomor</th>
                          <th className="text-left p-2.5 font-semibold">Pasien</th>
                          <th className="text-right p-2.5 font-semibold">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {waitingByStage[s.stage].map((q, i) => (
                          <tr key={q.id} className={`border-t hover:bg-muted/30 transition-colors ${i % 2 === 0 ? '' : 'bg-muted/10'}`}>
                            <td className="p-2.5 font-mono font-bold text-primary">{q.queueNumber}</td>
                            <td className="p-2.5 truncate max-w-[120px]">{q.patientName || "—"}</td>
                            <td className="p-2.5 text-right"><Badge variant="secondary" className="text-[10px] bg-amber-500/10 text-amber-700 border-0">WAITING</Badge></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      ))}
    </Tabs>
  )
}
