"use client"
import { format } from "date-fns"
import { Plus, Pencil, Check, X } from "lucide-react"
import { usePortalStore } from "@/store/portalStore"
import { useState } from "react"
import { Modal } from "@/components/ui/Modal"
import { useToast } from "@/components/ui/Toast"

export function WelcomeBanner() {
  const isAdmin = usePortalStore((s) => s.isAdminMode)
  const addActivityItem = usePortalStore((s) => s.addActivityItem)
  const clientConfig = usePortalStore((s) => s.clientConfig)
  const updateClientConfig = usePortalStore((s) => s.updateClientConfig)
  const contactConfig = usePortalStore((s) => s.contactConfig)

  const [activityOpen, setActivityOpen] = useState(false)
  const [text, setText] = useState("")
  const [color, setColor] = useState<"green" | "blue" | "violet" | "amber" | "rose" | "teal">("blue")
  const [editingClient, setEditingClient] = useState(false)
  const [draft, setDraft] = useState(clientConfig)
  const { showToast } = useToast()

  const handleSaveActivity = () => {
    if (!text.trim()) return
    addActivityItem({ text, time: format(new Date(), "MMM d, h:mm a"), color })
    setText("")
    setActivityOpen(false)
    showToast("Activity added")
  }

  const handleSaveClient = () => {
    // Auto-generate initials from full name if not set
    const initials = draft.initials || draft.fullName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    updateClientConfig({ ...draft, initials })
    setEditingClient(false)
    showToast("Client info updated")
  }

  return (
    <>
      <div className="bg-white border border-gray-200 rounded-xl p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-start gap-3">
          <div>
            <p className="text-sm text-gray-500 mb-1">Welcome back, {clientConfig.name} 👋</p>
            <h2 className="text-2xl font-semibold text-gray-900">{clientConfig.company}</h2>
            <p className="text-sm text-gray-400 mt-1">{format(new Date(), "MMMM yyyy")} · Services by {contactConfig.name}</p>
          </div>
          {isAdmin && (
            <button onClick={() => { setDraft(clientConfig); setEditingClient(true) }} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-blue-600 transition-colors mt-0.5">
              <Pencil size={13} />
            </button>
          )}
        </div>
        {isAdmin && (
          <button onClick={() => setActivityOpen(true)} className="flex items-center gap-2 text-sm bg-blue-700 text-white px-4 py-2 rounded-lg hover:bg-blue-800 transition-colors">
            <Plus size={16} /> Add Activity
          </button>
        )}
      </div>

      {/* Add Activity Modal */}
      <Modal isOpen={activityOpen} onClose={() => setActivityOpen(false)} title="Add Activity" footer={
        <button onClick={handleSaveActivity} className="w-full bg-blue-700 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-800">Save</button>
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

      {/* Edit Client Info Modal */}
      <Modal isOpen={editingClient} onClose={() => setEditingClient(false)} title="Edit Client Info" footer={
        <div className="flex gap-2">
          <button onClick={() => setEditingClient(false)} className="flex-1 border border-gray-200 text-gray-600 py-2 rounded-lg text-sm hover:bg-gray-50 flex items-center justify-center gap-1"><X size={13} /> Cancel</button>
          <button onClick={handleSaveClient} className="flex-1 bg-blue-700 text-white py-2 rounded-lg text-sm hover:bg-blue-800 flex items-center justify-center gap-1"><Check size={13} /> Save</button>
        </div>
      }>
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-gray-500 block mb-1">First Name (shown in greeting)</label>
            <input value={draft.name} onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 block mb-1">Full Name</label>
            <input value={draft.fullName} onChange={(e) => setDraft((d) => ({ ...d, fullName: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 block mb-1">Company Name</label>
            <input value={draft.company} onChange={(e) => setDraft((d) => ({ ...d, company: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 block mb-1">Initials (shown on avatar — leave blank to auto-generate)</label>
            <input value={draft.initials} onChange={(e) => setDraft((d) => ({ ...d, initials: e.target.value.toUpperCase().slice(0, 2) }))} maxLength={2} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="GG" />
          </div>
        </div>
      </Modal>
    </>
  )
}
