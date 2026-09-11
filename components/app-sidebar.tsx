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
    <nav className={cn("flex flex-col gap-1", mobile && "gap-1.5")}>
      {items.map((it) => {
        const active = pathname === it.href || (it.href !== "/" && pathname.startsWith(it.href))
        const Icon = it.icon
        return (
          <Link
            key={it.href}
            href={it.href}
            onClick={() => setOpen(false)}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              mobile && "px-4 py-3 text-base"
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span className="flex-1">{it.label}</span>
            {it.badge && (
              <Badge
                variant={active ? "secondary" : "outline"}
                className={cn("ml-auto text-[10px] px-1.5 py-0 h-5", active && "bg-primary-foreground text-primary border-0")}
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
      <div className="lg:hidden sticky top-0 z-40 flex h-14 items-center justify-between border-b bg-background px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold" onClick={() => setOpen(false)}>
          <div className="h-8 w-8 rounded-lg bg-primary text-primary-foreground grid place-items-center">
            <FlaskConical className="h-4 w-4" />
          </div>
          <span>Lab Queue</span>
          <span className="text-xs font-normal text-muted-foreground">Dinamis</span>
        </Link>
        <Button variant="ghost" size="icon" onClick={() => setOpen(!open)} aria-label="Toggle sidebar">
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-[280px] bg-background border-r shadow-lg p-4 flex flex-col">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-8 w-8 rounded-lg bg-primary text-primary-foreground grid place-items-center">
                <FlaskConical className="h-4 w-4" />
              </div>
              <span className="font-semibold">Lab Queue</span>
            </div>
            <Nav mobile />
            <Separator className="my-4" />
            <div className="mt-auto space-y-3">
              <Button asChild className="w-full" onClick={() => setOpen(false)}>
                <Link href="/take">+ Antrean Baru</Link>
              </Button>
              <p className="text-xs text-muted-foreground text-center">Tanpa Auth • Dev</p>
            </div>
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:fixed lg:inset-y-0 lg:z-30 lg:w-[260px] lg:flex-col border-r bg-card">
        <div className="flex h-14 items-center gap-2 border-b px-6">
          <div className="h-8 w-8 rounded-lg bg-primary text-primary-foreground grid place-items-center">
            <FlaskConical className="h-4 w-4" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-semibold text-sm">Lab Queue</span>
            <span className="text-xs text-muted-foreground">Dinamis</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3">
          <div className="mb-2 px-3 py-2">
            <p className="text-xs font-semibold text-muted-foreground tracking-wider">MENU</p>
          </div>
          <Nav />
        </div>

        <div className="border-t p-4 space-y-3">
          <Button asChild className="w-full">
            <Link href="/take">+ Antrean Baru</Link>
          </Button>
          <div className="rounded-md bg-muted p-3">
            <p className="text-xs font-medium">Tanpa Auth</p>
            <p className="text-xs text-muted-foreground">Mode pengembangan</p>
          </div>
          <p className="text-xs text-muted-foreground text-center">Server Components • Actions + Repo</p>
        </div>
      </aside>
    </>
  )
}

export function SidebarInset({ children }: { children: React.ReactNode }) {
  return <div className="lg:pl-[260px] flex flex-col min-h-screen">{children}</div>
}
