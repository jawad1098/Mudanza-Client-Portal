"use client"
import { usePortalStore } from "@/store/portalStore"

export function AnalyticsStatCards() {
  const analytics = usePortalStore((s) => s.analytics)
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {[
        { label: "GBP Impressions", value: analytics.gbpImpressions.toLocaleString(), sub: "Last 30 days" },
        { label: "Phone Calls", value: analytics.phoneCalls, sub: "From GBP" },
        { label: "Direction Requests", value: analytics.directionRequests, sub: "From GBP" },
        { label: "GBP Rating", value: `${analytics.gbpRating} ⭐`, sub: "Google average" },
      ].map(({ label, value, sub }) => (
        <div key={label} className="bg-white border border-gray-200 rounded-xl p-5">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">{label}</p>
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
          <p className="text-xs text-gray-400 mt-1">{sub}</p>
        </div>
      ))}
    </div>
  )
}
