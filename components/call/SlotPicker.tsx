"use client"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { CONFIG } from "@/lib/config"

interface SlotPickerProps {
  date: Date | null
  selected: string | null
  onSelect: (time: string) => void
}

export function SlotPicker({ date, selected, onSelect }: SlotPickerProps) {
  if (!date) return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <p className="text-sm text-gray-400 text-center py-8">Select a date to see available slots</p>
    </div>
  )

  const key = format(date, "yyyy-MM-dd")
  const bookedTimes = CONFIG.booking.bookedDates[key] || []

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <p className="font-semibold text-sm text-gray-900 mb-4">Available Slots — {format(date, "MMMM d, yyyy")}</p>
      <div className="space-y-2">
        {CONFIG.booking.availableSlots.map(({ time, duration }) => {
          const isBooked = bookedTimes.includes(time)
          const isSel = selected === time
          return (
            <button
              key={time}
              disabled={isBooked}
              onClick={() => !isBooked && onSelect(time)}
              className={cn(
                "w-full flex items-center justify-between px-4 py-3 border rounded-lg text-sm transition-colors",
                isBooked && "opacity-40 cursor-not-allowed border-gray-200",
                !isBooked && !isSel && "border-gray-200 hover:border-blue-400 text-gray-700",
                isSel && "border-blue-600 bg-blue-50 text-blue-700"
              )}
            >
              <span className={cn("font-medium", isBooked && "line-through")}>{time}</span>
              <span className="text-xs text-gray-400">{duration}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
