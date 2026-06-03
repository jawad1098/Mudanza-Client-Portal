"use client"
import { useState } from "react"
import { Modal } from "@/components/ui/Modal"
import { usePortalStore } from "@/store/portalStore"
import { useToast } from "@/components/ui/Toast"
import type { LeadStatus } from "@/types"

interface AddLeadModalProps {
  isOpen: boolean
  onClose: () => void
}

export function AddLeadModal({ isOpen, onClose }: AddLeadModalProps) {
  const addLead = usePortalStore((s) => s.addLead)
  const { showToast } = useToast()
  const [form, setForm] = useState({
    date: "", customerName: "", moveSize: "", from: "", to: "",
    estimatedValue: "", status: "New" as LeadStatus,
  })

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }))

  const handleSave = () => {
    if (!form.customerName.trim()) return
    addLead({ ...form, estimatedValue: Number(form.estimatedValue) || 0 })
    setForm({ date: "", customerName: "", moveSize: "", from: "", to: "", estimatedValue: "", status: "New" })
    onClose()
    showToast("Lead added")
  }

  const fields = [
    { key: "date", label: "Date", type: "date" },
    { key: "customerName", label: "Customer Name *" },
    { key: "moveSize", label: "Move Size" },
    { key: "from", label: "From" },
    { key: "to", label: "To" },
    { key: "estimatedValue", label: "Estimated Value ($)", type: "number" },
  ]

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Lead" footer={
      <button onClick={handleSave} className="w-full bg-blue-700 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-800">Add Lead</button>
    }>
      <div className="space-y-3">
        {fields.map(({ key, label, type }) => (
          <div key={key}>
            <label className="text-xs font-medium text-gray-500 block mb-1">{label}</label>
            <input
              type={type || "text"}
              value={(form as Record<string, string>)[key]}
              onChange={(e) => set(key, e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        ))}
        <div>
          <label className="text-xs font-medium text-gray-500 block mb-1">Status</label>
          <select value={form.status} onChange={(e) => set("status", e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            {["New", "Contacted", "Quoted", "Booked", "Lost"].map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>
    </Modal>
  )
}
