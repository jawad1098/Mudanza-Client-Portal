"use client"
import { Trash2 } from "lucide-react"
import { usePortalStore } from "@/store/portalStore"

const colorMap: Record<string, string> = {
  green: "#16A34A",
  blue: "#2563EB",
  violet: "#7C3AED",
  amber: "#D97706",
  rose: "#E11D48",
  teal: "#0D9488",
}

export function ActivityFeed() {
  const activity = usePortalStore((s) => s.activity)
  const isAdmin = usePortalStore((s) => s.isAdminMode)
  const deleteActivityItem = usePortalStore((s) => s.deleteActivityItem)

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      <h3 className="font-semibold text-sm text-gray-900 mb-4">Recent Activity</h3>
      <div className="space-y-0">
        {activity.map((item, i) => (
          <div key={item.id} className="flex gap-3 group">
            <div className="flex flex-col items-center">
              <div className="w-2.5 h-2.5 rounded-full shrink-0 mt-1" style={{ backgroundColor: colorMap[item.color] }} />
              {i < activity.length - 1 && <div className="w-px flex-1 bg-gray-100 my-1" />}
            </div>
            <div className="pb-4 flex-1 min-w-0">
              <p className="text-sm text-gray-600 leading-relaxed" dangerouslySetInnerHTML={{ __html: item.text }} />
              <p className="text-xs text-gray-400 mt-0.5">{item.time}</p>
            </div>
            {isAdmin && (
              <button onClick={() => deleteActivityItem(item.id)} className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0 p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-red-500 mt-0.5">
                <Trash2 size={12} />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
