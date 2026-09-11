import { fetchQueueServices } from "@/actions/queueServiceActions";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { queueService } from "@/services/queue.service";
import { Ticket, ClipboardList, TestTube, CheckCircle2, ArrowRight, FlaskConical } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [servicesRes, stats, recent] = await Promise.all([
    fetchQueueServices(),
    queueService.getDashboardStats(),
    queueService.getRecentQueues(6),
  ]);

  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      {/* Hero */}
      <div className="rounded-2xl border bg-gradient-to-br from-background via-background to-muted/40 p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            Sistem antrean dinamis • {stats.date} • {stats.stations} station aktif
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Laboratorium</h1>
          <p className="text-sm text-muted-foreground max-w-xl">Ambil nomor → Loket → Meja. Auto-call, tanpa antre ganda.</p>
          <div className="flex flex-wrap gap-2 pt-2">
            <Button asChild>
              <Link href="/take">
                <Ticket className="h-4 w-4" /> Ambil Antrean
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/display">
                <ClipboardList className="h-4 w-4" /> Lihat Display
              </Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href="/loket">
                Masuk Loket <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 lg:w-[420px] shrink-0">
          <Stat label="Total Hari Ini" value={stats.total} icon={Ticket} />
          <Stat label="Menunggu Loket" value={stats.waitingReg} icon={ClipboardList} />
          <Stat label="Menunggu Darah" value={stats.waitingBlood} icon={TestTube} />
          <Stat label="Selesai" value={stats.completed} icon={CheckCircle2} />
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Services */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <FlaskConical className="h-4 w-4" /> Layanan
            </CardTitle>
            <Button asChild variant="ghost" size="sm">
              <Link href="/admin">Kelola</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {!servicesRes.success ? (
              <div className="rounded-md border bg-destructive/10 p-3 text-sm text-destructive">Gagal memuat layanan.</div>
            ) : servicesRes.data.length === 0 ? (
              <div className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">Belum ada layanan.</div>
            ) : (
              <div className="grid sm:grid-cols-3 gap-3">
                {servicesRes.data.map((s: { id: string; name: string; prefix: string }) => (
                  <div key={s.id} className="rounded-xl border p-4 flex items-center justify-between">
                    <span className="font-medium text-sm">{s.name}</span>
                    <Badge variant="secondary" className="font-mono text-xs">{s.prefix}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Flow */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Alur</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5">
            <FlowStep n="1" title="Ambil nomor" desc="B001 • H001" active />
            <FlowStep n="2" title="Loket" desc="Loket 1 / Loket 2" />
            <FlowStep n="3" title="Meja" desc="Meja 1-3 • auto-call" highlight />
            <div className="grid grid-cols-2 gap-2 pt-2">
              <Button asChild size="sm" variant="outline"><Link href="/loket">Loket</Link></Button>
              <Button asChild size="sm"><Link href="/blood-collection">Meja</Link></Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent queues */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Antrean Terbaru</CardTitle>
            <CardDescription>6 antrean terakhir hari ini (urut terbaru)</CardDescription>
          </div>
          <Button asChild variant="ghost" size="sm"><Link href="/queues">Lihat semua</Link></Button>
        </CardHeader>
        <CardContent>
          {recent.length === 0 ? (
            <div className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
              Belum ada antrean. Coba <Link href="/take" className="underline">Ambil Antrean</Link>.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-xs text-muted-foreground">
                  <tr className="border-b">
                    <th className="text-left font-medium p-2">Nomor</th>
                    <th className="text-left font-medium p-2">Pasien</th>
                    <th className="text-left font-medium p-2">Stage</th>
                    <th className="text-left font-medium p-2">Status</th>
                    <th className="text-left font-medium p-2">Station</th>
                    <th className="text-left font-medium p-2">Waktu</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map((q) => (
                    <tr key={q.id} className="border-b last:border-0 hover:bg-muted/40">
                      <td className="p-2 font-mono font-medium">{q.queueNumber}</td>
                      <td className="p-2">{q.patientName ?? "—"}</td>
                      <td className="p-2"><Badge variant="outline" className="text-[11px]">{q.currentStage}</Badge></td>
                      <td className="p-2"><Badge className="text-[11px]" variant={q.status === "COMPLETED" ? "default" : q.status === "WAITING" ? "secondary" : "outline"}>{q.status}</Badge></td>
                      <td className="p-2 text-xs text-muted-foreground">{q.currentStationId?.slice(0, 8) ?? "—"}</td>
                      <td className="p-2 text-xs text-muted-foreground">{new Date(q.createdAt).toLocaleTimeString("id-ID")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}

function Stat({ label, value, icon: Icon }: { label: string; value: number; icon: React.ElementType }) {
  return (
    <div className="rounded-xl border bg-card p-3">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{label}</span><Icon className="h-3.5 w-3.5" />
      </div>
      <div className="text-2xl font-bold mt-1">{value}</div>
    </div>
  );
}

function FlowStep({ n, title, desc, active, highlight }: { n: string; title: string; desc: string; active?: boolean; highlight?: boolean }) {
  return (
    <div className={`flex gap-3 rounded-lg border p-3 ${active ? "bg-primary text-primary-foreground border-primary" : highlight ? "bg-emerald-50 border-emerald-200" : "bg-card"}`}>
      <div className={`h-6 w-6 shrink-0 rounded-full grid place-items-center text-xs font-bold ${active ? "bg-primary-foreground text-primary" : "bg-muted text-foreground"}`}>{n}</div>
      <div>
        <div className="text-sm font-medium leading-none">{title}</div>
        <div className={`text-xs ${active ? "text-primary-foreground/80" : "text-muted-foreground"}`}>{desc}</div>
      </div>
    </div>
  );
}
