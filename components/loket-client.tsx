"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { callNextQueue, recallQueue, startQueueService, completeQueueService } from "@/actions/queueActions"
import { Loader2, Megaphone, Play, CheckCircle2 } from "lucide-react"

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
    return <div className="rounded-md border p-6 text-sm text-muted-foreground">Belum ada loket. Buat di /admin → Stations.</div>
  }

  return (
    <Tabs value={active} onValueChange={handleTabChange}>
      <TabsList className="w-full justify-start overflow-x-auto">
        {stations.map((s) => (
          <TabsTrigger key={s.id} value={s.id} className="gap-2">
            {s.name} <Badge variant="outline" className="text-[10px]">{s.code}</Badge>
            <span className="hidden sm:inline text-xs text-muted-foreground">• {s.purpose}</span>
            {currentByStation[s.id] && <Badge variant="secondary" className="ml-1 text-[10px]">{currentByStation[s.id]!.queueNumber}</Badge>}
          </TabsTrigger>
        ))}
      </TabsList>

      {stations.map((s) => (
        <TabsContent key={s.id} value={s.id} className="space-y-4">
          <div className="grid lg:grid-cols-3 gap-6">
            <Card className={`lg:col-span-2 ${s.stage === "RESULT_PICKUP" ? "border-amber-200" : "border-primary/30"}`}>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <span className={`h-2 w-2 rounded-full ${s.stage === "RESULT_PICKUP" ? "bg-amber-500" : "bg-blue-500"}`} />
                  {s.name} <Badge variant="secondary" className="text-xs">{s.code}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {currentByStation[s.id] ? (
                  (() => {
                    const cur = currentByStation[s.id]!
                    return (
                      <div className={`rounded-xl border-2 p-5 text-center space-y-3 ${s.stage === "RESULT_PICKUP" ? "border-amber-300 bg-amber-50/40" : "border-primary/40 bg-primary/5"}`}>
                        <div className="text-3xl sm:text-4xl font-mono font-bold tracking-widest">{cur.queueNumber}</div>
                        <Badge variant="outline" className="text-xs">{cur.status}</Badge>
                        <Separator />
                        <div className="grid grid-cols-2 gap-4">
                          <Button variant="outline" size="lg" disabled={loading !== null} onClick={() => handleRecall(cur)}>
                            {loading === `recall-${cur.id}` ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <Megaphone className="h-5 w-5 mr-2" />} Ulang
                          </Button>
                          <Button
                            size="lg"
                            disabled={(cur.status !== "CALLED" && cur.status !== "SERVING") || loading !== null}
                            onClick={() => handleComplete(cur)}
                            className={s.stage === "RESULT_PICKUP" ? "bg-amber-600 hover:bg-amber-700" : ""}
                          >
                            {loading === `complete-${cur.id}` ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <CheckCircle2 className="h-5 w-5 mr-2" />} Selesai & Next
                          </Button>
                        </div>
                      </div>
                    )
                  })()
                ) : (
                  <div className="rounded-xl border border-dashed p-8 text-center space-y-3">
                    <div className="text-sm text-muted-foreground">Siap memanggil</div>
                    <Button onClick={handleCall} disabled={loading === "call" || (waitingByStage[s.stage]?.length ?? 0) === 0} size="lg">
                      {loading === "call" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Megaphone className="h-4 w-4" />} Panggil
                      {(waitingByStage[s.stage]?.[0] as Queue | undefined) ? ` ${(waitingByStage[s.stage][0] as Queue).queueNumber}` : ""}
                    </Button>
                  </div>
                )}

                {msg && <div className="rounded-md border bg-amber-50 p-2.5 text-sm text-amber-800">{msg}</div>}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Antrean • {s.stage}</CardTitle>
              </CardHeader>
              <CardContent>
                {(waitingByStage[s.stage]?.length ?? 0) === 0 ? (
                  <div className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">Kosong</div>
                ) : (
                  <div className="space-y-2 max-h-[360px] overflow-auto pr-1">
                    {waitingByStage[s.stage].slice(0, 8).map((q) => (
                      <div key={q.id} className="rounded-lg border px-3 py-2 flex items-center justify-between">
                        <span className="font-mono font-medium text-sm">{q.queueNumber}</span>
                        <Badge variant="secondary" className="text-xs">{q.status}</Badge>
                      </div>
                    ))}
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
