import { fetchQueueServices } from "@/actions/queueServiceActions";
import { TakeQueueForm } from "@/components/take-queue-form";

export const dynamic = "force-dynamic";

export default async function TakePage() {
  const res = await fetchQueueServices();
  // Loket Registrasi dan Pengambilan Darah itu BERBEDA:
  // - Loket Registrasi = stage REGISTRATION (Loket 1)
  // - Pengambilan Darah = stage BLOOD_COLLECTION (Meja 1-3)
  // Pasien HANYA ambil nomor untuk layanan lab (BLOOD_COLLECTION, prefix B).
  // Antrean akan mulai di REGISTRATION/WAITING lalu otomatis pindah ke BLOOD_COLLECTION/WAITING setelah selesai registrasi.
  // Jadi filter: jangan tampilkan REGISTRATION sebagai pilihan ambil nomor (itu bukan layanan yang diambil pasien).
  const services = res.success
    ? res.data.filter((s) => s.isActive && s.code !== "REGISTRATION" && s.prefix !== "R")
    : [];

  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Ambil Antrean</h1>
        <p className="text-sm text-muted-foreground">Pasien hanya menekan tombol layanan — tanpa input nama. Nomor di-generate otomatis (B001) → REGISTRATION WAITING</p>
      </div>
      <TakeQueueForm services={services} />
    </main>
  );
}
