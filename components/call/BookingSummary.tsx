"use client"
import { format } from "date-fns"
import { MessageCircle } from "lucide-react"
import { CONFIG } from "@/lib/config"

interface BookingSummaryProps {
  date: Date | null
  time: string | null
  callType: string
}

export function BookingSummary({ date, time, callType }: BookingSummaryProps) {
  const canBook = date && time

  const handleWhatsApp = () => {
    if (!canBook) return
    const msg = CONFIG.booking.whatsappTemplate
      .replace("{date}", format(date, "MMMM d, yyyy"))
      .replace("{time}", time!)
      .replace("{type}", callType)
    const url = `https://wa.me/${CONFIG.freelancer.whatsapp}?text=${encodeURIComponent(msg)}`
    window.open(url, "_blank")
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <p className="font-semibold text-sm text-gray-900 mb-4">Booking Summary</p>
      <div className="space-y-3 mb-6">
        {[
          { label: "Call Type", value: callType },
          { label: "Date", value: date ? format(date, "MMMM d, yyyy") : "—" },
          { label: "Time", value: time || "—" },
        ].map(({ label, value }) => (
          <div key={label} className="flex items-center justify-between">
            <span className="text-sm text-gray-400">{label}</span>
            <span className="text-sm font-medium text-gray-900">{value}</span>
          </div>
        ))}
      </div>
      <button
        onClick={handleWhatsApp}
        disabled={!canBook}
        className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <MessageCircle size={16} />
        Book via WhatsApp
      </button>
      {!canBook && <p className="text-xs text-gray-400 text-center mt-2">Select a date and time to continue</p>}
    </div>
  )
}
