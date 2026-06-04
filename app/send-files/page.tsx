"use client"
import { useState, useEffect, useCallback } from "react"
import { cn } from "@/lib/utils"
import { useToast } from "@/components/ui/Toast"
import { DropZone } from "@/components/files/DropZone"
import { FileQueue } from "@/components/files/FileQueue"
import { PageHeader } from "@/components/layout/PageHeader"
import { supabase } from "@/lib/supabase"
import { usePortalStore } from "@/store/portalStore"
import { nanoid } from "nanoid"
import { MessageSquare, Trash2, Download, FileText, FileImage, FileVideo, File, RefreshCw } from "lucide-react"

const CATEGORIES = ["Brand Assets", "Credentials", "Photos", "Documents", "Videos", "Other"]

const categoryFolder: Record<string, string> = {
  "Brand Assets": "brand-assets",
  "Credentials": "credentials",
  "Photos": "photos",
  "Documents": "documents",
  "Videos": "videos",
  "Other": "other",
}

const categoryColors: Record<string, string> = {
  "Brand Assets": "bg-rose-50 text-rose-700",
  "Credentials": "bg-amber-50 text-amber-700",
  "Photos": "bg-pink-50 text-pink-700",
  "Documents": "bg-blue-50 text-blue-700",
  "Videos": "bg-violet-50 text-violet-700",
  "Other": "bg-gray-100 text-gray-600",
}

interface StorageFile {
  path: string          // full path in bucket e.g. "brand-assets/1234_logo.png"
  folder: string        // "brand-assets"
  category: string      // "Brand Assets"
  displayName: string   // original name stripped of timestamp prefix
  size: number
  mimeType: string
  createdAt: string
}

interface NoteRecord {
  id: string
  category: string
  note: string
  created_at: string
}

function fileIcon(mime: string) {
  if (mime.startsWith("image/")) return <FileImage size={18} className="text-rose-400 shrink-0" />
  if (mime.startsWith("video/")) return <FileVideo size={18} className="text-violet-400 shrink-0" />
  if (mime === "application/pdf") return <FileText size={18} className="text-red-500 shrink-0" />
  if (mime.includes("word") || mime.includes("document")) return <FileText size={18} className="text-blue-500 shrink-0" />
  if (mime.includes("sheet") || mime.includes("excel") || mime.includes("csv")) return <FileText size={18} className="text-green-500 shrink-0" />
  return <File size={18} className="text-gray-400 shrink-0" />
}

function formatSize(bytes: number) {
  if (!bytes) return "—"
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
  } catch { return "—" }
}

