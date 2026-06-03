"use client"
import { format } from "date-fns"
import { Plus } from "lucide-react"
import { usePortalStore } from "@/store/portalStore"
import { CONFIG } from "@/lib/config"
import { useState } from "react"
import { Modal } from "@/components/ui/Modal"
import { useToast } from "@/components/ui/Toast"

export function WelcomeBanner() {
  const isAdmin = usePortalStore((s) => s.isAdminMode)
  const addActivityItem = usePortalStore((s) => s.addActivityItem)
  const [open, setOpen] = useState(false)
  const [text, setText] = useState("")
  const [color, setColor] = useState<"green" | "blue" | "violet" | "amber" | "rose" | "teal">("blue")
  const { showToast } = useToast()

  const handleSave = () => {
    if (!text.trim()) return
    addActivityItem({ text, time: format(new Date(), "MMM d, h:mm a"), color })
    setText("")
    setOpen(false)
    showToast("Activity added")
  }

  return (
    <>
      <div className="bg-white border border-gray-200 rounded-xl p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-sm text-gray-500 mb-1">Welcome back, {CONFIG.client.name} 👋</p>
          <h2 className="text-2xl font-semibold text-gray-900">Your Digital Services Dashboard</h2>
          <p className="text-sm text-gray-400 mt-1">{format(new Date(), "MMMM yyyy")} · Services by {CONFIG.freelancer.name}</p>
        </div>
        {isAdmin && (
          <button onClick={() => setOpen(true)} className="flex items-center gap-2 text-sm bg-blue-700 text-white px-4 py-2 rounded-lg hover:bg-blue-800 transition-colors">
            <Plus size={16} /> Add Activity
          </button>
        )}
      </div>
      <Modal isOpen={open} onClose={() => setOpen(false)} title="Add Activity" footer={
        <button onClick={handleSave} className="w-full bg-blue-700 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-800">Save</button>
      }>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-gray-500 block mb-1">Activity Text (HTML allowed)</label>
            <textarea value={text} onChange={(e) => setText(e.target.value)} rows={3} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="<strong>Task done</strong> — description" />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 block mb-1">Color</label>
            <select value={color} onChange={(e) => setColor(e.target.value as typeof color)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              {["green", "blue", "violet", "amber", "rose", "teal"].map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>
      </Modal>
    </>
  )
}
