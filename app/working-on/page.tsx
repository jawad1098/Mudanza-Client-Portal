"use client"
import { useState, useMemo } from "react"
import { Plus, Upload } from "lucide-react"
import { isToday, isThisWeek, isThisMonth, parseISO } from "date-fns"
import { usePortalStore } from "@/store/portalStore"
import { PageHeader } from "@/components/layout/PageHeader"
import { FilterBar } from "@/components/working-on/FilterBar"
import { TaskRow } from "@/components/working-on/TaskRow"
import { AddTaskModal } from "@/components/working-on/AddTaskModal"
import { ImportCSVModal } from "@/components/working-on/ImportCSVModal"
import type { TaskWeek } from "@/types"

const WEEKS: TaskWeek[] = ["W1", "W2", "W3", "W4"]

export default function WorkingOnPage() {
  const tasks = usePortalStore((s) => s.tasks)
  const isAdmin = usePortalStore((s) => s.isAdminMode)
  const [filter, setFilter] = useState("All")
  const [showAdd, setShowAdd] = useState(false)
  const [showImport, setShowImport] = useState(false)

  const filtered = useMemo(() => {
    return tasks.filter((t) => {
      if (filter === "All") return true
      if (filter === "Today") return isToday(parseISO(t.date))
      if (filter === "This Week") return isThisWeek(parseISO(t.date), { weekStartsOn: 1 })
      if (filter === "This Month") return isThisMonth(parseISO(t.date))
      if (filter === "Completed") return t.status === "done"
      if (filter === "Pending") return t.status === "pending"
      return true
    })
  }, [tasks, filter])

  const done = tasks.filter((t) => t.status === "done").length
  const total = tasks.length
  const pct = total > 0 ? Math.round((done / total) * 100) : 0

  return (
    <div>
      <PageHeader
        title="I'm Working On"
        description="All tasks for this month's deliverables"
        action={isAdmin ? (
          <div className="flex items-center gap-2">
            <button onClick={() => setShowImport(true)} className="flex items-center gap-2 text-sm border border-gray-200 text-gray-600 px-3 py-2 rounded-lg hover:bg-gray-50">
              <Upload size={14} /> Import CSV
            </button>
            <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 text-sm bg-blue-700 text-white px-4 py-2 rounded-lg hover:bg-blue-800">
              <Plus size={14} /> Add Tasks
            </button>
          </div>
        ) : null}
      />

      <div className="bg-white border border-gray-200 rounded-xl p-5 mb-5">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-medium text-gray-700">{done} / {total} tasks completed</p>
          <p className="text-sm font-semibold text-blue-600">{pct}%</p>
        </div>
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-blue-600 rounded-full transition-all" style={{ width: `${pct}%` }} />
        </div>
      </div>

      <div className="mb-5">
        <FilterBar active={filter} onChange={setFilter} />
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-4">
        {WEEKS.map((week) => {
          const weekTasks = filtered.filter((t) => t.week === week)
          if (!weekTasks.length) return null
          return (
            <div key={week}>
              <p className="text-xs font-semibold tracking-widest text-gray-400 uppercase mb-2 mt-4 first:mt-0 px-3">{week} — June 2026</p>
              {weekTasks.map((t) => <TaskRow key={t.id} task={t} />)}
            </div>
          )
        })}
        {filtered.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-12">No tasks match this filter.</p>
        )}
      </div>

      <AddTaskModal isOpen={showAdd} onClose={() => setShowAdd(false)} />
      <ImportCSVModal isOpen={showImport} onClose={() => setShowImport(false)} />
    </div>
  )
}