function stripTimestampPrefix(name: string) {
  // Remove leading "1234567890_" timestamp prefix added during upload
  return name.replace(/^\d+_/, "")
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

  // Uploaded files state
  const [uploadedFiles, setUploadedFiles] = useState<StorageFile[]>([])
  const [loadingFiles, setLoadingFiles] = useState(true)
  const [filterCategory, setFilterCategory] = useState("All")

  const loadNotes = async () => {
    setLoadingNotes(true)
    const { data } = await supabase
      .from("portal_notes")
      .select("*")
      .order("created_at", { ascending: false })
    setNotes((data ?? []) as NoteRecord[])
    setLoadingNotes(false)
  }

  const loadUploadedFiles = useCallback(async () => {
    setLoadingFiles(true)
    const allFiles: StorageFile[] = []

    for (const [cat, folder] of Object.entries(categoryFolder)) {
      const { data, error } = await supabase.storage
        .from("portal-files")
        .list(folder, { limit: 200, sortBy: { column: "created_at", order: "desc" } })

      if (error || !data) continue

      for (const item of data) {
        // Skip placeholder files (Supabase sometimes creates .emptyFolderPlaceholder)
        if (item.name.startsWith(".")) continue
        allFiles.push({
          path: `${folder}/${item.name}`,
          folder,
          category: cat,
          displayName: stripTimestampPrefix(item.name),
          size: item.metadata?.size ?? 0,
          mimeType: item.metadata?.mimetype ?? "application/octet-stream",
          createdAt: item.created_at ?? item.updated_at ?? "",
        })
      }
    }

    // Sort newest first
    allFiles.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    setUploadedFiles(allFiles)
    setLoadingFiles(false)
  }, [])

  useEffect(() => {
    loadUploadedFiles()
    if (isAdmin) loadNotes()
  }, [loadUploadedFiles, isAdmin])

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

  const handleDeleteFile = async (file: StorageFile) => {
    const { error } = await supabase.storage.from("portal-files").remove([file.path])
    if (error) {
      showToast("Failed to delete file", "error")
      return
    }
    setUploadedFiles((prev) => prev.filter((f) => f.path !== file.path))
    showToast("File deleted")
  }

  const handleDownloadFile = async (file: StorageFile) => {
    const { data, error } = await supabase.storage
      .from("portal-files")
      .createSignedUrl(file.path, 60)

    if (error || !data?.signedUrl) {
      showToast("Failed to generate download link", "error")
      return
    }

    const a = document.createElement("a")
    a.href = data.signedUrl
    a.download = file.displayName
    a.target = "_blank"
    a.click()
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
      const count = files.length
      const savedNote = note.trim()

      let waMessage = `Hi Jawad! 👋\n\nI just uploaded files to the client portal.\n\n📁 *Category:* ${category}\n📎 *Files:* ${count > 0 ? `${count} file${count > 1 ? "s" : ""}` : "No files"}`
      if (savedNote) waMessage += `\n\n📝 *Note:*\n${savedNote}`
      waMessage += `\n\n— Gabriel`

      setFiles([])
      setProgress({})
      setNote("")
      showToast(`${count > 0 ? `${count} file${count > 1 ? "s" : ""} sent` : "Note sent"} successfully ✓`)

      usePortalStore.getState().addActivityItem({
        text: `<strong>Files uploaded</strong> — ${count > 0 ? `${count} file${count > 1 ? "s" : ""} in ${category}` : `Note in ${category}`}${savedNote ? `: "${savedNote.slice(0, 60)}${savedNote.length > 60 ? "…" : ""}"` : ""}`,
        time: new Date().toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }),
        color: "teal",
      })

      if (!isAdmin) {
        const waUrl = `https://wa.me/923159782971?text=${encodeURIComponent(waMessage)}`
        window.open(waUrl, "_blank")
      }

      // Reload the file list so the new files appear
      loadUploadedFiles()
    }
  }

  const displayedFiles = filterCategory === "All"
    ? uploadedFiles
    : uploadedFiles.filter((f) => f.category === filterCategory)

  return (
    <div>
      <PageHeader title="Send Files" description="Upload files securely to Jawad" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
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

      {/* ── Uploaded Files ─────────────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-gray-800">Uploaded Files</h2>
          <button
            onClick={loadUploadedFiles}
            className="flex items-center gap-1.5 text-xs text-blue-600 hover:underline"
          >
            <RefreshCw size={12} /> Refresh
          </button>
        </div>

        {/* Category filter */}
        <div className="flex flex-wrap gap-2 mb-4">
          {["All", ...CATEGORIES].map((c) => (
            <button
              key={c}
              onClick={() => setFilterCategory(c)}
              className={cn(
                "px-3 py-1 rounded-full text-xs font-medium border transition-colors",
                filterCategory === c
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
              )}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          {loadingFiles ? (
            <div className="py-12 text-center">
              <div className="inline-block w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-gray-400 mt-2">Loading files…</p>
            </div>
          ) : displayedFiles.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-sm text-gray-400">No files uploaded yet in this category.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {displayedFiles.map((file) => (
                <div
                  key={file.path}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors group"
                >
                  {fileIcon(file.mimeType)}

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{file.displayName}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {formatSize(file.size)} · {formatDate(file.createdAt)}
                    </p>
                  </div>

                  <span className={cn(
                    "hidden sm:inline-flex text-xs font-medium px-2 py-0.5 rounded-full shrink-0",
                    categoryColors[file.category] || "bg-gray-100 text-gray-600"
                  )}>
                    {file.category}
                  </span>

                  <div className="flex items-center gap-1 shrink-0 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleDownloadFile(file)}
                      className="p-1.5 hover:bg-blue-50 rounded text-gray-300 hover:text-blue-600 transition-colors"
                      title="Download"
                    >
                      <Download size={14} />
                    </button>
                    <button
                      onClick={() => handleDeleteFile(file)}
                      className="p-1.5 hover:bg-red-50 rounded text-gray-300 hover:text-red-500 transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {!loadingFiles && uploadedFiles.length > 0 && (
          <p className="text-xs text-gray-400 mt-2 px-1">
            {displayedFiles.length} file{displayedFiles.length !== 1 ? "s" : ""} · {formatSize(uploadedFiles.reduce((s, f) => s + f.size, 0))} total
          </p>
        )}
      </div>

      {/* ── Admin: Notes from Gabriel ───────────────────────────────── */}
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
