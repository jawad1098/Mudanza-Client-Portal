"use client"
import { Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { usePortalStore } from "@/store/portalStore"
import type { Task } from "@/types"

const categoryColors: Record<string, string> = {
  SEO: "bg-blue-50 text-blue-700",
  GMB: "bg-green-50 text-green-700",
  Social: "bg-amber-50 text-amber-700",
  Blog: "bg-rose-50 text-rose-700",
  Technical: "bg-violet-50 text-violet-700",
  Analytics: "bg-teal-50 text-teal-700",
  Other: "bg-gray-100 text-gray-600",
}

interface TaskRowProps {
  task: Task
}

export function TaskRow({ task }: TaskRowProps) {
  const isAdmin = usePortalStore((s) => s.isAdminMode)
  const toggleTaskStatus = usePortalStore((s) => s.toggleTaskStatus)
  const deleteTask = usePortalStore((s) => s.deleteTask)

  return (
    <div className="flex items-center gap-3 py-2.5 px-3 rounded-lg hover:bg-gray-50 group transition-colors">
      <button
        onClick={() => toggleTaskStatus(task.id)}
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

      <span className={cn("flex-1 text-sm", task.status === "done" ? "line-through text-gray-400" : "text-gray-700")}>
        {task.name}
      </span>

      <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full", categoryColors[task.category])}>
        {task.category}
      </span>

      <span className="text-xs text-gray-400 w-8">{task.week}</span>
      <span className="text-xs text-gray-400 w-24">{task.date}</span>

      <span className={cn(
        "text-xs font-medium px-2 py-0.5 rounded-full",
        task.status === "done" ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"
      )}>
        {task.status}
      </span>

      {isAdmin && (
        <button onClick={() => deleteTask(task.id)} className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-50 rounded text-gray-300 hover:text-red-500">
          <Trash2 size={14} />
        </button>
      )}
    </div>
  )
}
