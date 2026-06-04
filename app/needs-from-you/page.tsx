"use client"
import { useState, useEffect, useCallback } from "react"
import { Plus } from "lucide-react"
import { usePortalStore } from "@/store/portalStore"
import { PageHeader } from "@/components/layout/PageHeader"
import { NeedCard } from "@/components/needs/NeedCard"
import { AddNeedModal } from "@/components/needs/AddNeedModal"
import { fetchNeedsFromDB, upsertNeedsToDB } from "@/lib/needsSync"

export default function NeedsPage() {
  const needs = usePortalStore((s) => s.needs)
  const isAdmin = usePortalStore((s) => s.isAdminMode)
  const setNeedsFromDB = usePortalStore((s) => s.setNeedsFromDB)
  const [showAdd, setShowAdd] = useState(false)
  const [loading, setLoading] = useState(true)

  const loadNeeds = useCallback(async () => {
    setLoading(true)
    const dbNeeds = await fetchNeedsFromDB()
    if (dbNeeds.length > 0) {
      setNeedsFromDB(dbNeeds)
    } else {
      // First time — seed defaults into Supabase
      const currentNeeds = usePortalStore.getState().needs
      if (currentNeeds.length > 0) await upsertNeedsToDB(currentNeeds)
    }
    setLoading(false)
  }, [setNeedsFromDB])

  useEffect(() => { loadNeeds() }, [loadNeeds])

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

      {loading ? (
        <div className="py-16 text-center">
          <div className="inline-block w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-400 mt-2">Loading…</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {needs.map((n) => <NeedCard key={n.id} need={n} />)}
        </div>
      )}

      <AddNeedModal isOpen={showAdd} onClose={() => setShowAdd(false)} />
    </div>
  )
}
