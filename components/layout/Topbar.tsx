"use client"
import { useEffect } from "react"
import { usePathname, useSearchParams } from "next/navigation"
import { Menu } from "lucide-react"
import { usePortalStore } from "@/store/portalStore"

const pageTitles: Record<string, string> = {
  "/overview": "Overview",
  "/working-on": "I'm Working On",
  "/needs-from-you": "Needs from You",
  "/send-files": "Send Files",
  "/book-a-call": "Book a Call",
  "/lead-pipeline": "Lead Pipeline",
  "/analytics": "Analytics",
  "/content-board": "Content Board",
  "/contact": "Contact & Hours",
}

interface TopbarProps {
  onMenuClick: () => void
}

export function Topbar({ onMenuClick }: TopbarProps) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const isAdminMode = usePortalStore((s) => s.isAdminMode)
  const setAdminMode = usePortalStore((s) => s.setAdminMode)

  useEffect(() => {
    if (searchParams.get("mode") === "admin") setAdminMode(true)
  }, [searchParams, setAdminMode])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === "A") {
        e.preventDefault()
        setAdminMode(!isAdminMode)
      }
    }
    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [isAdminMode, setAdminMode])

  const title = pageTitles[pathname] || "Portal"

  return (
    <header className="sticky top-0 h-14 bg-white border-b border-gray-100 px-4 sm:px-8 flex items-center justify-between z-30">
      <div className="flex items-center gap-3">
        {/* Hamburger — mobile only */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>
        <h1 className="font-semibold text-sm text-gray-900">{title}</h1>
      </div>
      {isAdminMode && (
        <span className="bg-blue-100 text-blue-700 text-xs font-medium px-2 py-1 rounded">
          Admin Mode
        </span>
      )}
    </header>
  )
}
