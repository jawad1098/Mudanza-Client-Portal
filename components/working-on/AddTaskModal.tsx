"use client"
import { useState } from "react"
import { Plus, Trash2 } from "lucide-react"
import { Modal } from "@/components/ui/Modal"
import { usePortalStore } from "@/store/portalStore"
import { useToast } from "@/components/ui/Toast"
import type { TaskCategory, TaskWeek } from "@/types"

interface RowData {
  name: string
  category: TaskCategory
  week: TaskWeek
  date: string
}

const emptyRow = (): RowData => ({ name: "", category: "SEO", week: "W1", date: "" })

interface AddTaskModalProps {
  isOpen: boolean
  onClose: () => void
}

export function AddTaskModal({ isOpen, onClose }: AddTaskModalProps) {
  const addTasks = usePortalStore((s) => s.addTasks)
  const { showToast } = useToast()
  const [rows, setRows] = useState<RowData[]>([emptyRow(), emptyRow(), emptyRow()])

  const update = (i: number, field: keyof RowData, value: string) => {
    setRows((prev) => prev.map((r, idx) => idx === i ? { ...r, [field]: value } : r))
  }

  const handleSave = () => {
    const valid = rows.filter((r) => r.name.trim())
    if (!valid.length) return
    addTasks(valid.map((r) => ({ ...r, status: "pending" })))
    setRows([emptyRow(), emptyRow(), emptyRow()])
    onClose()
    showToast(`${valid.length} task${valid.length > 1 ? "s" : ""} added`)
  }

  const categories: TaskCategory[] = ["SEO", "GMB", "Social", "Blog", "Technical", "Analytics", "Other"]
  const weeks: TaskWeek[] = ["W1", "W2", "W3", "W4"]

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Tasks" size="lg" footer={
      <button onClick={handleSave} className="w-full bg-blue-700 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-800">Save All</button>
    }>
      <div className="space-y-2">
        <div className="hidden sm:grid grid-cols-[1fr_120px_80px_130px_36px] gap-2 text-xs font-medium text-gray-400 mb-1 px-1">
          <span>Task Name</span><span>Category</span><span>Week</span><span>Date</span><span />
        </div>
        {rows.map((row, i) => (
          <div key={i} className="grid grid-cols-1 sm:grid-cols-[1fr_120px_80px_130px_36px] gap-2 items-center border sm:border-0 border-gray-100 rounded-lg p-2 sm:p-0">
            <input value={row.name} onChange={(e) => update(i, "name", e.target.value)} placeholder="Task name..." className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <select value={row.category} onChange={(e) => update(i, "category", e.target.value as TaskCategory)} className="border border-gray-200 rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              {categories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <select value={row.week} onChange={(e) => update(i, "week", e.target.value as TaskWeek)} className="border border-gray-200 rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              {weeks.map((w) => <option key={w} value={w}>{w}</option>)}
            </select>
            <input type="date" value={row.date} onChange={(e) => update(i, "date", e.target.value)} className="border border-gray-200 rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <button onClick={() => setRows((prev) => prev.filter((_, idx) => idx !== i))} className="p-2 hover:bg-red-50 rounded text-gray-300 hover:text-red-500 transition-colors">
              <Trash2 size={14} />
            </button>
          </div>
        ))}
        <button onClick={() => setRows((prev) => [...prev, emptyRow()])} className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 mt-2">
          <Plus size={14} /> Add Row
        </button>
      </div>
    </Modal>
  )
}
