"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { callNextQueue, recallQueue, startQueueService, completeQueueService } from "@/actions/queueActions"
import { Megaphone, Play, CheckCircle2, Loader2, FlaskConical } from "lucide-react"

type Queue = {
  id: string
  queueNumber: string
  patientName: string | null
  status: string
  currentStage: string
  currentStationId: string | null
}

type Station = { id: string; name: string; code: string }

export function BloodCollectionClient({ stations, waiting, byStation }: { stations: Station[]; waiting: Queue[]; byStation: Record<string, Queue | null> }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [active, setActive] = React.useState(() => {
    const tab = searchParams.get("tab")
    return tab && stations.some((s) => s.id === tab) ? tab : stations[0]?.id ?? ""
  })
  React.useEffect(() => {
    const tab = searchParams.get("tab")
    if (tab && stations.some((s) => s.id === tab) && tab !== active) setActive(tab)
  }, [searchParams])
  const handleTabChange = (v: string) => {
    setActive(v)
    const params = new URLSearchParams(searchParams.toString())
    params.set("tab", v)
    router.replace(`?${params.toString()}`, { scroll: false })
  }
  const current = byStation[active] ?? null
  const [loading, setLoading] = React.useState<string | null>(null)
  const [msg, setMsg] = React.useState<string | null>(null)

  const station = stations.find(s=>s.id===active)!

  async function handleCall() {
    setLoading("call")
    setMsg(null)
    const res = await callNextQueue(active)
    setLoading(null)
    if (!res.success) setMsg(res.error)
    else router.refresh()
  }
  async function handleRecall() {
    if (!current) return
    setLoading(`recall-${current.id}`)
    const res = await recallQueue(current.id, active)
    setLoading(null)
    if (!res.success) setMsg(res.error)
    else setMsg(`Recall ${current.queueNumber} ke display`)
  }
  async function handleStart() {
    if (!current) return
    setLoading(`start-${current.id}`)
    const res = await startQueueService(current.id, active)
    setLoading(null)
    if (!res.success) setMsg(res.error)
    else router.refresh()
  }
  async function handleComplete() {
    if (!current) return
    setLoading(`complete-${current.id}`)
    const res = await completeQueueService(current.id, active)
    setLoading(null)
    if (!res.success) setMsg(res.error)
    else {
      const auto = (res.data as { autoCalled?: Queue | null })?.autoCalled
      setMsg(auto ? `Selesai ${current.queueNumber} • Auto-call ${auto.queueNumber} ke ${station.name}` : `Selesai ${current.queueNumber} • Tidak ada antrean menunggu`)
      setTimeout(()=>router.refresh(), 900)
    }
  }

  if (stations.length===0) {
    return <div className="rounded-md border p-6 text-sm text-muted-foreground">Belum ada station BLOOD_COLLECTION. Buat di /admin → Stations (Meja 1-3).</div>
  }

  return (
    <div className="space-y-4">
      <Tabs value={active} onValueChange={handleTabChange}>
        <TabsList className="w-full justify-start overflow-x-auto">
          {stations.map(s=>(
            <TabsTrigger key={s.id} value={s.id} className="gap-1.5">
              <FlaskConical className="h-3.5 w-3.5" /> {s.name}
              {byStation[s.id] && <Badge variant="secondary" className="ml-1 text-[10px]">{byStation[s.id]!.queueNumber}</Badge>}
            </TabsTrigger>
          ))}
        </TabsList>

        {stations.map(s=>(
          <TabsContent key={s.id} value={s.id} className="space-y-4">
            <div className="grid lg:grid-cols-3 gap-4">
              <Card className="lg:col-span-2">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    {s.name} <Badge variant="secondary" className="text-xs">{s.code}</Badge>
                    {current && active===s.id && <Badge variant="outline" className="text-xs">{current.status}</Badge>}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {active===s.id && current ? (
                    <div className="rounded-xl border-2 p-5 text-center space-y-3 bg-muted/20">
                      <div className="text-3xl sm:text-4xl font-mono font-bold tracking-widest">{current.queueNumber}</div>
                      <Badge variant="outline" className="text-xs">{current.status}</Badge>
                      <Separator />
                        <div className="grid grid-cols-2 gap-4">
                          <Button variant="outline" size="lg" onClick={handleRecall} disabled={loading!==null}>
                            {loading===`recall-${current.id}` ? <Loader2 className="h-5 w-5 animate-spin mr-2"/> : <Megaphone className="h-5 w-5 mr-2"/>} Ulang
                          </Button>
                          <Button size="lg" onClick={handleComplete} disabled={(current.status!=="CALLED" && current.status!=="SERVING") || loading!==null}>
                            {loading===`complete-${current.id}` ? <Loader2 className="h-5 w-5 animate-spin mr-2"/> : <CheckCircle2 className="h-5 w-5 mr-2"/>} Selesai & Next
                          </Button>
                        </div>
                    </div>
                  ) : (
                    <div className="rounded-xl border border-dashed p-8 text-center space-y-3">
                      <div className="text-sm text-muted-foreground">Siap memanggil</div>
                      <Button onClick={handleCall} disabled={loading==="call" || waiting.length===0} size="lg">
                        {loading==="call" ? <Loader2 className="h-4 w-4 animate-spin"/> : <Megaphone className="h-4 w-4"/>} Panggil{waiting.length>0 ? ` ${waiting[0].queueNumber}` : ""}
                      </Button>
                    </div>
                  )}
                  {msg && <div className="rounded-md border p-2.5 text-sm bg-amber-50">{msg}</div>}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Antrean</CardTitle>
                </CardHeader>
                <CardContent>
                  {waiting.length===0 ? (
                    <div className="text-sm text-muted-foreground border border-dashed rounded-md p-6 text-center">Kosong</div>
                  ) : (
                    <div className="space-y-2 max-h-[320px] overflow-auto pr-1">
                      {waiting.slice(0,12).map(q=>(
                        <div key={q.id} className="flex items-center justify-between rounded-lg border px-3 py-2">
                          <span className="font-mono text-sm font-medium">{q.queueNumber}</span>
                          <Badge variant="secondary" className="text-xs">WAITING</Badge>
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
    </div>
  )
}
