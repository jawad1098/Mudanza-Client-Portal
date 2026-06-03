"use client"
import { usePortalStore } from "@/store/portalStore"

export function TrafficBarChart() {
  const { websiteTraffic } = usePortalStore((s) => s.analytics)
  const max = Math.max(...websiteTraffic.map((d) => d.visits))

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <h3 className="font-semibold text-sm text-gray-900 mb-4">Website Traffic</h3>
      <div className="space-y-3">
        {websiteTraffic.map(({ month, visits }) => (
          <div key={month} className="flex items-center gap-3">
            <span className="text-xs text-gray-400 w-8 shrink-0">{month}</span>
            <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 rounded-full transition-all"
                style={{ width: `${(visits / max) * 100}%` }}
              />
            </div>
            <span className="text-xs text-gray-500 font-medium w-10 text-right">{visits}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
