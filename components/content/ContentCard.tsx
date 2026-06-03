"use client"
import { Trash2, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { usePortalStore } from "@/store/portalStore"
import { useToast } from "@/components/ui/Toast"
import type { ContentItem, ContentColumn } from "@/types"

const typeColors: Record<string, string> = {
  "Blog Post": "bg-blue-50 text-blue-700",
  "Instagram Caption": "bg-rose-50 text-rose-700",
  "Facebook Post": "bg-violet-50 text-violet-700",
  "GMB Post": "bg-green-50 text-green-700",
  "Email": "bg-amber-50 text-amber-700",
  "Other": "bg-gray-100 text-gray-600",
}

const COLUMNS: ContentColumn[] = ["drafted", "approval", "published"]
const COLUMN_LABELS: Record<ContentColumn, string> = { drafted: "Drafted", approval: "Needs Approval", published: "Published" }

interface ContentCardProps {
  item: ContentItem
}

export function ContentCard({ item }: ContentCardProps) {
  const isAdmin = usePortalStore((s) => s.isAdminMode)
  const approveContent = usePortalStore((s) => s.approveContent)
  const moveContentItem = usePortalStore((s) => s.moveContentItem)
  const deleteContentItem = usePortalStore((s) => s.deleteContentItem)
  const { showToast } = useToast()

  const nextColumn = COLUMNS[COLUMNS.indexOf(item.column) + 1]

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm group">
      <div className="flex items-start justify-between gap-2 mb-1">
        <p className="font-medium text-sm text-gray-900 flex-1">{item.title}</p>
        {isAdmin && (
          <button onClick={() => deleteContentItem(item.id)} className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-50 rounded text-gray-300 hover:text-red-500 shrink-0">
            <Trash2 size={13} />
          </button>
        )}
      </div>

      {item.description && (
        <p className="text-xs text-gray-500 mt-1 line-clamp-2">{item.description}</p>
      )}

      <div className="flex items-center gap-2 mt-3">
        <span className={cn("text-[10px] font-medium px-2 py-0.5 rounded-full", typeColors[item.type])}>
          {item.type}
        </span>
        <span className="text-[10px] text-gray-400 ml-auto">{item.date}</span>
      </div>

      {item.column === "approval" && (
        <button
          onClick={() => {
            approveContent(item.id)
            showToast("Content approved!")
          }}
          className={cn(
            "w-full mt-3 py-2 text-sm font-medium rounded-lg border transition-colors",
            item.approved
              ? "bg-green-50 border-green-200 text-green-700"
              : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-green-50 hover:border-green-300 hover:text-green-700"
          )}
        >
          {item.approved ? "✓ Approved" : "👍 Approve"}
        </button>
      )}

      {isAdmin && nextColumn && (
        <button
          onClick={() => { moveContentItem(item.id, nextColumn); showToast(`Moved to ${COLUMN_LABELS[nextColumn]}`) }}
          className="w-full mt-2 py-1.5 text-xs text-gray-500 hover:text-gray-700 border border-dashed border-gray-200 hover:border-gray-300 rounded-lg flex items-center justify-center gap-1 transition-colors"
        >
          <ArrowRight size={12} /> Move to {COLUMN_LABELS[nextColumn]}
        </button>
      )}
    </div>
  )
}
