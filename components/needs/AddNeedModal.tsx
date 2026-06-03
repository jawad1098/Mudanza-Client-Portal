"use client"
import { useState } from "react"
import { Modal } from "@/components/ui/Modal"
import { usePortalStore } from "@/store/portalStore"
import { upsertNeedToDB } from "@/lib/needsSync"
import { useToast } from "@/components/ui/Toast"
import { nanoid } from "nanoid"
import type { NeedPriority } from "@/types"

interface AddNeedModalProps {
  isOpen: boolean
  onClose: () => void
  initial?: {
    id: string
    icon: string
    title: string
    description: string
    priority: NeedPriority
    blockingLabel: string
    howTo: string
  }
}

export function AddNeedModal({ isOpen, onClose, initial }: AddNeedModalProps) {
  const addNeed = usePortalStore((s) => s.addNeed)
  const updateNeed = usePortalStore((s) => s.updateNeed)
  const { showToast } = useToast()
  const [form, setForm] = useState({
    icon: initial?.icon || "📌",
    title: initial?.title || "",
    description: initial?.description || "",
    priority: (initial?.priority || "normal") as NeedPriority,
    blockingLabel: initial?.blockingLabel || "",
    howTo: initial?.howTo || "",
  })

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }))

  const handleSave = async () => {
    if (!form.title.trim()) return
    if (initial?.id) {
      updateNeed(initial.id, { ...form, done: false })
      await upsertNeedToDB({ id: initial.id, ...form, done: false })
      showToast("Need updated")
    } else {
      const id = nanoid()
      addNeed({ ...form, done: false })
      await upsertNeedToDB({ id, ...form, done: false })
      showToast("Need added")
    }
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initial ? "Edit Need" : "Add Need"} footer={
      <button onClick={handleSave} className="w-full bg-blue-700 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-800">
        {initial ? "Save Changes" : "Add Need"}
      </button>
    }>
      <div className="space-y-3">
        <div className="grid grid-cols-[72px_1fr] gap-3">
          <div>
            <label className="text-xs font-medium text-gray-500 block mb-1">Icon</label>
            <input value={form.icon} onChange={(e) => set("icon", e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-500" maxLength={2} />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 block mb-1">Title *</label>
            <input value={form.title} onChange={(e) => set("title", e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="What is needed?" />
          </div>
        </div>
        <div>
          <label className="text-xs font-medium text-gray-500 block mb-1">Description *</label>
          <textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={2} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-gray-500 block mb-1">Priority</label>
            <select value={form.priority} onChange={(e) => set("priority", e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="normal">Normal</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 block mb-1">Blocking Label</label>
            <input value={form.blockingLabel} onChange={(e) => set("blockingLabel", e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Blocking: ..." />
          </div>
        </div>
        <div>
          <label className="text-xs font-medium text-gray-500 block mb-1">How To (step by step) *</label>
          <textarea value={form.howTo} onChange={(e) => set("howTo", e.target.value)} rows={5} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono" placeholder="Step-by-step instructions..." />
        </div>
      </div>
    </Modal>
  )
}
