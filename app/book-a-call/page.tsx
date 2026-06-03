"use client"
import { useState } from "react"
import { Video, Phone, MessageCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { PageHeader } from "@/components/layout/PageHeader"
import { CalendarPicker } from "@/components/call/CalendarPicker"
import { SlotPicker } from "@/components/call/SlotPicker"
import { BookingSummary } from "@/components/call/BookingSummary"

const CALL_TYPES = [
  { id: "Intro", label: "Intro Call", icon: MessageCircle },
  { id: "Strategy", label: "Strategy Call", icon: Video },
  { id: "Review", label: "Review Call", icon: Phone },
]

export default function BookACallPage() {
  const [callType, setCallType] = useState("Strategy")
  const [date, setDate] = useState<Date | null>(null)
  const [time, setTime] = useState<string | null>(null)

  const handleDateSelect = (d: Date) => {
    setDate(d)
    setTime(null)
  }

  return (
    <div>
      <PageHeader title="Book a Call" description="Schedule a call with Jawad" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-3">Call Type</p>
            <div className="grid grid-cols-3 gap-3">
              {CALL_TYPES.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setCallType(id)}
                  className={cn(
                    "flex flex-col items-center gap-2 p-4 border rounded-xl text-sm font-medium transition-colors",
                    callType === id ? "border-blue-600 bg-blue-50 text-blue-700" : "border-gray-200 text-gray-600 hover:border-gray-300"
                  )}
                >
                  <Icon size={20} />
                  {label}
                </button>
              ))}
            </div>
          </div>

          <CalendarPicker selected={date} onSelect={handleDateSelect} />
        </div>

        <div className="space-y-4">
          <SlotPicker date={date} selected={time} onSelect={setTime} />
          <BookingSummary date={date} time={time} callType={callType} />
        </div>
      </div>
    </div>
  )
}
