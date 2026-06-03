import { supabase } from "./supabase"
import { nanoid } from "nanoid"
import type { Lead } from "@/types"

export async function fetchLeadsFromDB(): Promise<Lead[]> {
  const { data, error } = await supabase
    .from("portal_leads")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("[leadSync] fetch failed:", error.message)
    return []
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    date: row.date ?? "",
    customerName: row.customer_name,
    phone: row.phone ?? "",
    email: row.email ?? "",
    moveDistance: row.move_distance ?? "",
    serviceLevel: row.service_level ?? "",
    moveSize: row.move_size ?? "",
    from: row.from_address ?? "",
    to: row.to_address ?? "",
    loadingDate: row.loading_date ?? "",
    loadingTime: row.loading_time ?? "",
    estimatedValue: Number(row.estimated_value) || 0,
    status: row.status ?? "New",
  })) as Lead[]
}

export async function upsertLeadToDB(lead: Lead): Promise<void> {
  const { error } = await supabase.from("portal_leads").upsert({
    id: lead.id,
    date: lead.date,
    customer_name: lead.customerName,
    phone: lead.phone ?? "",
    email: lead.email ?? "",
    move_distance: lead.moveDistance ?? "",
    service_level: lead.serviceLevel ?? "",
    move_size: lead.moveSize,
    from_address: lead.from,
    to_address: lead.to,
    loading_date: lead.loadingDate ?? "",
    loading_time: lead.loadingTime ?? "",
    estimated_value: lead.estimatedValue,
    status: lead.status,
  })
  if (error) console.error("[leadSync] upsert failed:", error.message)
}

export async function deleteLeadFromDB(id: string): Promise<void> {
  const { error } = await supabase.from("portal_leads").delete().eq("id", id)
  if (error) console.error("[leadSync] delete failed:", error.message)
}

export async function updateLeadStatusInDB(id: string, status: string): Promise<void> {
  const { error } = await supabase.from("portal_leads").update({ status }).eq("id", id)
  if (error) console.error("[leadSync] status update failed:", error.message)
}

export async function insertLeadFromForm(data: Record<string, string>): Promise<{ id: string } | null> {
  const id = nanoid()
  const today = new Date().toISOString().split("T")[0]

  const totalRaw = (data["Calculated_Total"] ?? "").replace(/[^0-9.]/g, "")
  const estimatedValue = parseFloat(totalRaw) || 0

  const { error } = await supabase.from("portal_leads").insert({
    id,
    date: today,
    customer_name: data["Client_Name"] ?? "",
    phone: data["Client_Phone"] ?? "",
    email: data["Client_Email"] ?? "",
    move_distance: data["Move_Distance"] ?? "",
    service_level: data["Service_Level"] ?? "",
    move_size: data["Move_Size"] ?? "",
    from_address: data["Loading_Address"] ?? "",
    to_address: data["Unloading_Address"] ?? "",
    loading_date: data["Loading_Date"] ?? "",
    loading_time: data["Loading_Time"] ?? "",
    estimated_value: estimatedValue,
    status: "New",
  })

  if (error) {
    console.error("[leadSync] form insert failed:", error.message)
    return null
  }
  return { id }
}
