"use client"
import { useState, useRef } from "react"
import { Upload, AlertCircle } from "lucide-react"
import { Modal } from "@/components/ui/Modal"
import { usePortalStore } from "@/store/portalStore"
import { useToast } from "@/components/ui/Toast"
import type { TaskCategory, TaskWeek } from "@/types"

interface ParsedRow {
  name: string
  category: TaskCategory
  week: TaskWeek
  date: string
}

interface ImportCSVModalProps {
  isOpen: boolean
  onClose: () => void
}

export function ImportCSVModal({ isOpen, onClose }: ImportCSVModalProps) {
  const addTasks = usePortalStore((s) => s.addTasks)
  const { showToast } = useToast()
  const [parsed, setParsed] = useState<ParsedRow[] | null>(null)
  const [error, setError] = useState("")
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Proper CSV parser — handles quoted fields with commas inside
  const splitCSVRow = (line: string): string[] => {
    const cols: string[] = []
    let current = ""
    let inQuotes = false
    for (let i = 0; i < line.length; i++) {
      const ch = line[i]
      if (ch === '"') {
        if (inQuotes && line[i + 1] === '"') { current += '"'; i++ } // escaped quote
        else inQuotes = !inQuotes
      } else if (ch === "," && !inQuotes) {
        cols.push(current.trim())
        current = ""
      } else {
        current += ch
      }
    }
    cols.push(current.trim())
    return cols
  }

  const parseCSV = (text: string) => {
    // Normalise line endings
    const lines = text.trim().replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n")
    if (lines.length < 2) { setError("CSV must have a header row and at least one data row."); return }
    const headers = splitCSVRow(lines[0]).map((h) => h.toLowerCase().replace(/[^a-z]/g, ""))
    const taskIdx = headers.indexOf("task")
    const catIdx = headers.indexOf("category")
    const weekIdx = headers.indexOf("week")
    const dateIdx = headers.indexOf("date")
    if (taskIdx === -1) { setError("Missing required column: task"); return }

    const rows: ParsedRow[] = []
    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue
      const cols = splitCSVRow(lines[i])
      if (!cols[taskIdx]) continue
      // Normalise week: "Week 1" / "week1" / "1" / "W1" → "W1"
      const rawWeek = (cols[weekIdx] || "").trim()
      const weekNum = rawWeek.replace(/[^0-9]/g, "")
      const week: TaskWeek = (["W1","W2","W3","W4"].includes(rawWeek.toUpperCase())
        ? rawWeek.toUpperCase()
        : weekNum ? `W${weekNum}` : "W1") as TaskWeek

      rows.push({
        name: cols[taskIdx] || "",
        category: (cols[catIdx] as TaskCategory) || "Other",
        week,
        date: cols[dateIdx] || "",
      })
    }
    if (!rows.length) { setError("No valid rows found."); return }
    setError("")
    setParsed(rows)
  }

  const handleFile = (file: File) => {
    if (!file.name.endsWith(".csv")) { setError("Only .csv files are accepted."); return }
    const reader = new FileReader()
    reader.onload = (e) => parseCSV(e.target?.result as string)
    reader.readAsText(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  const handleConfirm = async () => {
    if (!parsed) return
    // Generate IDs here so we can send the exact same tasks to both store and Supabase
    const { nanoid } = await import("nanoid")
    const { upsertTasksToDB } = await import("@/lib/taskSync")
    const tasksWithIds = parsed.map((r) => ({ ...r, id: nanoid(), status: "pending" as const }))
    // Add to store (store's addTasks generates its own IDs, so use setTasksFromDB to merge)
    const existing = usePortalStore.getState().tasks
    usePortalStore.getState().setTasksFromDB([...existing, ...tasksWithIds])
    // Sync all to Supabase
    await upsertTasksToDB(tasksWithIds)
    setParsed(null)
    onClose()
    showToast(`${parsed.length} tasks imported from CSV`)
  }

  const handleClose = () => {
    setParsed(null)
    setError("")
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Import CSV" size="lg" footer={
      parsed ? (
        <button onClick={handleConfirm} className="w-full bg-blue-700 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-800">
          Confirm Import ({parsed.length} tasks)
        </button>
      ) : null
    }>
      {!parsed ? (
        <div>
          <div
            className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors ${dragging ? "border-blue-400 bg-blue-50" : "border-gray-200 hover:border-blue-400 hover:bg-blue-50"}`}
            onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
          >
            <Upload size={32} className="text-gray-300 mx-auto mb-3" />
            <p className="text-sm font-medium text-gray-600">Drop CSV file here or click to browse</p>
            <p className="text-xs text-gray-400 mt-1">Expected columns: task, category, week, date</p>
            <input ref={inputRef} type="file" accept=".csv" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
          </div>
          {error && (
            <div className="mt-3 flex items-center gap-2 text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">
              <AlertCircle size={14} /> {error}
            </div>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-gray-400 border-b border-gray-100">
                <th className="text-left py-2 pr-4 font-medium">Task</th>
                <th className="text-left py-2 pr-4 font-medium">Category</th>
                <th className="text-left py-2 pr-4 font-medium">Week</th>
                <th className="text-left py-2 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {parsed.map((row, i) => (
                <tr key={i} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-2 pr-4 text-gray-700">{row.name}</td>
                  <td className="py-2 pr-4 text-gray-500">{row.category}</td>
                  <td className="py-2 pr-4 text-gray-500">{row.week}</td>
                  <td className="py-2 text-gray-500">{row.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Modal>
  )
}
