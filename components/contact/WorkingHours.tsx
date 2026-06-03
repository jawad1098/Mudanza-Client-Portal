"use client"
import { useState } from "react"
import { Pencil, Check, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { usePortalStore } from "@/store/portalStore"

function isOpenNow(workingHours: { day: string; open: string | null; close: string | null }[]) {
  const now = new Date()
  const dayName = now.toLocaleDateString("en-US", { weekday: "long" })
  const hours = workingHours.find((h) => h.day === dayName)
  if (!hours || !hours.open || !hours.close) return false

  const parseTime = (t: string) => {
    const [time, period] = t.split(" ")
    const [h, m] = time.split(":").map(Number)
    let hr = h
    if (period === "PM" && hr !== 12) hr += 12
    if (period === "AM" && hr === 12) hr = 0
    return hr * 60 + m
  }

  const currentMinutes = now.getHours() * 60 + now.getMinutes()
  return currentMinutes >= parseTime(hours.open) && currentMinutes < parseTime(hours.close)
}

const TIME_OPTIONS = [
  "6:00 AM","7:00 AM","8:00 AM","9:00 AM","10:00 AM","11:00 AM",
  "12:00 PM","1:00 PM","2:00 PM","3:00 PM","4:00 PM","5:00 PM",
  "6:00 PM","7:00 PM","8:00 PM","9:00 PM","10:00 PM",
]

export function WorkingHours() {
  const isAdmin = usePortalStore((s) => s.isAdminMode)
  const workingHours = usePortalStore((s) => s.workingHours)
  const updateWorkingHour = usePortalStore((s) => s.updateWorkingHour)

  const today = new Date().toLocaleDateString("en-US", { weekday: "long" })
  const openNow = isOpenNow(workingHours)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(workingHours)

  const startEdit = () => { setDraft(workingHours); setEditing(true) }
  const cancelEdit = () => setEditing(false)
  const saveEdit = () => {
    draft.forEach((h) => updateWorkingHour(h.day, h.open, h.close))
    setEditing(false)
  }

  const setDay = (day: string, field: "open" | "close", value: string | null) =>
    setDraft((d) => d.map((h) => h.day === day ? { ...h, [field]: value } : h))

  const toggleClosed = (day: string, closed: boolean) =>
    setDraft((d) => d.map((h) => h.day === day ? { ...h, open: closed ? null : "9:00 AM", close: closed ? null : "6:00 PM" } : h))

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 relative">
      {isAdmin && !editing && (
        <button onClick={startEdit} className="absolute top-4 right-4 p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-blue-600 transition-colors">
          <Pencil size={14} />
        </button>
      )}

      <div className="flex items-center justify-between mb-5">
        <h3 className="font-semibold text-gray-900">Working Hours</h3>
        {openNow && !editing && (
          <span className="text-xs font-medium bg-green-50 text-green-700 px-2 py-1 rounded-full flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500" /> Open Now
          </span>
        )}
      </div>

      {editing ? (
        <div className="space-y-2">
          {draft.map((h) => (
            <div key={h.day} className="grid grid-cols-[80px_1fr] gap-2 items-center">
              <span className="text-sm text-gray-600 font-medium">{h.day.slice(0, 3)}</span>
              {h.open === null ? (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-400 flex-1">Closed</span>
                  <button onClick={() => toggleClosed(h.day, false)} className="text-xs text-blue-600 hover:underline">Set hours</button>
                </div>
              ) : (
                <div className="flex items-center gap-1">
                  <select value={h.open ?? ""} onChange={(e) => setDay(h.day, "open", e.target.value)}
                    className="flex-1 border border-gray-200 rounded px-1 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500">
                    {TIME_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                  <span className="text-gray-400 text-xs">–</span>
                  <select value={h.close ?? ""} onChange={(e) => setDay(h.day, "close", e.target.value)}
                    className="flex-1 border border-gray-200 rounded px-1 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500">
                    {TIME_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                  <button onClick={() => toggleClosed(h.day, true)} className="text-xs text-gray-400 hover:text-red-500 ml-1">✕</button>
                </div>
              )}
            </div>
          ))}
          <div className="flex gap-2 pt-3">
            <button onClick={cancelEdit} className="flex-1 flex items-center justify-center gap-1.5 border border-gray-200 text-gray-600 py-2 rounded-lg text-sm hover:bg-gray-50"><X size={13} /> Cancel</button>
            <button onClick={saveEdit} className="flex-1 flex items-center justify-center gap-1.5 bg-blue-700 text-white py-2 rounded-lg text-sm hover:bg-blue-800"><Check size={13} /> Save</button>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {workingHours.map(({ day, open, close }) => {
            const isToday = day === today
            return (
              <div key={day} className={cn("flex items-center justify-between py-2 px-3 rounded-lg text-sm", isToday && "bg-blue-50 text-blue-700 font-medium")}>
                <span>{day}</span>
                {open && close ? (
                  <span className={cn(!isToday && "text-gray-600")}>{open} – {close}</span>
                ) : (
                  <span className="text-gray-400">Closed</span>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
