"use client"
import { useState } from "react"
import { Plus } from "lucide-react"
import { usePortalStore } from "@/store/portalStore"
import { PageHeader } from "@/components/layout/PageHeader"
import { NeedCard } from "@/components/needs/NeedCard"
import { AddNeedModal } from "@/components/needs/AddNeedModal"

export default function NeedsPage() {
  const needs = usePortalStore((s) => s.needs)
  const isAdmin = usePortalStore((s) => s.isAdminMode)
  const [showAdd, setShowAdd] = useState(false)

  const done = needs.filter((n) => n.done).length
  const total = needs.length
  const pct = total > 0 ? Math.round((done / total) * 100) : 0

  return (
    <div>
      <PageHeader
        title="Needs from You"
        description="Items that require your action to move forward"
        action={isAdmin ? (
          <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 text-sm bg-blue-700 text-white px-4 py-2 rounded-lg hover:bg-blue-800">
            <Plus size={14} /> Add Need
          </button>
        ) : null}
      />

      <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-medium text-gray-700">{done} of {total} items completed</p>
          <p className="text-sm font-semibold text-blue-600">{pct}%</p>
        </div>
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-blue-600 rounded-full transition-all" style={{ width: `${pct}%` }} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {needs.map((n) => (
          <NeedCard key={n.id} need={n} />
        ))}
      </div>

      <AddNeedModal isOpen={showAdd} onClose={() => setShowAdd(false)} />
    </div>
  )
}
