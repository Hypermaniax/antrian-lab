"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { createQueue } from "@/actions/queueActions"
import { Ticket, Loader2, CheckCircle2 } from "lucide-react"

export function TakeQueueForm({ services }: { services: { id: string; code: string; name: string; prefix: string }[] }) {
  const [serviceId, setServiceId] = React.useState(services[0]?.id ?? "")
  const [loadingId, setLoadingId] = React.useState<string | null>(null)
  const [result, setResult] = React.useState<null | { queueNumber: string; id: string; serviceName: string }>(null)
  const [error, setError] = React.useState<string | null>(null)

  async function handleTake(id: string) {
    setError(null)
    setLoadingId(id)
    const res = await createQueue({ queueServiceId: id })
    setLoadingId(null)
    if (!res.success) {
      setError(res.error)
      return
    }
    const svc = services.find((s) => s.id === id)
    setResult({
      queueNumber: (res.data as { queueNumber: string }).queueNumber,
      id: (res.data as { id: string }).id,
      serviceName: svc?.name ?? "",
    })
  }

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base"><Ticket className="h-4 w-4"/> Ambil Nomor</CardTitle>
          <CardDescription className="text-xs">Tekan tombol — tanpa nama.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {services.length === 0 ? (
            <p className="text-sm text-muted-foreground border border-dashed rounded-md p-6 text-center">Tidak ada layanan aktif.</p>
          ) : (
            <div className="grid gap-3">
              {services.map((s) => {
                const isLoading = loadingId === s.id
                const isSelected = serviceId === s.id
                const isLoket1 = s.prefix === "B" || s.code === "BLOOD_COLLECTION"
                const loketInfo = isLoket1 ? "→ Loket 1 Daftar Darah" : "→ Loket 2 Pengambilan Hasil"
                const loketColor = isLoket1 ? "bg-blue-500" : "bg-amber-500"
                return (
                  <div
                    key={s.id}
                    className={`rounded-xl border p-4 flex items-center justify-between gap-4 ${isSelected ? "border-primary bg-primary/5" : "hover:bg-muted/30"}`}
                  >
                    <div className="min-w-0">
                      <div className="font-medium text-sm flex items-center gap-2">
                        {s.name} <Badge variant="secondary" className="font-mono text-xs">{s.prefix}</Badge>
                      </div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1.5"><span className={`h-1.5 w-1.5 rounded-full ${loketColor}`} />{loketInfo}</div>
                    </div>
                    <Button
                      onClick={() => {
                        setServiceId(s.id)
                        handleTake(s.id)
                      }}
                      disabled={!!loadingId}
                      size="lg"
                      className={`shrink-0 ${!isLoket1 ? "bg-amber-600 hover:bg-amber-700" : ""}`}
                    >
                      {isLoading ? <><Loader2 className="h-4 w-4 animate-spin"/> Memproses…</> : <>Ambil Nomor</>}
                    </Button>
                  </div>
                )
              })}
            </div>
          )}

          {error && <div className="rounded-md bg-destructive/10 border p-3 text-sm text-destructive">{error}</div>}
          <div className="flex gap-2 text-xs text-muted-foreground justify-center">
            <span className="inline-flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-blue-500"/>Loket 1 • B</span>
            <span>•</span>
            <span className="inline-flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-amber-500"/>Loket 2 • H</span>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <Card className={`overflow-hidden ${result ? "border-emerald-200" : "border-dashed"}`}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Tiket</CardTitle>
            <CardDescription className="text-xs">{result ? result.queueNumber : "Belum ada tiket"}</CardDescription>
          </CardHeader>
          <CardContent>
            {result ? (
              <div className="text-center py-4 space-y-3">
                <div className="mx-auto h-16 w-32 rounded-xl border-2 border-dashed grid place-items-center bg-muted/30">
                  <span className="text-3xl font-mono font-bold tracking-widest">{result.queueNumber}</span>
                </div>
                <div className="text-sm text-emerald-600 inline-flex items-center gap-1"><CheckCircle2 className="h-4 w-4"/>{result.serviceName}</div>
                <div className="text-xs text-muted-foreground">{result.queueNumber.startsWith("H") ? "Loket 2" : "Loket 1 → Meja"} • <a href="/display" className="underline">Lihat Display</a></div>
              </div>
            ) : (
              <div className="py-8 text-center text-sm text-muted-foreground">Ambil nomor dulu.</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
