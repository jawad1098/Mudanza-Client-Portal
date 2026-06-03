"use client"
import { cn } from "@/lib/utils"
import { usePortalStore } from "@/store/portalStore"

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"]

export function CallsSparkline() {
  const { callsByMonth } = usePortalStore((s) => s.analytics)
  const max = Math.max(...callsByMonth)

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <h3 className="font-semibold text-sm text-gray-900 mb-4">Calls by Month</h3>
      <div className="flex items-end gap-2 h-20">
        {callsByMonth.map((val, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <div className="w-full flex items-end" style={{ height: "64px" }}>
              <div
                className={cn("w-full rounded-t transition-all", i === callsByMonth.length - 1 ? "bg-blue-600" : "bg-gray-200")}
                style={{ height: `${Math.max(4, (val / max) * 64)}px` }}
              />
            </div>
            <span className="text-[10px] text-gray-400">{MONTHS[i]}</span>
          </div>
        ))}
      </div>
      <p className="text-xs text-gray-400 mt-2 text-center">Total calls: {callsByMonth.reduce((a, b) => a + b, 0)}</p>
    </div>
  )
}
