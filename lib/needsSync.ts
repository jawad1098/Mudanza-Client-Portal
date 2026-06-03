import { supabase } from "./supabase"
import type { NeedItem } from "@/types"

export async function fetchNeedsFromDB(): Promise<NeedItem[]> {
  const { data, error } = await supabase
    .from("portal_needs")
    .select("*")
    .order("created_at", { ascending: true })

  if (error) { console.error("[needsSync] fetch failed:", error.message); return [] }

  return (data ?? []).map((row) => ({
    id: row.id,
    icon: row.icon,
    title: row.title,
    description: row.description,
    priority: row.priority,
    blockingLabel: row.blocking_label,
    howTo: row.how_to,
    done: row.done,
  })) as NeedItem[]
}

export async function upsertNeedToDB(need: NeedItem): Promise<void> {
  const { error } = await supabase.from("portal_needs").upsert({
    id: need.id,
    icon: need.icon,
    title: need.title,
    description: need.description,
    priority: need.priority,
    blocking_label: need.blockingLabel,
    how_to: need.howTo,
    done: need.done,
  })
  if (error) console.error("[needsSync] upsert failed:", error.message)
}

export async function upsertNeedsToDB(needs: NeedItem[]): Promise<void> {
  const { error } = await supabase.from("portal_needs").upsert(
    needs.map((n) => ({
      id: n.id, icon: n.icon, title: n.title, description: n.description,
      priority: n.priority, blocking_label: n.blockingLabel, how_to: n.howTo, done: n.done,
    }))
  )
  if (error) console.error("[needsSync] bulk upsert failed:", error.message)
}

export async function deleteNeedFromDB(id: string): Promise<void> {
  const { error } = await supabase.from("portal_needs").delete().eq("id", id)
  if (error) console.error("[needsSync] delete failed:", error.message)
}
