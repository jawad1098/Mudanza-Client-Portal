"use client"
import { cn } from "@/lib/utils"
import { CONFIG } from "@/lib/config"

function isOpenNow() {
  const now = new Date()
  const dayName = now.toLocaleDateString("en-US", { weekday: "long" })
  const hours = CONFIG.workingHours.find((h) => h.day === dayName)
  if (!hours || !hours.open || !hours.close) return false

  const parseTime = (t: string) => {
    const [time, period] = t.split(" ")
    const [h, m] = time.split(":").map(Number)
    let hours = h
    if (period === "PM" && hours !== 12) hours += 12
    if (period === "AM" && hours === 12) hours = 0
    return hours * 60 + m
  }

  const currentMinutes = now.getHours() * 60 + now.getMinutes()
  return currentMinutes >= parseTime(hours.open) && currentMinutes < parseTime(hours.close)
}

export function WorkingHours() {
  const today = new Date().toLocaleDateString("en-US", { weekday: "long" })
  const openNow = isOpenNow()

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-semibold text-gray-900">Working Hours</h3>
        {openNow && (
          <span className="text-xs font-medium bg-green-50 text-green-700 px-2 py-1 rounded-full flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
            Open Now
          </span>
        )}
      </div>
      <div className="space-y-2">
        {CONFIG.workingHours.map(({ day, open, close }) => {
          const isToday = day === today
          return (
            <div
              key={day}
              className={cn(
                "flex items-center justify-between py-2 px-3 rounded-lg text-sm",
                isToday && "bg-blue-50 text-blue-700 font-medium"
              )}
            >
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
    </div>
  )
}
