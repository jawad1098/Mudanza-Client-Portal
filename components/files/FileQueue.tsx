"use client"
import { X } from "lucide-react"

const fileEmoji = (name: string) => {
  const ext = name.split(".").pop()?.toLowerCase()
  if (["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext || "")) return "🖼️"
  if (["pdf"].includes(ext || "")) return "📄"
  if (["doc", "docx"].includes(ext || "")) return "📝"
  if (["mp4", "mov", "avi"].includes(ext || "")) return "🎥"
  if (["zip", "rar"].includes(ext || "")) return "📦"
  return "📎"
}

const formatSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

interface FileQueueProps {
  files: File[]
  progress: Record<string, number>
  onRemove: (name: string) => void
}

export function FileQueue({ files, progress, onRemove }: FileQueueProps) {
  if (!files.length) return null

  return (
    <div className="space-y-2">
      {files.map((file) => (
        <div key={file.name} className="bg-white border border-gray-200 rounded-lg px-4 py-3">
          <div className="flex items-center gap-3">
            <span className="text-xl shrink-0">{fileEmoji(file.name)}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-700 truncate">{file.name}</p>
              <p className="text-xs text-gray-400">{formatSize(file.size)}</p>
            </div>
            <button onClick={() => onRemove(file.name)} className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-600">
              <X size={14} />
            </button>
          </div>
          {progress[file.name] !== undefined && (
            <div className="mt-2 h-1 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 rounded-full transition-all duration-100"
                style={{ width: `${progress[file.name]}%` }}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
