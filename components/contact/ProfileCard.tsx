"use client"
import { useState } from "react"
import { MessageCircle, Mail, Pencil, Check, X, Plus, Trash2 } from "lucide-react"
import { usePortalStore } from "@/store/portalStore"

export function ProfileCard() {
  const isAdmin = usePortalStore((s) => s.isAdminMode)
  const contactConfig = usePortalStore((s) => s.contactConfig)
  const updateContactConfig = usePortalStore((s) => s.updateContactConfig)

  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(contactConfig)
  const [newSkill, setNewSkill] = useState("")

  const startEdit = () => { setDraft(contactConfig); setEditing(true) }
  const cancelEdit = () => setEditing(false)
  const saveEdit = () => { updateContactConfig(draft); setEditing(false) }

  const removeSkill = (skill: string) =>
    setDraft((d) => ({ ...d, skills: d.skills.filter((s) => s !== skill) }))

  const addSkill = () => {
    if (!newSkill.trim()) return
    setDraft((d) => ({ ...d, skills: [...d.skills, newSkill.trim()] }))
    setNewSkill("")
  }

  const f = (key: keyof typeof draft, value: string) =>
    setDraft((d) => ({ ...d, [key]: value }))

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 relative">
      {isAdmin && !editing && (
        <button onClick={startEdit} className="absolute top-4 right-4 p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-blue-600 transition-colors">
          <Pencil size={14} />
        </button>
      )}

      {editing ? (
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-gray-500 block mb-1">Name</label>
            <input value={draft.name} onChange={(e) => f("name", e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 block mb-1">Title</label>
            <input value={draft.title} onChange={(e) => f("title", e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 block mb-1">WhatsApp Number</label>
            <input value={draft.whatsapp} onChange={(e) => f("whatsapp", e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="923001234567" />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 block mb-1">Email</label>
            <input value={draft.email} onChange={(e) => f("email", e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-500 block mb-1">WhatsApp Response</label>
              <input value={draft.whatsappResponseTime} onChange={(e) => f("whatsappResponseTime", e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 block mb-1">Email Response</label>
              <input value={draft.emailResponseTime} onChange={(e) => f("emailResponseTime", e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 block mb-2">Skills</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {draft.skills.map((skill) => (
                <span key={skill} className="flex items-center gap-1 text-xs bg-gray-100 text-gray-600 rounded-full px-3 py-1">
                  {skill}
                  <button onClick={() => removeSkill(skill)} className="hover:text-red-500 ml-1"><X size={10} /></button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input value={newSkill} onChange={(e) => setNewSkill(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addSkill()} placeholder="Add skill..." className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <button onClick={addSkill} className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm"><Plus size={14} /></button>
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <button onClick={cancelEdit} className="flex-1 flex items-center justify-center gap-1.5 border border-gray-200 text-gray-600 py-2 rounded-lg text-sm hover:bg-gray-50"><X size={13} /> Cancel</button>
            <button onClick={saveEdit} className="flex-1 flex items-center justify-center gap-1.5 bg-blue-700 text-white py-2 rounded-lg text-sm hover:bg-blue-800"><Check size={13} /> Save</button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-16 h-16 rounded-full bg-blue-700 flex items-center justify-center text-white font-bold text-xl mb-4">
              {contactConfig.name.charAt(0).toUpperCase()}
            </div>
            <h3 className="font-semibold text-gray-900 text-lg">{contactConfig.name}</h3>
            <p className="text-sm text-gray-500 mt-0.5">{contactConfig.title}</p>
            <div className="flex flex-wrap justify-center gap-2 mt-4">
              {contactConfig.skills.map((skill) => (
                <span key={skill} className="text-xs bg-gray-100 text-gray-600 rounded-full px-3 py-1">{skill}</span>
              ))}
            </div>
          </div>

          <div className="space-y-3 mb-6">
            <a href={`https://wa.me/${contactConfig.whatsapp}`} target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-lg text-sm font-medium transition-colors">
              <MessageCircle size={16} /> WhatsApp
            </a>
            <a href={`mailto:${contactConfig.email}`}
              className="flex items-center justify-center gap-2 w-full bg-blue-700 hover:bg-blue-800 text-white py-2.5 rounded-lg text-sm font-medium transition-colors">
              <Mail size={16} /> Email
            </a>
          </div>

          <div className="border-t border-gray-100 pt-4 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-gray-500"><MessageCircle size={14} /> WhatsApp</span>
              <span className="text-gray-700 font-medium">{contactConfig.whatsappResponseTime}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-gray-500"><Mail size={14} /> Email</span>
              <span className="text-gray-700 font-medium">{contactConfig.emailResponseTime}</span>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
