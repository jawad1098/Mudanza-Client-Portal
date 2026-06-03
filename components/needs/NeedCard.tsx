"use client"
import { useState } from "react"
import { Pencil, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { usePortalStore } from "@/store/portalStore"
import { HowToModal } from "./HowToModal"
import { AddNeedModal } from "./AddNeedModal"
import type { NeedItem } from "@/types"

const priorityColors = {
  urgent: "bg-red-100 text-red-700",
  high: "bg-amber-100 text-amber-700",
  normal: "bg-blue-100 text-blue-700",
}

interface NeedCardProps {
  need: NeedItem
}

export function NeedCard({ need }: NeedCardProps) {
  const isAdmin = usePortalStore((s) => s.isAdminMode)
  const toggleNeedDone = usePortalStore((s) => s.toggleNeedDone)
  const addActivityItem = usePortalStore((s) => s.addActivityItem)
  const deleteNeed = usePortalStore((s) => s.deleteNeed)
  const [showHowTo, setShowHowTo] = useState(false)
  const [showEdit, setShowEdit] = useState(false)

  return (
    <>
      <div className={cn("bg-white border border-gray-200 rounded-xl p-5 shadow-sm transition-opacity", need.done && "opacity-60")}>
        <div className="flex items-start gap-3 mb-3">
          <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center text-xl shrink-0">{need.icon}</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-medium text-sm text-gray-900">{need.title}</p>
              <span className={cn("text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full", priorityColors[need.priority])}>
                {need.priority}
              </span>
            </div>
          </div>
          {isAdmin && (
            <div className="flex items-center gap-1 shrink-0">
              <button onClick={() => setShowEdit(true)} className="p-1.5 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-600">
                <Pencil size={13} />
              </button>
              <button onClick={() => deleteNeed(need.id)} className="p-1.5 hover:bg-red-50 rounded text-gray-400 hover:text-red-500">
                <Trash2 size={13} />
              </button>
            </div>
          )}
        </div>

        <p className="text-sm text-gray-500 mb-2">{need.description}</p>
        {need.blockingLabel && (
          <p className="text-xs text-gray-400 mb-4">{need.blockingLabel}</p>
        )}

        <div className="flex items-center gap-2 mt-auto">
          <button
            onClick={() => setShowHowTo(true)}
            className="flex-1 text-sm text-blue-600 hover:text-blue-700 border border-blue-200 hover:border-blue-300 rounded-lg py-2 transition-colors text-center"
          >
            How to do this →
          </button>
          <button
            onClick={() => {
              toggleNeedDone(need.id)
              if (!need.done) {
                addActivityItem({
                  text: `<strong>Requirement fulfilled</strong> — ${need.title}`,
                  time: new Date().toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }),
                  color: "violet",
                })
              }
            }}
            className={cn(
              "flex-1 text-sm font-medium rounded-lg py-2 border transition-colors text-center",
              need.done
                ? "bg-green-50 text-green-700 border-green-200"
                : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
            )}
          >
            {need.done ? "✓ Done" : "Mark Done"}
          </button>
        </div>
      </div>

      <HowToModal isOpen={showHowTo} onClose={() => setShowHowTo(false)} title={need.title} howTo={need.howTo} />
      <AddNeedModal isOpen={showEdit} onClose={() => setShowEdit(false)} initial={need} />
    </>
  )
}
