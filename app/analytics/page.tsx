"use client"
import { useState } from "react"
import { Pencil } from "lucide-react"
import { usePortalStore } from "@/store/portalStore"
import { PageHeader } from "@/components/layout/PageHeader"
import { AnalyticsStatCards } from "@/components/analytics/AnalyticsStatCards"
import { TrafficBarChart } from "@/components/analytics/TrafficBarChart"
import { KeywordRankings } from "@/components/analytics/KeywordRankings"
import { CallsSparkline } from "@/components/analytics/CallsSparkline"
import { EditAnalyticsModal } from "@/components/analytics/EditAnalyticsModal"

export default function AnalyticsPage() {
  const isAdmin = usePortalStore((s) => s.isAdminMode)
  const [showEdit, setShowEdit] = useState(false)

  return (
    <div>
      <PageHeader
        title="Analytics"
        description="Performance metrics for Mudanza Moving Services"
        action={isAdmin ? (
          <button onClick={() => setShowEdit(true)} className="flex items-center gap-2 text-sm border border-gray-200 text-gray-600 px-3 py-2 rounded-lg hover:bg-gray-50">
            <Pencil size={14} /> Edit Data
          </button>
        ) : null}
      />
      <div className="space-y-5">
        <AnalyticsStatCards />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <TrafficBarChart />
          <KeywordRankings />
        </div>
        <CallsSparkline />
      </div>
      <EditAnalyticsModal isOpen={showEdit} onClose={() => setShowEdit(false)} />
    </div>
  )
}
