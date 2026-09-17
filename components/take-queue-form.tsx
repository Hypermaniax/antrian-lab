"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { createQueue } from "@/actions/queueActions"
import { Ticket, Loader2, CheckCircle2, TestTube, FileText, ArrowRight } from "lucide-react"

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
      <Card className="rounded-2xl shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <div className="h-8 w-8 rounded-xl bg-primary/10 grid place-items-center">
              <Ticket className="h-4 w-4 text-primary"/>
            </div>
            Pilih Layanan
          </CardTitle>
          <CardDescription className="text-xs">Tekan tombol untuk mendapatkan nomor antrean.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {services.length === 0 ? (
            <p className="text-sm text-muted-foreground border border-dashed rounded-xl p-6 text-center">Tidak ada layanan aktif.</p>
          ) : (
            <div className="grid gap-3">
              {services.map((s) => {
                const isLoading = loadingId === s.id
                const isSelected = serviceId === s.id
                const isLoket1 = s.prefix === "B" || s.code === "BLOOD_COLLECTION"
                const loketInfo = isLoket1 ? "→ Loket 1 Daftar Darah" : "→ Loket 2 Pengambilan Hasil"
                const ServiceIcon = isLoket1 ? TestTube : FileText
                return (
                  <div
                    key={s.id}
                    className={`group rounded-xl border-2 p-4 flex items-center justify-between gap-4 transition-all duration-200 cursor-pointer ${
                      isSelected 
                        ? "border-primary/40 bg-primary/[0.03] shadow-sm" 
                        : "border-transparent hover:border-border hover:bg-muted/30"
                    }`}
                    onClick={() => setServiceId(s.id)}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`h-10 w-10 rounded-xl grid place-items-center shrink-0 transition-all ${
                        isLoket1 
                          ? "bg-blue-500/10 text-blue-600" 
                          : "bg-amber-500/10 text-amber-600"
                      }`}>
                        <ServiceIcon className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-sm flex items-center gap-2">
                          {s.name}
                          <Badge variant="secondary" className={`font-mono text-xs ${
                            isLoket1 ? "bg-blue-500/10 text-blue-700 border-0" : "bg-amber-500/10 text-amber-700 border-0"
                          }`}>{s.prefix}</Badge>
                        </div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                          <ArrowRight className="h-3 w-3" />{loketInfo}
                        </div>
                      </div>
                    </div>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation()
                        setServiceId(s.id)
                        handleTake(s.id)
                      }}
                      disabled={!!loadingId}
                      size="lg"
                      className={`shrink-0 rounded-xl shadow-md hover:shadow-lg transition-all hover:scale-[1.02] ${
                        isLoket1 
                          ? "bg-gradient-to-r from-blue-600 to-blue-500" 
                          : "bg-gradient-to-r from-amber-600 to-amber-500"
                      }`}
                    >
                      {isLoading ? <><Loader2 className="h-4 w-4 animate-spin mr-1"/> Memproses…</> : <>Ambil Nomor</>}
                    </Button>
                  </div>
                )
              })}
            </div>
          )}

          {error && <div className="rounded-xl bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">{error}</div>}
          
          <div className="flex gap-3 text-xs text-muted-foreground justify-center pt-1">
            <span className="inline-flex items-center gap-1.5 bg-blue-500/5 px-2.5 py-1 rounded-full">
              <span className="h-2 w-2 rounded-full bg-blue-500"/>Loket 1 • B
            </span>
            <span className="inline-flex items-center gap-1.5 bg-amber-500/5 px-2.5 py-1 rounded-full">
              <span className="h-2 w-2 rounded-full bg-amber-500"/>Loket 2 • H
            </span>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <Card className={`rounded-2xl overflow-hidden transition-all duration-300 ${
          result 
            ? "border-emerald-300 shadow-md shadow-emerald-100" 
            : "border-dashed"
        }`}>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <div className={`h-6 w-6 rounded-lg grid place-items-center ${result ? "bg-emerald-500/10" : "bg-muted"}`}>
                <Ticket className={`h-3 w-3 ${result ? "text-emerald-600" : "text-muted-foreground"}`} />
              </div>
              Tiket Antrean
            </CardTitle>
            <CardDescription className="text-xs">{result ? "Nomor antrean berhasil diambil" : "Belum ada tiket"}</CardDescription>
          </CardHeader>
          <CardContent>
            {result ? (
              <div className="text-center py-6 space-y-4">
                {/* Ticket visual */}
                <div className="relative mx-auto w-48 rounded-2xl border-2 border-dashed border-emerald-300 bg-gradient-to-b from-emerald-50/80 to-background p-6">
                  <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-emerald-500 text-white text-[10px] font-bold rounded-full tracking-wider uppercase">Tiket</div>
                  <div className="text-4xl font-mono font-black tracking-widest text-emerald-700 mt-2">
                    {result.queueNumber}
                  </div>
                  <div className="h-px bg-emerald-200 my-3 mx-4" />
                  <div className="text-xs text-emerald-600 font-medium">{result.serviceName}</div>
                </div>
                
                <div className="flex items-center justify-center gap-1.5 text-sm text-emerald-600">
                  <CheckCircle2 className="h-4 w-4"/>
                  <span className="font-medium">Berhasil</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  {result.queueNumber.startsWith("H") ? "Loket 2" : "Loket 1 → Meja"} • <a href="/display" className="text-primary underline underline-offset-2 hover:text-primary/80">Lihat Display</a>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center space-y-2">
                <div className="mx-auto h-12 w-12 rounded-2xl bg-muted/50 grid place-items-center">
                  <Ticket className="h-5 w-5 text-muted-foreground/50" />
                </div>
                <div className="text-sm text-muted-foreground">Pilih layanan dan ambil nomor.</div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
