"use client"
import { useState, useRef } from "react"
import { Upload } from "lucide-react"
import { cn } from "@/lib/utils"

interface DropZoneProps {
  onFiles: (files: File[]) => void
}

export function DropZone({ onFiles }: DropZoneProps) {
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const files = Array.from(e.dataTransfer.files)
    if (files.length) onFiles(files)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length) onFiles(files)
    e.target.value = ""
  }

  return (
    <div
      className={cn(
        "border-2 border-dashed rounded-xl p-16 text-center cursor-pointer transition-all",
        dragging ? "border-blue-400 bg-blue-50" : "border-gray-200 hover:border-blue-400 hover:bg-blue-50"
      )}
      onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
    >
      <Upload size={40} className="text-gray-300 mx-auto mb-4" />
      <p className="text-lg font-medium text-gray-600">Drop files here</p>
      <p className="text-sm text-gray-400 mt-1">or click to browse · any type · any size</p>
      <input ref={inputRef} type="file" multiple className="hidden" onChange={handleChange} />
    </div>
  )
}
