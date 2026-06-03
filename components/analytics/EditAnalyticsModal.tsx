"use client"
import { useState } from "react"
import { Modal } from "@/components/ui/Modal"
import { usePortalStore } from "@/store/portalStore"
import { useToast } from "@/components/ui/Toast"

interface EditAnalyticsModalProps {
  isOpen: boolean
  onClose: () => void
}

export function EditAnalyticsModal({ isOpen, onClose }: EditAnalyticsModalProps) {
  const analytics = usePortalStore((s) => s.analytics)
  const updateAnalytics = usePortalStore((s) => s.updateAnalytics)
  const { showToast } = useToast()

  const [form, setForm] = useState({
    gbpImpressions: analytics.gbpImpressions,
    phoneCalls: analytics.phoneCalls,
    directionRequests: analytics.directionRequests,
    gbpRating: analytics.gbpRating,
    traffic: analytics.websiteTraffic.map((d) => d.visits),
  })

  const handleSave = () => {
    updateAnalytics({
      gbpImpressions: form.gbpImpressions,
      phoneCalls: form.phoneCalls,
      directionRequests: form.directionRequests,
      gbpRating: form.gbpRating,
      websiteTraffic: analytics.websiteTraffic.map((d, i) => ({ ...d, visits: form.traffic[i] })),
    })
    onClose()
    showToast("Analytics updated")
  }

  const numInput = (label: string, key: keyof typeof form) => (
    <div key={key}>
      <label className="text-xs font-medium text-gray-500 block mb-1">{label}</label>
      <input
        type="number"
        value={form[key] as number}
        onChange={(e) => setForm((f) => ({ ...f, [key]: Number(e.target.value) }))}
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  )

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Analytics Data" footer={
      <button onClick={handleSave} className="w-full bg-blue-700 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-800">Save Changes</button>
    }>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          {numInput("GBP Impressions", "gbpImpressions")}
          {numInput("Phone Calls", "phoneCalls")}
          {numInput("Direction Requests", "directionRequests")}
          {numInput("GBP Rating", "gbpRating")}
        </div>
        <div>
          <p className="text-xs font-medium text-gray-500 mb-2">Website Traffic (Monthly Visits)</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {analytics.websiteTraffic.map(({ month }, i) => (
              <div key={month}>
                <label className="text-xs text-gray-400 block mb-1">{month}</label>
                <input
                  type="number"
                  value={form.traffic[i]}
                  onChange={(e) => {
                    const t = [...form.traffic]
                    t[i] = Number(e.target.value)
                    setForm((f) => ({ ...f, traffic: t }))
                  }}
                  className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  )
}
