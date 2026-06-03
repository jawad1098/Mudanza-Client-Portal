"use client"
import { useState } from "react"
import { Modal } from "@/components/ui/Modal"
import { usePortalStore } from "@/store/portalStore"
import { useToast } from "@/components/ui/Toast"
import { nanoid } from "nanoid"
import type { Lead, LeadStatus } from "@/types"

interface AddLeadModalProps {
  isOpen: boolean
  onClose: () => void
  onSaved?: (lead: Lead) => void
}

const empty = () => ({
  date: new Date().toISOString().split("T")[0],
  customerName: "", phone: "", email: "",
  moveDistance: "Local Move", serviceLevel: "Standard Move",
  moveSize: "", from: "", to: "",
  loadingDate: "", loadingTime: "",
  estimatedValue: "", status: "New" as LeadStatus,
})

export function AddLeadModal({ isOpen, onClose, onSaved }: AddLeadModalProps) {
  const addLead = usePortalStore((s) => s.addLead)
  const { showToast } = useToast()
  const [form, setForm] = useState(empty())
  const [saving, setSaving] = useState(false)

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }))

  const handleSave = async () => {
    if (!form.customerName.trim()) return
    setSaving(true)

    const lead: Lead = {
      id: nanoid(),
      date: form.date,
      customerName: form.customerName,
      phone: form.phone,
      email: form.email,
      moveDistance: form.moveDistance,
      serviceLevel: form.serviceLevel,
      moveSize: form.moveSize,
      from: form.from,
      to: form.to,
      loadingDate: form.loadingDate,
      loadingTime: form.loadingTime,
      estimatedValue: Number(form.estimatedValue) || 0,
      status: form.status,
    }

    addLead(lead)
    if (onSaved) await onSaved(lead)

    setForm(empty())
    setSaving(false)
    onClose()
    showToast("Lead added")
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Lead" size="lg" footer={
      <button onClick={handleSave} disabled={saving} className="w-full bg-blue-700 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-800 disabled:opacity-50">
        {saving ? "Saving…" : "Add Lead"}
      </button>
    }>
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className="text-xs font-medium text-gray-500 block mb-1">Customer Name *</label>
          <input value={form.customerName} onChange={(e) => set("customerName", e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-500 block mb-1">Phone</label>
          <input value={form.phone} onChange={(e) => set("phone", e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-500 block mb-1">Email</label>
          <input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-500 block mb-1">Move Distance</label>
          <select value={form.moveDistance} onChange={(e) => set("moveDistance", e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option>Local Move</option>
            <option>Long Distance</option>
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-gray-500 block mb-1">Service Level</label>
          <select value={form.serviceLevel} onChange={(e) => set("serviceLevel", e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option>Standard Move</option>
            <option>Labor Only</option>
            <option>Custom Move</option>
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-gray-500 block mb-1">Move Size</label>
          <input value={form.moveSize} onChange={(e) => set("moveSize", e.target.value)} placeholder="e.g. 2 Bedrooms" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-500 block mb-1">Est. Value ($)</label>
          <input type="number" value={form.estimatedValue} onChange={(e) => set("estimatedValue", e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-500 block mb-1">From</label>
          <input value={form.from} onChange={(e) => set("from", e.target.value)} placeholder="City or zip" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-500 block mb-1">To</label>
          <input value={form.to} onChange={(e) => set("to", e.target.value)} placeholder="City or zip" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-500 block mb-1">Move Date</label>
          <input type="date" value={form.loadingDate} onChange={(e) => set("loadingDate", e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-500 block mb-1">Time</label>
          <select value={form.loadingTime} onChange={(e) => set("loadingTime", e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">Select...</option>
            <option>Morning</option>
            <option>Afternoon</option>
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-gray-500 block mb-1">Date Added</label>
          <input type="date" value={form.date} onChange={(e) => set("date", e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-500 block mb-1">Status</label>
          <select value={form.status} onChange={(e) => set("status", e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            {["New", "Contacted", "Quoted", "Booked", "Lost"].map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
      </div>
    </Modal>
  )
}
