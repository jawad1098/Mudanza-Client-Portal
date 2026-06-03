import { supabase } from "./supabase"
import type { Task } from "@/types"

export async function fetchTasksFromDB(): Promise<Task[]> {
  const { data, error } = await supabase
    .from("portal_tasks")
    .select("*")
    .order("date", { ascending: true })

  if (error) {
    console.error("Failed to fetch tasks:", error.message)
    return []
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    category: row.category,
    week: row.week,
    date: row.date,
    status: row.status,
  })) as Task[]
}

export async function upsertTaskToDB(task: Task): Promise<void> {
  const { error } = await supabase.from("portal_tasks").upsert({
    id: task.id,
    name: task.name,
    category: task.category,
    week: task.week,
    date: task.date,
    status: task.status,
  })
  if (error) console.error("Failed to upsert task:", error.message)
}

export async function upsertTasksToDB(tasks: Task[]): Promise<void> {
  const { error } = await supabase.from("portal_tasks").upsert(
    tasks.map((t) => ({
      id: t.id,
      name: t.name,
      category: t.category,
      week: t.week,
      date: t.date,
      status: t.status,
    }))
  )
  if (error) console.error("Failed to upsert tasks:", error.message)
}

export async function deleteTaskFromDB(id: string): Promise<void> {
  const { error } = await supabase.from("portal_tasks").delete().eq("id", id)
  if (error) console.error("Failed to delete task:", error.message)
}
