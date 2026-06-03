"use client"
import { useState } from "react"
import { Pencil } from "lucide-react"
import { cn } from "@/lib/utils"
import { usePortalStore } from "@/store/portalStore"
import { Modal } from "@/components/ui/Modal"
import { useToast } from "@/components/ui/Toast"
import type { Service } from "@/types"

interface ServiceProgressCardProps {
  service: Service
}

export function ServiceProgressCard({ service }: ServiceProgressCardProps) {
  const isAdmin = usePortalStore((s) => s.isAdminMode)
  const updateService = usePortalStore((s) => s.updateService)
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(service)
  const { showToast } = useToast()

  const statusColors = {
    active: { dot: "bg-green-500", badge: "bg-green-50 text-green-700" },
    waiting: { dot: "bg-amber-500", badge: "bg-amber-50 text-amber-700" },
    review: { dot: "bg-blue-500", badge: "bg-blue-50 text-blue-700" },
  }
  const colors = statusColors[service.status]

  const handleSave = () => {
    updateService(service.id, form)
    setOpen(false)
    showToast("Service updated")
  }

  return (
    <>
      <div className="bg-white border border-gray-200 rounded-xl p-4 group relative overflow-hidden">
        <div className="flex items-start gap-3">
          <div className="text-2xl w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center shrink-0">{service.icon}</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <p className="font-medium text-sm text-gray-900">{service.name}</p>
              {isAdmin && (
                <button onClick={() => { setForm(service); setOpen(true) }} className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-100 rounded">
                  <Pencil size={12} className="text-gray-400" />
                </button>
              )}
            </div>
            <p className="text-xs text-gray-400 mb-2">{service.description}</p>
            <div className="flex items-center justify-between mb-2">
              <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full flex items-center gap-1.5", colors.badge)}>
                <span className={cn("w-1.5 h-1.5 rounded-full", colors.dot)} />
                {service.statusLabel}
              </span>
              <span className="text-xs text-gray-400 font-medium">{service.progress}%</span>
            </div>
            <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-blue-600 rounded-full transition-all" style={{ width: `${service.progress}%` }} />
            </div>
          </div>
        </div>
      </div>
      <Modal isOpen={open} onClose={() => setOpen(false)} title="Edit Service" footer={
        <button onClick={handleSave} className="w-full bg-blue-700 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-800">Save</button>
      }>
        <div className="space-y-3">
          {[
            { label: "Name", key: "name" as const },
            { label: "Description", key: "description" as const },
            { label: "Status Label", key: "statusLabel" as const },
          ].map(({ label, key }) => (
            <div key={key}>
              <label className="text-xs font-medium text-gray-500 block mb-1">{label}</label>
              <input value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          ))}
          <div>
            <label className="text-xs font-medium text-gray-500 block mb-1">Status</label>
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as Service["status"] })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="active">Active</option>
              <option value="waiting">Waiting</option>
              <option value="review">Review</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 block mb-1">Progress ({form.progress}%)</label>
            <input type="range" min={0} max={100} value={form.progress} onChange={(e) => setForm({ ...form, progress: Number(e.target.value) })} className="w-full" />
          </div>
        </div>
      </Modal>
    </>
  )
}
