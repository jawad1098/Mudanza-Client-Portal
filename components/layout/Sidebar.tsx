"use client"
import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, CheckSquare, AlertCircle, Upload, Phone, TrendingUp, BarChart2, Layout, MessageCircle, X, Pencil, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { usePortalStore } from "@/store/portalStore"

const nav = [
  {
    section: "MAIN",
    items: [
      { href: "/overview", label: "Overview", icon: LayoutDashboard },
      { href: "/working-on", label: "I'm Working On", icon: CheckSquare, badge: "tasks" },
      { href: "/needs-from-you", label: "Needs from You", icon: AlertCircle, badge: "needs" },
    ],
  },
  {
    section: "TOOLS",
    items: [
      { href: "/send-files", label: "Send Files", icon: Upload },
      { href: "/book-a-call", label: "Book a Call", icon: Phone },
    ],
  },
  {
    section: "REPORTS",
    items: [
      { href: "/lead-pipeline", label: "Lead Pipeline", icon: TrendingUp },
      { href: "/analytics", label: "Analytics", icon: BarChart2 },
      { href: "/content-board", label: "Content Board", icon: Layout },
    ],
  },
  {
    section: "INFO",
    items: [
      { href: "/contact", label: "Contact & Hours", icon: MessageCircle },
    ],
  },
]

interface SidebarProps {
  open?: boolean
  onClose?: () => void
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname()
  const tasks = usePortalStore((s) => s.tasks)
  const needs = usePortalStore((s) => s.needs)
  const isAdmin = usePortalStore((s) => s.isAdminMode)
  const clientConfig = usePortalStore((s) => s.clientConfig)
  const updateClientConfig = usePortalStore((s) => s.updateClientConfig)

  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(clientConfig)

  const pendingTasks = tasks.filter((t) => t.status === "pending").length
  const unmetNeeds = needs.filter((n) => !n.done).length

  const getBadge = (badge?: string) => {
    if (badge === "tasks") return pendingTasks > 0 ? pendingTasks : null
    if (badge === "needs") return unmetNeeds > 0 ? unmetNeeds : null
    return null
  }

  const startEdit = () => { setDraft(clientConfig); setEditing(true) }

  const saveEdit = () => {
    const initials = draft.initials || draft.fullName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    updateClientConfig({ ...draft, initials })
    setEditing(false)
  }

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-100 flex flex-col z-40 transition-transform duration-200",
        "lg:translate-x-0",
        open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}
    >
      {/* Brand */}
      <div className="p-5 border-b border-gray-100">
        {editing ? (
          <div className="space-y-2">
            <div>
              <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide block mb-1">Company</label>
              <input
                value={draft.company}
                onChange={(e) => setDraft((d) => ({ ...d, company: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide block mb-1">Full Name</label>
              <input
                value={draft.fullName}
                onChange={(e) => setDraft((d) => ({ ...d, fullName: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide block mb-1">First Name</label>
              <input
                value={draft.name}
                onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide block mb-1">Initials</label>
              <input
                value={draft.initials}
                onChange={(e) => setDraft((d) => ({ ...d, initials: e.target.value.toUpperCase().slice(0, 2) }))}
                maxLength={2}
                placeholder="Auto"
                className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-1.5 pt-1">
              <button onClick={() => setEditing(false)} className="flex-1 flex items-center justify-center gap-1 border border-gray-200 text-gray-500 py-1.5 rounded-lg text-xs hover:bg-gray-50">
                <X size={11} /> Cancel
              </button>
              <button onClick={saveEdit} className="flex-1 flex items-center justify-center gap-1 bg-blue-700 text-white py-1.5 rounded-lg text-xs hover:bg-blue-800">
                <Check size={11} /> Save
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-700 flex items-center justify-center text-white font-bold text-sm shrink-0">
                {clientConfig.initials}
              </div>
              <div>
                <p className="font-semibold text-sm text-gray-900 leading-tight">{clientConfig.company}</p>
                <p className="text-xs text-gray-400">Client Portal</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {isAdmin && (
                <button onClick={startEdit} className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-blue-600 transition-colors">
                  <Pencil size={12} />
                </button>
              )}
              <button onClick={onClose} className="lg:hidden p-1 text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-5">
        {nav.map((group) => (
          <div key={group.section}>
            <p className="text-[10px] font-semibold tracking-widest text-gray-400 uppercase mb-1.5 px-2">{group.section}</p>
            <ul className="space-y-0.5">
              {group.items.map(({ href, label, icon: Icon, badge }) => {
                const isActive = pathname === href || pathname.startsWith(href + "/")
                const badgeCount = getBadge(badge)
                return (
                  <li key={href}>
                    <Link
                      href={href}
                      onClick={onClose}
                      className={cn(
                        "flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition-colors group relative",
                        isActive
                          ? "bg-blue-50 text-blue-700 font-medium border-l-2 border-blue-700 rounded-l-none pl-[9px]"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      )}
                    >
                      <Icon size={16} className={cn(isActive ? "text-blue-700" : "text-gray-400 group-hover:text-gray-600")} />
                      <span className="flex-1">{label}</span>
                      {badgeCount !== null && (
                        <span className="text-[10px] font-semibold bg-blue-100 text-blue-700 rounded-full px-1.5 py-0.5 min-w-[18px] text-center">
                          {badgeCount}
                        </span>
                      )}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Profile card */}
      <div className="p-4 border-t border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className="relative shrink-0">
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-semibold text-gray-700">
              {clientConfig.initials}
            </div>
            <span className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 rounded-full border border-white" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-gray-900 truncate">{clientConfig.fullName}</p>
            <p className="text-[10px] text-gray-400 truncate">{clientConfig.company}</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
