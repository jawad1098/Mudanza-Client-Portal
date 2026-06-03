"use client"
import { cn } from "@/lib/utils"
import { usePortalStore } from "@/store/portalStore"

export function KeywordRankings() {
  const { keywordRankings } = usePortalStore((s) => s.analytics)

  const barColor = (pos: number) => {
    if (pos <= 10) return "bg-green-500"
    if (pos <= 15) return "bg-amber-400"
    return "bg-red-400"
  }

  const maxPos = 20

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <h3 className="font-semibold text-sm text-gray-900 mb-4">Keyword Rankings</h3>
      <div className="space-y-3">
        {keywordRankings.map(({ keyword, position }) => (
          <div key={keyword} className="flex items-center gap-3">
            <span className="text-xs text-gray-600 flex-1 truncate">{keyword}</span>
            <div className="w-28 h-2 bg-gray-100 rounded-full overflow-hidden shrink-0">
              <div
                className={cn("h-full rounded-full transition-all", barColor(position))}
                style={{ width: `${Math.max(10, (1 - (position - 1) / maxPos) * 100)}%` }}
              />
            </div>
            <span className="text-xs font-medium text-gray-500 w-8 text-right">#{position}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
