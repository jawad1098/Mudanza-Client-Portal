"use client"
import { usePortalStore } from "@/store/portalStore"
import { WelcomeBanner } from "@/components/overview/WelcomeBanner"
import { StatCard } from "@/components/overview/StatCard"
import { ActivityFeed } from "@/components/overview/ActivityFeed"
import { getWeekOfMonth } from "date-fns"

export default function OverviewPage() {
  const needs = usePortalStore((s) => s.needs)
  const tasks = usePortalStore((s) => s.tasks)
  const services = usePortalStore((s) => s.services)

  const activeServices = services.filter((s) => s.status === "active").length
  const unmetNeeds = needs.filter((n) => !n.done).length
  const doneTasks = tasks.filter((t) => t.status === "done").length
  const weekNum = getWeekOfMonth(new Date())

  return (
    <div className="space-y-6">
      <WelcomeBanner />

      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Services Running" value={activeServices} sub="Active services" />
        <StatCard label="Awaiting Input" value={unmetNeeds} sub="Items need attention" />
        <StatCard label="Tasks Completed" value={doneTasks} sub={`of ${tasks.length} total`} />
        <StatCard label="Current Sprint" value={`Week ${weekNum}`} sub="of the month" />
      </div>

      <ActivityFeed />
    </div>
  )
}
