"use client"
import { cn } from "@/lib/utils"

const filters = ["All", "Today", "This Week", "This Month", "Completed", "Pending"]

interface FilterBarProps {
  active: string
  onChange: (f: string) => void
}

export function FilterBar({ active, onChange }: FilterBarProps) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {filters.map((f) => (
        <button
          key={f}
          onClick={() => onChange(f)}
          className={cn(
            "px-4 py-1.5 rounded-full text-sm font-medium transition-colors",
            active === f
              ? "bg-blue-600 text-white"
              : "bg-white border border-gray-200 text-gray-600 hover:border-gray-300 hover:text-gray-900"
          )}
        >
          {f}
        </button>
      ))}
    </div>
  )
}
