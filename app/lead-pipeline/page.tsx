"use client"
import { useState, useMemo, useEffect, useCallback } from "react"
import { Plus, Trash2, Search, TrendingUp, Download } from "lucide-react"
import { cn } from "@/lib/utils"
import { usePortalStore } from "@/store/portalStore"
import { PageHeader } from "@/components/layout/PageHeader"
import { LeadStatCards } from "@/components/leads/LeadStatCards"
import { AddLeadModal } from "@/components/leads/AddLeadModal"
import { fetchLeadsFromDB, deleteLeadFromDB, updateLeadStatusInDB, upsertLeadToDB } from "@/lib/leadSync"
import type { Lead, LeadStatus } from "@/types"

const statusColors: Record<LeadStatus, string> = {
  New: "bg-blue-50 text-blue-700",
  Contacted: "bg-violet-50 text-violet-700",
  Quoted: "bg-amber-50 text-amber-700",
  Booked: "bg-green-50 text-green-700",
  Lost: "bg-red-50 text-red-700",
}

const STATUSES: LeadStatus[] = ["New", "Contacted", "Quoted", "Booked", "Lost"]

function exportToCSV(leads: Lead[]) {
  const headers = ["Date", "Customer Name", "Phone", "Email", "Move Distance", "Service Level", "Move Size", "From", "To", "Loading Date", "Loading Time", "Est. Value", "Status"]
  const rows = leads.map((l) => [
    l.date, l.customerName, l.phone ?? "", l.email ?? "",
    l.moveDistance ?? "", l.serviceLevel ?? "", l.moveSize,
    l.from, l.to, l.loadingDate ?? "", l.loadingTime ?? "",
    l.estimatedValue, l.status,
  ])
  const csv = [headers, ...rows].map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n")
  const blob = new Blob([csv], { type: "text/csv" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `mudanza-leads-${new Date().toISOString().split("T")[0]}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export default function LeadPipelinePage() {
  const leads = usePortalStore((s) => s.leads)
  const setLeadsFromDB = usePortalStore((s) => s.setLeadsFromDB)
  const deleteLead = usePortalStore((s) => s.deleteLead)
  const isAdmin = usePortalStore((s) => s.isAdminMode)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")
  const [showAdd, setShowAdd] = useState(false)
  const [loading, setLoading] = useState(true)

  const loadLeads = useCallback(async () => {
    setLoading(true)
    const dbLeads = await fetchLeadsFromDB()
    if (dbLeads.length > 0) setLeadsFromDB(dbLeads)
    setLoading(false)
  }, [setLeadsFromDB])

  useEffect(() => { loadLeads() }, [loadLeads])

  const filtered = useMemo(() =>
    leads.filter((l) => {
      const q = search.toLowerCase()
      const matchSearch = l.customerName.toLowerCase().includes(q) ||
        (l.phone ?? "").includes(q) ||
        (l.email ?? "").toLowerCase().includes(q) ||
        l.from.toLowerCase().includes(q) ||
        l.to.toLowerCase().includes(q)
      const matchStatus = statusFilter === "All" || l.status === statusFilter
      return matchSearch && matchStatus
    }), [leads, search, statusFilter])

  const handleDelete = async (id: string) => {
    deleteLead(id)
    await deleteLeadFromDB(id)
  }

  const handleStatusChange = async (lead: Lead, newStatus: LeadStatus) => {
    usePortalStore.getState().updateLead(lead.id, { status: newStatus })
    await updateLeadStatusInDB(lead.id, newStatus)
  }

  const handleAddLead = async (lead: Lead) => {
    await upsertLeadToDB(lead)
    await loadLeads()
  }

  return (
    <div>
      <PageHeader
        title="Lead Pipeline"
        description="Track incoming moving leads and their status"
        action={
          <div className="flex items-center gap-2">
            <button
              onClick={() => exportToCSV(filtered)}
              className="flex items-center gap-2 text-sm border border-gray-200 text-gray-600 px-3 py-2 rounded-lg hover:bg-gray-50"
            >
              <Download size={14} /> Export CSV
            </button>
            <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 text-sm bg-blue-700 text-white px-4 py-2 rounded-lg hover:bg-blue-800">
              <Plus size={14} /> Add Lead
            </button>
          </div>
        }
      />

      <LeadStatCards />

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, phone, email..."
            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="All">All Statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-x-auto">
        {loading ? (
          <div className="py-16 text-center">
            <div className="inline-block w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-gray-400 mt-2">Loading leads…</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-xs text-gray-400">
                <th className="text-left py-3 px-4 font-medium">Date</th>
                <th className="text-left py-3 px-4 font-medium">Customer</th>
                <th className="text-left py-3 px-4 font-medium">Phone</th>
                <th className="text-left py-3 px-4 font-medium">Service</th>
                <th className="text-left py-3 px-4 font-medium">Move Size</th>
                <th className="text-left py-3 px-4 font-medium">Route</th>
                <th className="text-left py-3 px-4 font-medium">Est. Value</th>
                <th className="text-left py-3 px-4 font-medium">Status</th>
                <th className="w-10" />
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-2 text-gray-400">
                      <TrendingUp size={24} className="text-gray-300" />
                      <p className="font-medium text-gray-600">No leads found</p>
                      <p className="text-xs">Leads from your website form will appear here automatically</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((lead) => (
                  <tr key={lead.id} className="border-b border-gray-50 hover:bg-gray-50 group">
                    <td className="py-3 px-4 text-gray-500 whitespace-nowrap">{lead.date}</td>
                    <td className="py-3 px-4">
                      <p className="font-medium text-gray-900">{lead.customerName}</p>
                      {lead.email && <p className="text-xs text-gray-400">{lead.email}</p>}
                    </td>
                    <td className="py-3 px-4 text-gray-600">{lead.phone ?? "—"}</td>
                    <td className="py-3 px-4 text-gray-500 text-xs">
                      <p>{lead.moveDistance ?? "—"}</p>
                      <p className="text-gray-400">{lead.serviceLevel ?? ""}</p>
                    </td>
                    <td className="py-3 px-4 text-gray-600">{lead.moveSize || "—"}</td>
                    <td className="py-3 px-4 text-gray-500 text-xs">
                      <p>{lead.from}</p>
                      <p className="text-gray-400">→ {lead.to}</p>
                    </td>
                    <td className="py-3 px-4">
                      <span className="bg-green-50 text-green-700 font-medium px-2 py-0.5 rounded-full text-xs">
                        ${lead.estimatedValue.toLocaleString()}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {isAdmin ? (
                        <select
                          value={lead.status}
                          onChange={(e) => handleStatusChange(lead, e.target.value as LeadStatus)}
                          className={cn("text-xs font-medium px-2 py-0.5 rounded-full border-0 cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-400", statusColors[lead.status])}
                        >
                          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                      ) : (
                        <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full", statusColors[lead.status])}>
                          {lead.status}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {isAdmin && (
                        <button onClick={() => handleDelete(lead.id)} className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-50 rounded text-gray-300 hover:text-red-500">
                          <Trash2 size={14} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      <AddLeadModal isOpen={showAdd} onClose={() => setShowAdd(false)} onSaved={handleAddLead} />
    </div>
  )
}
