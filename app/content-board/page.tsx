"use client"
import { useState } from "react"
import { Plus } from "lucide-react"
import { usePortalStore } from "@/store/portalStore"
import { PageHeader } from "@/components/layout/PageHeader"
import { KanbanColumn } from "@/components/content/KanbanColumn"
import { AddContentModal } from "@/components/content/AddContentModal"
import type { ContentColumn } from "@/types"

const COLUMNS: ContentColumn[] = ["drafted", "approval", "published"]

export default function ContentBoardPage() {
  const content = usePortalStore((s) => s.content)
  const isAdmin = usePortalStore((s) => s.isAdminMode)
  const [showAdd, setShowAdd] = useState(false)

  return (
    <div>
      <PageHeader
        title="Content Board"
        description="Track content from draft to published"
        action={isAdmin ? (
          <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 text-sm bg-blue-700 text-white px-4 py-2 rounded-lg hover:bg-blue-800">
            <Plus size={14} /> Add Content
          </button>
        ) : null}
      />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {COLUMNS.map((col) => (
          <KanbanColumn key={col} column={col} items={content.filter((c) => c.column === col)} />
        ))}
      </div>
      <AddContentModal isOpen={showAdd} onClose={() => setShowAdd(false)} />
    </div>
  )
}
