"use client"
import { useState } from "react"
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isBefore, startOfDay, isToday, isSameDay } from "date-fns"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { CONFIG } from "@/lib/config"

interface CalendarPickerProps {
  selected: Date | null
  onSelect: (date: Date) => void
}

export function CalendarPicker({ selected, onSelect }: CalendarPickerProps) {
  const [month, setMonth] = useState(new Date())

  const days = eachDayOfInterval({ start: startOfMonth(month), end: endOfMonth(month) })
  const startPad = (getDay(startOfMonth(month)) + 6) % 7

  const isBooked = (date: Date) => {
    const key = format(date, "yyyy-MM-dd")
    const bookedSlots = CONFIG.booking.bookedDates[key] || []
    return bookedSlots.length >= CONFIG.booking.availableSlots.length
  }

  const isDisabled = (date: Date) => {
    const day = date.getDay()
    return day === 0 || day === 6 || isBefore(startOfDay(date), startOfDay(new Date()))
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <p className="font-semibold text-sm text-gray-900">{format(month, "MMMM yyyy")}</p>
        <div className="flex gap-1">
          <button onClick={() => setMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1))} className="p-1.5 hover:bg-gray-100 rounded-lg">
            <ChevronLeft size={16} className="text-gray-500" />
          </button>
          <button onClick={() => setMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1))} className="p-1.5 hover:bg-gray-100 rounded-lg">
            <ChevronRight size={16} className="text-gray-500" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map((d) => (
          <div key={d} className="text-center text-xs font-medium text-gray-400 py-1">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: startPad }).map((_, i) => <div key={`pad-${i}`} />)}
        {days.map((day) => {
          const disabled = isDisabled(day)
          const booked = !disabled && isBooked(day)
          const sel = selected && isSameDay(day, selected)
          const today = isToday(day)

          return (
            <button
              key={day.toISOString()}
              disabled={disabled}
              onClick={() => !disabled && onSelect(day)}
              className={cn(
                "relative aspect-square flex items-center justify-center text-sm rounded-full transition-colors",
                disabled && "text-gray-300 cursor-not-allowed",
                !disabled && !sel && "hover:bg-gray-100 text-gray-700",
                today && !sel && "ring-2 ring-blue-200",
                sel && "bg-blue-600 text-white"
              )}
            >
              {format(day, "d")}
              {booked && !sel && (
                <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-amber-500" />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
