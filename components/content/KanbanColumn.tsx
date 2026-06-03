import { cn } from "@/lib/utils"
import { ContentCard } from "./ContentCard"
import type { ContentItem, ContentColumn } from "@/types"

const columnConfig = {
  drafted: { label: "Drafted", dotColor: "bg-blue-500" },
  approval: { label: "Needs Approval", dotColor: "bg-amber-500" },
  published: { label: "Published", dotColor: "bg-green-500" },
}

interface KanbanColumnProps {
  column: ContentColumn
  items: ContentItem[]
}

export function KanbanColumn({ column, items }: KanbanColumnProps) {
  const { label, dotColor } = columnConfig[column]

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2 mb-1">
        <span className={cn("w-2 h-2 rounded-full", dotColor)} />
        <p className="font-semibold text-sm text-gray-800">{label}</p>
        <span className="ml-auto text-xs bg-gray-100 text-gray-500 font-medium px-2 py-0.5 rounded-full">{items.length}</span>
      </div>
      {items.map((item) => (
        <ContentCard key={item.id} item={item} />
      ))}
      {items.length === 0 && (
        <div className="border-2 border-dashed border-gray-100 rounded-xl p-8 text-center">
          <p className="text-xs text-gray-400">No items</p>
        </div>
      )}
    </div>
  )
}
