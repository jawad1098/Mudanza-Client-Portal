"use client"
import { useState, useMemo, useEffect, useCallback } from "react"
import { Plus, Upload, Download } from "lucide-react"
import { isToday, isThisWeek, isThisMonth, parseISO, isValid, format } from "date-fns"
import { usePortalStore } from "@/store/portalStore"
import { PageHeader } from "@/components/layout/PageHeader"
import { FilterBar } from "@/components/working-on/FilterBar"
import { TaskRow } from "@/components/working-on/TaskRow"
import { AddTaskModal } from "@/components/working-on/AddTaskModal"
import { ImportCSVModal } from "@/components/working-on/ImportCSVModal"
import { fetchTasksFromDB } from "@/lib/taskSync"
import type { Task } from "@/types"


const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
]

function exportTasksCSV(tasks: Task[], monthLabel: string) {
  const headers = ["Task", "Category", "Week", "Date", "Status"]
  const rows = tasks.map((t) => [t.name, t.category, t.week, t.date, t.status])
  const csv = [headers, ...rows]
    .map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))
    .join("\n")
  const blob = new Blob([csv], { type: "text/csv" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `mudanza-tasks-${monthLabel}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export default function WorkingOnPage() {
  const tasks = usePortalStore((s) => s.tasks)
  const isAdmin = usePortalStore((s) => s.isAdminMode)
  const setTasksFromDB = usePortalStore((s) => s.setTasksFromDB)
  const [filter, setFilter] = useState("All")
  const [showAdd, setShowAdd] = useState(false)
  const [showImport, setShowImport] = useState(false)
  const [showExport, setShowExport] = useState(false)
  const [loading, setLoading] = useState(true)

  const now = new Date()
  const [exportMonth, setExportMonth] = useState(now.getMonth())
  const [exportYear, setExportYear] = useState(now.getFullYear())
  const [exportFilter, setExportFilter] = useState<"done" | "all">("done")

  const loadTasks = useCallback(async () => {
    setLoading(true)
    const dbTasks = await fetchTasksFromDB()
    if (dbTasks.length > 0) setTasksFromDB(dbTasks)
    setLoading(false)
  }, [setTasksFromDB])

  useEffect(() => { loadTasks() }, [loadTasks])

  const filtered = useMemo(() => {
    return tasks.filter((t) => {
      if (filter === "All") return true
      if (filter === "Completed") return t.status === "done"
      if (filter === "Pending") return t.status === "pending"
      // Date-based filters — support ISO (YYYY-MM-DD) and any other parseable format
      if (!t.date) return false
      try {
        let d = parseISO(t.date)
        if (!isValid(d)) d = new Date(t.date)
        if (!isValid(d)) return false
        if (filter === "Today") return isToday(d)
        if (filter === "This Week") return isThisWeek(d, { weekStartsOn: 1 })
        if (filter === "This Month") return isThisMonth(d)
      } catch { return false }
      return true
    })
  }, [tasks, filter])

  const done = tasks.filter((t) => t.status === "done").length
  const total = tasks.length
  const pct = total > 0 ? Math.round((done / total) * 100) : 0

  const handleExport = () => {
    const exportTasks = tasks.filter((t) => {
      try {
        let d = parseISO(t.date)
        if (!isValid(d)) d = new Date(t.date)
        if (!isValid(d)) return false
        const matchMonth = d.getMonth() === exportMonth && d.getFullYear() === exportYear
        const matchStatus = exportFilter === "all" || t.status === "done"
        return matchMonth && matchStatus
      } catch { return false }
    })
    const label = `${MONTHS[exportMonth].toLowerCase()}-${exportYear}`
    exportTasksCSV(exportTasks, label)
    setShowExport(false)
  }

  return (
    <div>
      <PageHeader
        title="I'm Working On"
        description="All tasks for this month's deliverables"
        action={
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowExport(true)}
              className="flex items-center gap-2 text-sm border border-gray-200 text-gray-600 px-3 py-2 rounded-lg hover:bg-gray-50"
            >
              <Download size={14} /> Export
            </button>
            {isAdmin && (
              <>
                <button onClick={() => setShowImport(true)} className="flex items-center gap-2 text-sm border border-gray-200 text-gray-600 px-3 py-2 rounded-lg hover:bg-gray-50">
                  <Upload size={14} /> Import CSV
                </button>
                <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 text-sm bg-blue-700 text-white px-4 py-2 rounded-lg hover:bg-blue-800">
                  <Plus size={14} /> Add Tasks
                </button>
              </>
            )}
          </div>
        }
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
        {loading ? (
          <div className="py-12 text-center">
            <div className="inline-block w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-gray-400 mt-2">Loading tasks…</p>
          </div>
        ) : (
          <>
            {(() => {
              // Collect all unique weeks from filtered tasks, sorted
              const allWeeks = Array.from(new Set(filtered.map((t) => t.week))).sort((a, b) => {
                const na = parseInt(a.replace(/\D/g, "")) || 0
                const nb = parseInt(b.replace(/\D/g, "")) || 0
                return na - nb
              })
              return allWeeks.map((week) => {
                const weekTasks = filtered.filter((t) => t.week === week)
                return (
                  <div key={week}>
                    <p className="text-xs font-semibold tracking-widest text-gray-400 uppercase mb-2 mt-4 first:mt-0 px-3">
                      {week} — {format(now, "MMMM yyyy")}
                    </p>
                    {weekTasks.map((t) => <TaskRow key={t.id} task={t} />)}
                  </div>
                )
              })
            })()}
            {filtered.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-12">No tasks match this filter.</p>
            )}
          </>
        )}
      </div>

      {/* Export modal */}
      {showExport && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-4">Export Tasks</h2>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-gray-500 block mb-1">Month</label>
                <select
                  value={exportMonth}
                  onChange={(e) => setExportMonth(Number(e.target.value))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {MONTHS.map((m, i) => <option key={m} value={i}>{m}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 block mb-1">Year</label>
                <select
                  value={exportYear}
                  onChange={(e) => setExportYear(Number(e.target.value))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {[2025, 2026, 2027].map((y) => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 block mb-1">Include</label>
                <select
                  value={exportFilter}
                  onChange={(e) => setExportFilter(e.target.value as "done" | "all")}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="done">Completed tasks only</option>
                  <option value="all">All tasks</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <button onClick={() => setShowExport(false)} className="flex-1 border border-gray-200 text-gray-600 py-2 rounded-lg text-sm font-medium hover:bg-gray-50">
                Cancel
              </button>
              <button onClick={handleExport} className="flex-1 bg-blue-700 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-800 flex items-center justify-center gap-2">
                <Download size={14} /> Download CSV
              </button>
            </div>
          </div>
        </div>
      )}

      <AddTaskModal isOpen={showAdd} onClose={() => setShowAdd(false)} />
      <ImportCSVModal isOpen={showImport} onClose={() => setShowImport(false)} />
    </div>
  )
}
