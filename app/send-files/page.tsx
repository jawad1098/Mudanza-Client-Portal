"use client"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { useToast } from "@/components/ui/Toast"
import { DropZone } from "@/components/files/DropZone"
import { FileQueue } from "@/components/files/FileQueue"
import { PageHeader } from "@/components/layout/PageHeader"
import { supabase } from "@/lib/supabase"

const CATEGORIES = ["Brand Assets", "Credentials", "Photos", "Documents", "Videos", "Other"]

const categoryFolder: Record<string, string> = {
  "Brand Assets": "brand-assets",
  "Credentials": "credentials",
  "Photos": "photos",
  "Documents": "documents",
  "Videos": "videos",
  "Other": "other",
}

export default function SendFilesPage() {
  const [category, setCategory] = useState("Brand Assets")
  const [files, setFiles] = useState<File[]>([])
  const [note, setNote] = useState("")
  const [progress, setProgress] = useState<Record<string, number>>({})
  const [sending, setSending] = useState(false)
  const { showToast } = useToast()

  const addFiles = (newFiles: File[]) => {
    setFiles((prev) => {
      const names = new Set(prev.map((f) => f.name))
      return [...prev, ...newFiles.filter((f) => !names.has(f.name))]
    })
  }

  const removeFile = (name: string) => {
    setFiles((prev) => prev.filter((f) => f.name !== name))
    setProgress((prev) => { const n = { ...prev }; delete n[name]; return n })
  }

  const handleSend = async () => {
    if (!files.length) return
    setSending(true)

    const folder = categoryFolder[category]
    const errors: string[] = []

    for (const file of files) {
      setProgress((prev) => ({ ...prev, [file.name]: 10 }))

      try {
        // Convert File to ArrayBuffer for reliable browser upload
        const arrayBuffer = await file.arrayBuffer()
        const filePath = `${folder}/${Date.now()}_${file.name}`

        const { error } = await supabase.storage
          .from("portal-files")
          .upload(filePath, arrayBuffer, {
            upsert: true,
            contentType: file.type || "application/octet-stream",
          })

        if (error) {
          console.error(`Upload failed for ${file.name}:`, error.message)
          errors.push(`${file.name}: ${error.message}`)
          setProgress((prev) => ({ ...prev, [file.name]: 0 }))
        } else {
          setProgress((prev) => ({ ...prev, [file.name]: 100 }))
        }
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "Unknown error"
        console.error(`Exception uploading ${file.name}:`, msg)
        errors.push(`${file.name}: ${msg}`)
        setProgress((prev) => ({ ...prev, [file.name]: 0 }))
      }
    }

    // If there's a note, save it as a text file alongside the uploads
    if (note.trim()) {
      const noteBlob = new Blob([note], { type: "text/plain" })
      const noteFile = new File([noteBlob], `note_${Date.now()}.txt`)
      await supabase.storage
        .from("portal-files")
        .upload(`${folder}/${noteFile.name}`, noteFile, { upsert: true })
    }

    setSending(false)

    if (errors.length) {
      showToast(`Upload failed: ${errors[0]}`, "error")
    } else {
      setFiles([])
      setProgress({})
      setNote("")
      showToast(`${files.length} file${files.length > 1 ? "s" : ""} sent successfully ✓`)
    }
  }

  return (
    <div>
      <PageHeader title="Send Files" description="Upload files securely to Jawad" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-3">File Category</p>
          <div className="flex flex-wrap gap-2 mb-6">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={cn(
                  "px-4 py-1.5 rounded-full text-sm font-medium border transition-colors",
                  category === c ? "bg-blue-700 text-white border-blue-700" : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                )}
              >
                {c}
              </button>
            ))}
          </div>
          <DropZone onFiles={addFiles} />
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-3">Files to Send</p>
            {files.length > 0 ? (
              <FileQueue files={files} progress={progress} onRemove={removeFile} />
            ) : (
              <div className="border border-dashed border-gray-200 rounded-xl p-8 text-center">
                <p className="text-sm text-gray-400">No files added yet</p>
              </div>
            )}
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-gray-400 block mb-2">Note to Jawad (optional)</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              placeholder="Add any context or instructions..."
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            onClick={handleSend}
            disabled={!files.length || sending}
            className="w-full bg-blue-700 text-white py-3 rounded-lg text-sm font-medium hover:bg-blue-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {sending ? "Uploading..." : `Send to Jawad${files.length > 0 ? ` (${files.length} file${files.length > 1 ? "s" : ""})` : ""}`}
          </button>
        </div>
      </div>
    </div>
  )
}
