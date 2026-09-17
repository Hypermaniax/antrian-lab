"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  LayoutDashboard,
  Ticket,
  ClipboardList,
  TestTube,
  Monitor,
  Settings2,
  FlaskConical,
  Menu,
  X,
  Plus,
} from "lucide-react"

const items = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/take", label: "Ambil Antrean", icon: Ticket },
  { href: "/loket", label: "Loket", icon: ClipboardList, badge: "1 • 2" },
  { href: "/blood-collection", label: "Pengambilan Darah", icon: TestTube, badge: "3 Meja" },
  { href: "/display", label: "Display", icon: Monitor },
  { href: "/admin", label: "Kelola", icon: Settings2 },
]

export function AppSidebar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const Nav = ({ mobile = false }: { mobile?: boolean }) => (
    <nav className={cn("flex flex-col gap-1", mobile && "gap-1")}>
      {items.map((it) => {
        const active = pathname === it.href || (it.href !== "/" && pathname.startsWith(it.href))
        const Icon = it.icon
        return (
          <Link
            key={it.href}
            href={it.href}
            onClick={() => setOpen(false)}
            className={cn(
              "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 relative",
              active
                ? "bg-gradient-to-r from-primary/15 to-primary/5 text-primary shadow-sm"
                : "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
              mobile && "px-4 py-3 text-base"
            )}
          >
            {active && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-primary" />
            )}
            <div className={cn(
              "flex items-center justify-center h-8 w-8 rounded-lg transition-all duration-200",
              active
                ? "bg-primary text-primary-foreground shadow-md"
                : "bg-muted/60 text-muted-foreground group-hover:bg-accent group-hover:text-foreground"
            )}>
              <Icon className="h-4 w-4" />
            </div>
            <span className="flex-1">{it.label}</span>
            {it.badge && (
              <Badge
                variant={active ? "secondary" : "outline"}
                className={cn(
                  "ml-auto text-[10px] px-1.5 py-0 h-5 font-medium",
                  active && "bg-primary/10 text-primary border-primary/20"
                )}
              >
                {it.badge}
              </Badge>
            )}
          </Link>
        )
      })}
    </nav>
  )

  return (
    <>
      {/* Mobile top bar */}
      <div className="lg:hidden sticky top-0 z-40 flex h-14 items-center justify-between border-b bg-background/80 backdrop-blur-xl px-4">
        <Link href="/" className="flex items-center gap-2.5 font-semibold" onClick={() => setOpen(false)}>
          <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground grid place-items-center shadow-md">
            <FlaskConical className="h-4 w-4" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-sm font-bold">Lab Queue</span>
            <span className="text-[10px] font-normal text-muted-foreground">Sistem Antrean</span>
          </div>
        </Link>
        <Button variant="ghost" size="icon" onClick={() => setOpen(!open)} aria-label="Toggle sidebar" className="rounded-xl">
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-[280px] bg-background border-r shadow-2xl p-4 flex flex-col animate-[slide-in_0.3s_ease-out]">
            <div className="flex items-center gap-2.5 mb-6">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground grid place-items-center shadow-md">
                <FlaskConical className="h-4 w-4" />
              </div>
              <div className="flex flex-col leading-none">
                <span className="font-bold text-sm">Lab Queue</span>
                <span className="text-[10px] text-muted-foreground">Sistem Antrean Dinamis</span>
              </div>
            </div>
            <Nav mobile />
            <Separator className="my-4" />
            <div className="mt-auto space-y-3">
              <Button asChild className="w-full rounded-xl bg-gradient-to-r from-primary to-primary/80 shadow-md hover:shadow-lg transition-shadow" onClick={() => setOpen(false)}>
                <Link href="/take"><Plus className="h-4 w-4 mr-1" /> Antrean Baru</Link>
              </Button>
              <p className="text-[10px] text-muted-foreground text-center">Dev Mode • Tanpa Auth</p>
            </div>
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:fixed lg:inset-y-0 lg:z-30 lg:w-[260px] lg:flex-col border-r bg-sidebar/80 backdrop-blur-xl">
        <div className="flex h-16 items-center gap-2.5 border-b px-5">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground grid place-items-center shadow-md">
            <FlaskConical className="h-4.5 w-4.5" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-bold text-sm tracking-tight">Lab Queue</span>
            <span className="text-[11px] text-muted-foreground">Sistem Antrean Dinamis</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3">
          <div className="mb-2 px-3 py-2">
            <p className="text-[10px] font-bold text-muted-foreground/70 tracking-[0.15em] uppercase">Navigasi</p>
          </div>
          <Nav />
        </div>

        <div className="border-t p-4 space-y-3">
          <Button asChild className="w-full rounded-xl bg-gradient-to-r from-primary to-primary/80 shadow-md hover:shadow-lg transition-all hover:scale-[1.02]">
            <Link href="/take"><Plus className="h-4 w-4 mr-1" /> Antrean Baru</Link>
          </Button>
          <div className="rounded-xl bg-muted/50 p-3 border border-border/50">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_6px_rgba(52,211,153,0.6)]" />
              <p className="text-[11px] font-medium">Mode Dev</p>
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">Tanpa autentikasi</p>
          </div>
        </div>
      </aside>
    </>
  )
}

export function SidebarInset({ children }: { children: React.ReactNode }) {
  return <div className="lg:pl-[260px] flex flex-col min-h-screen">{children}</div>
}
