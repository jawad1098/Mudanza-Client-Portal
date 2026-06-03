"use client"
import { useState, useEffect, useRef } from "react"
import { Upload, Download, Trash2, FileText, FileImage, FileVideo, File, FolderOpen, Search } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { usePortalStore } from "@/store/portalStore"
import { PageHeader } from "@/components/layout/PageHeader"
import { useToast } from "@/components/ui/Toast"
import { cn } from "@/lib/utils"
import { nanoid } from "nanoid"

const CATEGORIES = ["All", "Strategy", "Reports", "Contracts", "Brand Assets", "Resources", "Other"]
const UPLOAD_CATEGORIES = ["Strategy", "Reports", "Contracts", "Brand Assets", "Resources", "Other"]

interface DocRecord {
  id: string
  name: string
  description: string
  category: string
  file_path: string
  file_size: number
  file_type: string
  uploaded_by: string
  created_at: string
}

function fileIcon(type: string) {
  if (type.startsWith("image/")) return <FileImage size={20} className="text-rose-400" />
  if (type.startsWith("video/")) return <FileVideo size={20} className="text-violet-400" />
  if (type === "application/pdf") return <FileText size={20} className="text-red-500" />
  if (type.includes("word") || type.includes("document")) return <FileText size={20} className="text-blue-500" />
  if (type.includes("sheet") || type.includes("excel") || type.includes("csv")) return <FileText size={20} className="text-green-500" />
  if (type.includes("presentation") || type.includes("powerpoint")) return <FileText size={20} className="text-orange-500" />
  return <File size={20} className="text-gray-400" />
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

const categoryColors: Record<string, string> = {
  Strategy: "bg-violet-50 text-violet-700",
  Reports: "bg-blue-50 text-blue-700",
  Contracts: "bg-amber-50 text-amber-700",
  "Brand Assets": "bg-rose-50 text-rose-700",
  Resources: "bg-teal-50 text-teal-700",
  Other: "bg-gray-100 text-gray-600",
}

export default function DocumentsPage() {
  const isAdmin = usePortalStore((s) => s.isAdminMode)
  const clientConfig = usePortalStore((s) => s.clientConfig)
  const { showToast } = useToast()

  const [docs, setDocs] = useState<DocRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [activeCategory, setActiveCategory] = useState("All")
  const [search, setSearch] = useState("")
  const [dragOver, setDragOver] = useState(false)

  // Upload form state
  const [uploadFiles, setUploadFiles] = useState<File[]>([])
  const [uploadCategory, setUploadCategory] = useState("Strategy")
  const [uploadDescription, setUploadDescription] = useState("")
  const [showUploadPanel, setShowUploadPanel] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)

  const loadDocs = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from("portal_documents")
      .select("*")
      .order("created_at", { ascending: false })
    if (!error) setDocs((data ?? []) as DocRecord[])
    setLoading(false)
  }

  useEffect(() => { loadDocs() }, [])

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const files = Array.from(e.dataTransfer.files)
    if (files.length) {
      setUploadFiles(files)
      setShowUploadPanel(true)
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    if (files.length) {
      setUploadFiles(files)
      setShowUploadPanel(true)
    }
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const handleUpload = async () => {
    if (!uploadFiles.length) return
    setUploading(true)

    const uploaderLabel = isAdmin ? "Jawad" : clientConfig.name || "Client"
    const errors: string[] = []

    for (const file of uploadFiles) {
      try {
        const fileId = nanoid()
        const ext = file.name.split(".").pop()
        const filePath = `documents/${fileId}.${ext}`

        const arrayBuffer = await file.arrayBuffer()
        const { error: storageError } = await supabase.storage
          .from("portal-files")
          .upload(filePath, arrayBuffer, {
            upsert: false,
            contentType: file.type || "application/octet-stream",
          })

        if (storageError) {
          errors.push(`${file.name}: ${storageError.message}`)
          continue
        }

        const { error: dbError } = await supabase.from("portal_documents").insert({
          id: fileId,
          name: file.name,
          description: uploadDescription.trim(),
          category: uploadCategory,
          file_path: filePath,
          file_size: file.size,
          file_type: file.type || "application/octet-stream",
          uploaded_by: uploaderLabel,
        })

        if (dbError) errors.push(`${file.name}: ${dbError.message}`)
      } catch (e: unknown) {
        errors.push(`${file.name}: ${e instanceof Error ? e.message : "Unknown error"}`)
      }
    }

    setUploading(false)

    if (errors.length) {
      showToast(`Upload failed: ${errors[0]}`, "error")
    } else {
      showToast(`${uploadFiles.length} file${uploadFiles.length > 1 ? "s" : ""} uploaded ✓`)
      setUploadFiles([])
      setUploadDescription("")
      setShowUploadPanel(false)
      loadDocs()
    }
  }

  const handleDownload = async (doc: DocRecord) => {
    const { data, error } = await supabase.storage
      .from("portal-files")
      .createSignedUrl(doc.file_path, 60)

    if (error || !data?.signedUrl) {
      showToast("Failed to generate download link", "error")
      return
    }

    const a = document.createElement("a")
    a.href = data.signedUrl
    a.download = doc.name
    a.target = "_blank"
    a.click()
  }

  const handleDelete = async (doc: DocRecord) => {
    await supabase.storage.from("portal-files").remove([doc.file_path])
    await supabase.from("portal_documents").delete().eq("id", doc.id)
    setDocs((prev) => prev.filter((d) => d.id !== doc.id))
    showToast("Document removed")
  }

  const filtered = docs.filter((d) => {
    const matchCat = activeCategory === "All" || d.category === activeCategory
    const matchSearch = !search.trim() || d.name.toLowerCase().includes(search.toLowerCase()) || d.description?.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  return (
    <div>
      <PageHeader
        title="Documents"
        description="Shared files, reports, and business resources"
        action={
          <button
            onClick={() => { setShowUploadPanel(true) }}
            className="flex items-center gap-2 text-sm bg-blue-700 text-white px-4 py-2 rounded-lg hover:bg-blue-800"
          >
            <Upload size={14} /> Upload
          </button>
        }
      />

      {/* Upload panel */}
      {showUploadPanel && (
        <div className="bg-white border border-blue-100 rounded-xl p-5 mb-5 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-800 mb-4">Upload Documents</h3>
          <div
            className={cn(
              "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors mb-4",
              dragOver ? "border-blue-400 bg-blue-50" : "border-gray-200 hover:border-gray-300"
            )}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleFileDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleFileInput} />
            <FolderOpen size={28} className="mx-auto text-gray-300 mb-2" />
            {uploadFiles.length > 0 ? (
              <div>
                <p className="text-sm font-medium text-blue-700">{uploadFiles.length} file{uploadFiles.length > 1 ? "s" : ""} selected</p>
                <p className="text-xs text-gray-400 mt-1">{uploadFiles.map((f) => f.name).join(", ")}</p>
              </div>
            ) : (
              <div>
                <p className="text-sm text-gray-500">Drag files here or <span className="text-blue-600 font-medium">browse</span></p>
                <p className="text-xs text-gray-400 mt-1">PDF, Word, Excel, images, and more</p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            <div>
              <label className="text-xs font-medium text-gray-500 block mb-1">Category</label>
              <select
                value={uploadCategory}
                onChange={(e) => setUploadCategory(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {UPLOAD_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 block mb-1">Description (optional)</label>
              <input
                value={uploadDescription}
                onChange={(e) => setUploadDescription(e.target.value)}
                placeholder="Brief description..."
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => { setShowUploadPanel(false); setUploadFiles([]); setUploadDescription("") }}
              className="flex-1 border border-gray-200 text-gray-600 py-2 rounded-lg text-sm font-medium hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleUpload}
              disabled={!uploadFiles.length || uploading}
              className="flex-1 bg-blue-700 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {uploading ? (
                <><span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Uploading…</>
              ) : (
                <><Upload size={14} /> Upload {uploadFiles.length > 0 ? `(${uploadFiles.length})` : ""}</>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="flex items-center gap-2 flex-wrap flex-1">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setActiveCategory(c)}
              className={cn(
                "px-4 py-1.5 rounded-full text-sm font-medium border transition-colors",
                activeCategory === c
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
              )}
            >
              {c}
            </button>
          ))}
        </div>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search documents..."
            className="pl-8 pr-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-52"
          />
        </div>
      </div>

      {/* Document list */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        {loading ? (
          <div className="py-16 text-center">
            <div className="inline-block w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-gray-400 mt-2">Loading documents…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <FolderOpen size={32} className="mx-auto text-gray-200 mb-3" />
            <p className="text-sm font-medium text-gray-500">No documents yet</p>
            <p className="text-xs text-gray-400 mt-1">Upload files using the button above</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {/* Header row — desktop only */}
            <div className="hidden sm:grid grid-cols-[auto_1fr_auto_auto_auto_auto] gap-4 px-5 py-2.5 text-xs font-semibold text-gray-400 uppercase tracking-wide">
              <span className="w-8" />
              <span>Name</span>
              <span className="w-28">Category</span>
              <span className="w-24">Uploaded by</span>
              <span className="w-24">Date</span>
              <span className="w-16 text-right">Actions</span>
            </div>

            {filtered.map((doc) => (
              <div
                key={doc.id}
                className="flex flex-col sm:grid sm:grid-cols-[auto_1fr_auto_auto_auto_auto] items-start sm:items-center gap-2 sm:gap-4 px-5 py-3.5 hover:bg-gray-50 transition-colors group"
              >
                {/* Icon */}
                <div className="hidden sm:flex w-8 shrink-0">{fileIcon(doc.file_type)}</div>

                {/* Name + description */}
                <div className="flex items-start gap-2 min-w-0 w-full sm:w-auto">
                  <div className="sm:hidden shrink-0 mt-0.5">{fileIcon(doc.file_type)}</div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{doc.name}</p>
                    {doc.description && (
                      <p className="text-xs text-gray-400 truncate">{doc.description}</p>
                    )}
                    <p className="text-xs text-gray-400 sm:hidden mt-0.5">
                      {formatSize(doc.file_size)} · {formatDate(doc.created_at)} · {doc.uploaded_by}
                    </p>
                  </div>
                </div>

                {/* Category */}
                <div className="hidden sm:block w-28 shrink-0">
                  <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full", categoryColors[doc.category] || "bg-gray-100 text-gray-600")}>
                    {doc.category}
                  </span>
                </div>

                {/* Uploaded by */}
                <p className="hidden sm:block text-xs text-gray-500 w-24 shrink-0 truncate">{doc.uploaded_by}</p>

                {/* Date */}
                <p className="hidden sm:block text-xs text-gray-400 w-24 shrink-0">{formatDate(doc.created_at)}</p>

                {/* Actions */}
                <div className="flex items-center gap-1 w-16 justify-end shrink-0 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleDownload(doc)}
                    className="p-1.5 hover:bg-blue-50 rounded text-gray-300 hover:text-blue-600 transition-colors"
                    title="Download"
                  >
                    <Download size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(doc)}
                    className="p-1.5 hover:bg-red-50 rounded text-gray-300 hover:text-red-500 transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                {/* Mobile: category + actions row */}
                <div className="flex items-center justify-between w-full sm:hidden">
                  <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full", categoryColors[doc.category] || "bg-gray-100 text-gray-600")}>
                    {doc.category}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleDownload(doc)}
                      className="p-1.5 hover:bg-blue-50 rounded text-gray-400 hover:text-blue-600"
                    >
                      <Download size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(doc)}
                      className="p-1.5 hover:bg-red-50 rounded text-gray-400 hover:text-red-500"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Stats footer */}
      {!loading && docs.length > 0 && (
        <p className="text-xs text-gray-400 mt-3 px-1">
          {filtered.length} of {docs.length} document{docs.length !== 1 ? "s" : ""} · {formatSize(docs.reduce((s, d) => s + (d.file_size || 0), 0))} total
        </p>
      )}
    </div>
  )
}
