import { fetchQueueServices } from "@/actions/queueServiceActions";
import { fetchStations } from "@/actions/stationActions";
import { AdminServices } from "@/components/admin-services";
import { AdminStations } from "@/components/admin-stations";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const [svcRes, stRes] = await Promise.all([fetchQueueServices(), fetchStations()]);

  const services = svcRes.success ? svcRes.data : [];
  const stations = stRes.success ? stRes.data : [];

  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Kelola — Services & Stations</h1>
        <p className="text-sm text-muted-foreground">PRD §5.1 Administrator: kelola layanan dinamis & station assignment (tanpa auth untuk sekarang).</p>
      </div>

      <Tabs defaultValue="services">
        <TabsList>
          <TabsTrigger value="services">Services ({services.length})</TabsTrigger>
          <TabsTrigger value="stations">Stations ({stations.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="services">
          <AdminServices initial={services as never} />
        </TabsContent>
        <TabsContent value="stations">
          <AdminStations stations={stations as never} services={services as never} />
        </TabsContent>
      </Tabs>
    </main>
  );
}
