"use client"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { useToast } from "@/components/ui/Toast"
import { DropZone } from "@/components/files/DropZone"
import { FileQueue } from "@/components/files/FileQueue"
import { PageHeader } from "@/components/layout/PageHeader"
import { supabase } from "@/lib/supabase"
import { usePortalStore } from "@/store/portalStore"
import { nanoid } from "nanoid"
import { MessageSquare, Trash2 } from "lucide-react"

const CATEGORIES = ["Brand Assets", "Credentials", "Photos", "Documents", "Videos", "Other"]

const categoryFolder: Record<string, string> = {
  "Brand Assets": "brand-assets",
  "Credentials": "credentials",
  "Photos": "photos",
  "Documents": "documents",
  "Videos": "videos",
  "Other": "other",
}

interface NoteRecord {
  id: string
  category: string
  note: string
  created_at: string
}

export default function SendFilesPage() {
  const [category, setCategory] = useState("Brand Assets")
  const [files, setFiles] = useState<File[]>([])
  const [note, setNote] = useState("")
  const [progress, setProgress] = useState<Record<string, number>>({})
  const [sending, setSending] = useState(false)
  const [notes, setNotes] = useState<NoteRecord[]>([])
  const [loadingNotes, setLoadingNotes] = useState(false)
  const isAdmin = usePortalStore((s) => s.isAdminMode)
  const { showToast } = useToast()

  const loadNotes = async () => {
    setLoadingNotes(true)
    const { data } = await supabase
      .from("portal_notes")
      .select("*")
      .order("created_at", { ascending: false })
    setNotes((data ?? []) as NoteRecord[])
    setLoadingNotes(false)
  }

  useEffect(() => {
    if (isAdmin) loadNotes()
  }, [isAdmin])

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

  const deleteNote = async (id: string) => {
    await supabase.from("portal_notes").delete().eq("id", id)
    setNotes((prev) => prev.filter((n) => n.id !== id))
  }

  const handleSend = async () => {
    if (!files.length && !note.trim()) return
    setSending(true)

    const folder = categoryFolder[category]
    const errors: string[] = []

    for (const file of files) {
      setProgress((prev) => ({ ...prev, [file.name]: 10 }))
      try {
        const arrayBuffer = await file.arrayBuffer()
        const filePath = `${folder}/${Date.now()}_${file.name}`
        const { error } = await supabase.storage
          .from("portal-files")
          .upload(filePath, arrayBuffer, {
            upsert: true,
            contentType: file.type || "application/octet-stream",
          })
        if (error) {
          errors.push(`${file.name}: ${error.message}`)
          setProgress((prev) => ({ ...prev, [file.name]: 0 }))
        } else {
          setProgress((prev) => ({ ...prev, [file.name]: 100 }))
        }
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "Unknown error"
        errors.push(`${file.name}: ${msg}`)
        setProgress((prev) => ({ ...prev, [file.name]: 0 }))
      }
    }

    // Save note to Supabase database (not as a file)
    if (note.trim()) {
      await supabase.from("portal_notes").insert({
        id: nanoid(),
        category,
        note: note.trim(),
      })
    }

    setSending(false)

    if (errors.length) {
      showToast(`Upload failed: ${errors[0]}`, "error")
    } else {
      setFiles([])
      setProgress({})
      setNote("")
      const count = files.length
      showToast(`${count > 0 ? `${count} file${count > 1 ? "s" : ""} sent` : "Note sent"} successfully ✓`)
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
            disabled={(!files.length && !note.trim()) || sending}
            className="w-full bg-blue-700 text-white py-3 rounded-lg text-sm font-medium hover:bg-blue-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {sending ? "Sending..." : `Send to Jawad${files.length > 0 ? ` (${files.length} file${files.length > 1 ? "s" : ""})` : ""}`}
          </button>
        </div>
      </div>

      {/* Admin: Notes inbox */}
      {isAdmin && (
        <div className="mt-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-800 flex items-center gap-2">
              <MessageSquare size={16} className="text-blue-600" /> Notes from Gabriel
            </h2>
            <button onClick={loadNotes} className="text-xs text-blue-600 hover:underline">Refresh</button>
          </div>

          {loadingNotes ? (
            <p className="text-sm text-gray-400">Loading notes…</p>
          ) : notes.length === 0 ? (
            <div className="border border-dashed border-gray-200 rounded-xl p-8 text-center">
              <p className="text-sm text-gray-400">No notes yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notes.map((n) => (
                <div key={n.id} className="bg-white border border-gray-200 rounded-xl p-4 flex items-start gap-3 group">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">{n.category}</span>
                      <span className="text-xs text-gray-400">{new Date(n.created_at).toLocaleString()}</span>
                    </div>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{n.note}</p>
                  </div>
                  <button
                    onClick={() => deleteNote(n.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-50 rounded text-gray-300 hover:text-red-500"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
