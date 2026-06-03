"use client"
import { useState, useMemo } from "react"
import { Plus, Trash2, Search, TrendingUp } from "lucide-react"
import { cn } from "@/lib/utils"
import { usePortalStore } from "@/store/portalStore"
import { PageHeader } from "@/components/layout/PageHeader"
import { LeadStatCards } from "@/components/leads/LeadStatCards"
import { AddLeadModal } from "@/components/leads/AddLeadModal"
import type { LeadStatus } from "@/types"

const statusColors: Record<LeadStatus, string> = {
  New: "bg-blue-50 text-blue-700",
  Contacted: "bg-violet-50 text-violet-700",
  Quoted: "bg-amber-50 text-amber-700",
  Booked: "bg-green-50 text-green-700",
  Lost: "bg-red-50 text-red-700",
}

export default function LeadPipelinePage() {
  const leads = usePortalStore((s) => s.leads)
  const isAdmin = usePortalStore((s) => s.isAdminMode)
  const deleteLead = usePortalStore((s) => s.deleteLead)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")
  const [showAdd, setShowAdd] = useState(false)

  const filtered = useMemo(() =>
    leads.filter((l) => {
      const matchSearch = l.customerName.toLowerCase().includes(search.toLowerCase()) ||
        l.from.toLowerCase().includes(search.toLowerCase()) ||
        l.to.toLowerCase().includes(search.toLowerCase())
      const matchStatus = statusFilter === "All" || l.status === statusFilter
      return matchSearch && matchStatus
    }), [leads, search, statusFilter])

  return (
    <div>
      <PageHeader
        title="Lead Pipeline"
        description="Track incoming moving leads and their status"
        action={isAdmin ? (
          <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 text-sm bg-blue-700 text-white px-4 py-2 rounded-lg hover:bg-blue-800">
            <Plus size={14} /> Add Lead
          </button>
        ) : null}
      />

      <LeadStatCards />

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search leads..."
            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="All">All Statuses</option>
          {["New", "Contacted", "Quoted", "Booked", "Lost"].map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-xs text-gray-400">
              <th className="text-left py-3 px-4 font-medium">Date</th>
              <th className="text-left py-3 px-4 font-medium">Customer</th>
              <th className="text-left py-3 px-4 font-medium">Move Size</th>
              <th className="text-left py-3 px-4 font-medium">Route</th>
              <th className="text-left py-3 px-4 font-medium">Est. Value</th>
              <th className="text-left py-3 px-4 font-medium">Status</th>
              {isAdmin && <th className="w-10" />}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={isAdmin ? 7 : 6} className="py-16 text-center">
                  <div className="flex flex-col items-center gap-2 text-gray-400">
                    <TrendingUp size={24} className="text-gray-300" />
                    <p className="font-medium text-gray-600">No leads found</p>
                    <p className="text-xs">Try adjusting your filters</p>
                  </div>
                </td>
              </tr>
            ) : (
              filtered.map((lead) => (
                <tr key={lead.id} className="border-b border-gray-50 hover:bg-gray-50 group">
                  <td className="py-3 px-4 text-gray-500">{lead.date}</td>
                  <td className="py-3 px-4 font-medium text-gray-900">{lead.customerName}</td>
                  <td className="py-3 px-4 text-gray-600">{lead.moveSize}</td>
                  <td className="py-3 px-4 text-gray-500">{lead.from} → {lead.to}</td>
                  <td className="py-3 px-4">
                    <span className="bg-green-50 text-green-700 font-medium px-2 py-0.5 rounded-full text-xs">
                      ${lead.estimatedValue.toLocaleString()}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full", statusColors[lead.status])}>
                      {lead.status}
                    </span>
                  </td>
                  {isAdmin && (
                    <td className="py-3 px-4">
                      <button onClick={() => deleteLead(lead.id)} className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-50 rounded text-gray-300 hover:text-red-500">
                        <Trash2 size={14} />
                      </button>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <AddLeadModal isOpen={showAdd} onClose={() => setShowAdd(false)} />
    </div>
  )
}
