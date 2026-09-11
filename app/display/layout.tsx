export default function DisplayLayout({ children }: { children: React.ReactNode }) {
  // Full UI tanpa sidebar — untuk TV display, fixed overlay nutup sidebar root
  // Biarkan page atur bg sendiri (daftar/pengambilan pakai bg-black, selector pakai bg-background)
  return <div className="fixed inset-0 z-50 overflow-auto bg-background">{children}</div>;
}
