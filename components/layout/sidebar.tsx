"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  LayoutDashboard, 
  Gamepad2, 
  Store, 
  BarChart3, 
  Settings,
  Menu,
  X
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useTranslations } from "@/lib/hooks/use-translations"

const navigationKeys = [
  { key: "dashboard", href: "/dashboard", icon: LayoutDashboard },
  { key: "collection", href: "/collection", icon: Gamepad2 },
  { key: "sellers", href: "/sellers", icon: Store },
  { key: "analytics", href: "/analytics", icon: BarChart3 },
  { key: "settings", href: "/settings", icon: Settings },
] as const

export function Sidebar() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = React.useState(false)
  const t = useTranslations('nav')

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-3 sm:top-4 left-3 sm:left-4 z-50">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsOpen(!isOpen)}
          className="bg-background shadow-md touch-manipulation h-10 w-10 sm:h-11 sm:w-11"
        >
          {isOpen ? <X className="h-5 w-5 sm:h-6 sm:w-6" /> : <Menu className="h-5 w-5 sm:h-6 sm:w-6" />}
        </Button>
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-40 h-screen w-64 bg-card border-r transition-transform duration-300 ease-in-out",
          "lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center h-14 sm:h-16 px-4 sm:px-6 border-b">
            <Gamepad2 className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            <span className="ml-2 text-lg sm:text-xl font-bold">RakGame</span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto overscroll-contain">
            {navigationKeys.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.key}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "flex items-center px-3 py-3 text-sm font-medium rounded-md transition-colors touch-manipulation",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <item.icon className="h-5 w-5 mr-3 flex-shrink-0" />
                  {t(item.key)}
                </Link>
              )
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t text-xs text-muted-foreground">
            <p>© 2024 RakGame</p>
          </div>
        </div>
      </aside>
    </>
  )
}
