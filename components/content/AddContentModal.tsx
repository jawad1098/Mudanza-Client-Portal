"use client"
import { useState } from "react"
import { Modal } from "@/components/ui/Modal"
import { usePortalStore } from "@/store/portalStore"
import { useToast } from "@/components/ui/Toast"
import type { ContentType, ContentColumn } from "@/types"

interface AddContentModalProps {
  isOpen: boolean
  onClose: () => void
}

export function AddContentModal({ isOpen, onClose }: AddContentModalProps) {
  const addContentItem = usePortalStore((s) => s.addContentItem)
  const { showToast } = useToast()
  const [form, setForm] = useState({
    title: "", description: "",
    type: "Blog Post" as ContentType,
    column: "drafted" as ContentColumn,
    date: "",
  })

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }))

  const handleSave = () => {
    if (!form.title.trim()) return
    addContentItem({ ...form, approved: false })
    setForm({ title: "", description: "", type: "Blog Post", column: "drafted", date: "" })
    onClose()
    showToast("Content item added")
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Content" footer={
      <button onClick={handleSave} className="w-full bg-blue-700 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-800">Add Content</button>
    }>
      <div className="space-y-3">
        <div>
          <label className="text-xs font-medium text-gray-500 block mb-1">Title *</label>
          <input value={form.title} onChange={(e) => set("title", e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-500 block mb-1">Description</label>
          <textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={2} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-gray-500 block mb-1">Type</label>
            <select value={form.type} onChange={(e) => set("type", e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              {["Blog Post", "Instagram Caption", "Facebook Post", "GMB Post", "Email", "Other"].map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 block mb-1">Column</label>
            <select value={form.column} onChange={(e) => set("column", e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="drafted">Drafted</option>
              <option value="approval">Needs Approval</option>
              <option value="published">Published</option>
            </select>
          </div>
        </div>
        <div>
          <label className="text-xs font-medium text-gray-500 block mb-1">Date</label>
          <input type="date" value={form.date} onChange={(e) => set("date", e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
      </div>
    </Modal>
  )
}
