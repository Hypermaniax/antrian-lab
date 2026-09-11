import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { queueService } from "@/services/queue.service";

export const dynamic = "force-dynamic";

export default async function QueuesPage() {
  const rows = await queueService.getRecentQueues(50);
  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Daftar Antrean</h1>
        <p className="text-sm text-muted-foreground">50 antrean terbaru • status + stage kombinasi (PRD §11).</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Semua Antrean</CardTitle>
          <CardDescription>Queue number unik per service+date+sequenceNumber (constraint di DB).</CardDescription>
        </CardHeader>
        <CardContent>
          {rows.length===0 ? (
            <div className="text-sm text-muted-foreground border border-dashed rounded-md p-6 text-center">Belum ada data. <a href="/take" className="underline">Ambil antrean</a></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-xs text-muted-foreground">
                  <tr className="border-b">
                    <th className="text-left p-2 font-medium">Nomor</th>
                    <th className="text-left p-2 font-medium">Pasien</th>
                    <th className="text-left p-2 font-medium">Stage</th>
                    <th className="text-left p-2 font-medium">Status</th>
                    <th className="text-left p-2 font-medium">Tanggal</th>
                    <th className="text-left p-2 font-medium">Jam</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map(q=>(
                    <tr key={q.id} className="border-b last:border-0 hover:bg-muted/40">
                      <td className="p-2 font-mono font-bold">{q.queueNumber}</td>
                      <td className="p-2">{q.patientName ?? "—"}</td>
                      <td className="p-2"><Badge variant="outline" className="text-[11px]">{q.currentStage}</Badge></td>
                      <td className="p-2"><Badge variant={q.status==="COMPLETED" ? "default" : q.status==="WAITING" ? "secondary" : "outline"} className="text-[11px]">{q.status}</Badge></td>
                      <td className="p-2 text-xs">{q.queueDate}</td>
                      <td className="p-2 text-xs text-muted-foreground">{new Date(q.createdAt).toLocaleString("id-ID")}</td>
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
