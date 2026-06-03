"use client"
import { useState } from "react"
import { Trash2, Pencil, Check, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { usePortalStore } from "@/store/portalStore"
import { upsertTaskToDB, deleteTaskFromDB } from "@/lib/taskSync"
import type { Task, TaskCategory, TaskWeek } from "@/types"

const categoryColors: Record<string, string> = {
  SEO: "bg-blue-50 text-blue-700",
  GMB: "bg-green-50 text-green-700",
  Social: "bg-amber-50 text-amber-700",
  Blog: "bg-rose-50 text-rose-700",
  Technical: "bg-violet-50 text-violet-700",
  Analytics: "bg-teal-50 text-teal-700",
  Other: "bg-gray-100 text-gray-600",
}

const CATEGORIES: TaskCategory[] = ["SEO", "GMB", "Social", "Blog", "Technical", "Analytics", "Other"]
const WEEKS: TaskWeek[] = ["W1", "W2", "W3", "W4"]

interface TaskRowProps {
  task: Task
}

export function TaskRow({ task }: TaskRowProps) {
  const isAdmin = usePortalStore((s) => s.isAdminMode)
  const toggleTaskStatus = usePortalStore((s) => s.toggleTaskStatus)
  const updateTask = usePortalStore((s) => s.updateTask)
  const deleteTask = usePortalStore((s) => s.deleteTask)
  const addActivityItem = usePortalStore((s) => s.addActivityItem)

  const [editing, setEditing] = useState(false)
  const [editName, setEditName] = useState(task.name)
  const [editCategory, setEditCategory] = useState(task.category)
  const [editWeek, setEditWeek] = useState(task.week)
  const [editDate, setEditDate] = useState(task.date)

  const handleSaveEdit = () => {
    const updated = { ...task, name: editName, category: editCategory, week: editWeek, date: editDate }
    updateTask(task.id, { name: editName, category: editCategory, week: editWeek, date: editDate })
    upsertTaskToDB(updated)
    setEditing(false)
  }

  const handleCancelEdit = () => {
    setEditName(task.name); setEditCategory(task.category)
    setEditWeek(task.week); setEditDate(task.date)
    setEditing(false)
  }

  if (editing) {
    return (
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 py-2 px-3 rounded-lg bg-blue-50 border border-blue-100">
        <input
          value={editName}
          onChange={(e) => setEditName(e.target.value)}
          className="flex-1 text-sm border border-gray-200 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
          autoFocus
        />
        <div className="flex items-center gap-2 flex-wrap">
          <select value={editCategory} onChange={(e) => setEditCategory(e.target.value as TaskCategory)}
            className="text-xs border border-gray-200 rounded px-1 py-1.5 focus:outline-none bg-white">
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={editWeek} onChange={(e) => setEditWeek(e.target.value as TaskWeek)}
            className="text-xs border border-gray-200 rounded px-1 py-1.5 focus:outline-none bg-white w-14">
            {WEEKS.map((w) => <option key={w} value={w}>{w}</option>)}
          </select>
          <input type="date" value={editDate} onChange={(e) => setEditDate(e.target.value)}
            className="text-xs border border-gray-200 rounded px-1 py-1.5 focus:outline-none bg-white" />
          <button onClick={handleSaveEdit} className="p-1.5 bg-blue-600 text-white rounded hover:bg-blue-700">
            <Check size={13} />
          </button>
          <button onClick={handleCancelEdit} className="p-1.5 bg-white border border-gray-200 rounded hover:bg-gray-50 text-gray-500">
            <X size={13} />
          </button>
        </div>
      </div>
    )
  }

  const checkbox = isAdmin ? (
    <button
      onClick={() => {
        const newStatus = task.status === "done" ? "pending" : "done"
        toggleTaskStatus(task.id)
        upsertTaskToDB({ ...task, status: newStatus as Task["status"] })
        if (newStatus === "done") {
          addActivityItem({
            text: `<strong>Task completed</strong> — ${task.name}`,
            time: new Date().toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }),
            color: "green",
          })
        }
      }}
      className={cn(
        "w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center transition-colors",
        task.status === "done" ? "bg-blue-600 border-blue-600" : "border-gray-300 hover:border-blue-400"
      )}
    >
      {task.status === "done" && (
        <svg viewBox="0 0 10 8" className="w-2.5 h-2.5 text-white fill-current">
          <path d="M1 4l3 3 5-6" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </button>
  ) : (
    <div className={cn(
      "w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center",
      task.status === "done" ? "bg-blue-600 border-blue-600" : "border-gray-300"
    )}>
      {task.status === "done" && (
        <svg viewBox="0 0 10 8" className="w-2.5 h-2.5 text-white fill-current">
          <path d="M1 4l3 3 5-6" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </div>
  )

  return (
    <div className="flex items-start sm:items-center gap-3 py-2.5 px-3 rounded-lg hover:bg-gray-50 group transition-colors">
      <div className="mt-0.5 sm:mt-0 flex-shrink-0">{checkbox}</div>

      {/* Main content — stacks on mobile */}
      <div className="flex-1 min-w-0">
        <span className={cn("text-sm block", task.status === "done" ? "line-through text-gray-400" : "text-gray-700")}>
          {task.name}
        </span>
        {/* Mobile: show meta below name */}
        <div className="flex items-center gap-2 mt-1 sm:hidden flex-wrap">
          <span className={cn("text-xs font-medium px-1.5 py-0.5 rounded-full", categoryColors[task.category] || "bg-gray-100 text-gray-600")}>
            {task.category}
          </span>
          <span className="text-xs text-gray-400">{task.week}</span>
          {task.date && <span className="text-xs text-gray-400">{task.date}</span>}
          <span className={cn("text-xs font-medium px-1.5 py-0.5 rounded-full", task.status === "done" ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500")}>
            {task.status}
          </span>
        </div>
      </div>

      {/* Desktop: inline meta */}
      <div className="hidden sm:flex items-center gap-3 flex-shrink-0">
        <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full", categoryColors[task.category] || "bg-gray-100 text-gray-600")}>
          {task.category}
        </span>
        <span className="text-xs text-gray-400 w-8">{task.week}</span>
        <span className="text-xs text-gray-400 w-24">{task.date}</span>
        <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full", task.status === "done" ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500")}>
          {task.status}
        </span>
      </div>

      {isAdmin && (
        <div className="flex items-center gap-1 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity flex-shrink-0">
          <button onClick={() => setEditing(true)} className="p-1 hover:bg-blue-50 rounded text-gray-300 hover:text-blue-500">
            <Pencil size={13} />
          </button>
          <button onClick={() => { deleteTask(task.id); deleteTaskFromDB(task.id) }} className="p-1 hover:bg-red-50 rounded text-gray-300 hover:text-red-500">
            <Trash2 size={14} />
          </button>
        </div>
      )}
    </div>
  )
}
