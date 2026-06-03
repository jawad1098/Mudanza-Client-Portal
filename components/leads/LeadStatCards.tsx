"use client"
import { usePortalStore } from "@/store/portalStore"

export function LeadStatCards() {
  const leads = usePortalStore((s) => s.leads)
  const total = leads.length
  const pipelineValue = leads.reduce((sum, l) => sum + l.estimatedValue, 0)
  const avgValue = total > 0 ? Math.round(pipelineValue / total) : 0

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      {[
        { label: "Total Leads", value: total, sub: "All time" },
        { label: "Pipeline Value", value: `$${pipelineValue.toLocaleString()}`, sub: "Estimated total" },
        { label: "Average Job Value", value: `$${avgValue.toLocaleString()}`, sub: "Per lead" },
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
