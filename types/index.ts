export type TaskStatus = "pending" | "done"
export type TaskCategory = "SEO" | "GMB" | "Social" | "Blog" | "Technical" | "Analytics" | "Other"
export type TaskWeek = "W1" | "W2" | "W3" | "W4"
export type NeedPriority = "urgent" | "high" | "normal"
export type LeadStatus = "New" | "Contacted" | "Quoted" | "Booked" | "Lost"
export type ContentColumn = "drafted" | "approval" | "published"
export type ContentType = "Blog Post" | "Instagram Caption" | "Facebook Post" | "GMB Post" | "Email" | "Other"

export interface Task {
  id: string
  name: string
  category: TaskCategory
  week: TaskWeek
  date: string
  status: TaskStatus
}

export interface NeedItem {
  id: string
  icon: string
  title: string
  description: string
  priority: NeedPriority
  blockingLabel: string
  howTo: string
  done: boolean
}

export interface ActivityItem {
  id: string
  text: string
  time: string
  color: "green" | "blue" | "violet" | "amber" | "rose" | "teal"
}

export interface Service {
  id: string
  icon: string
  name: string
  description: string
  status: "active" | "waiting" | "review"
  statusLabel: string
  progress: number
}

export interface Lead {
  id: string
  date: string
  customerName: string
  phone?: string
  email?: string
  moveDistance?: string
  serviceLevel?: string
  moveSize: string
  from: string
  to: string
  loadingDate?: string
  loadingTime?: string
  estimatedValue: number
  status: LeadStatus
}

export interface Analytics {
  gbpImpressions: number
  phoneCalls: number
  directionRequests: number
  gbpRating: number
  websiteTraffic: { month: string; visits: number }[]
  keywordRankings: { keyword: string; position: number }[]
  callsByMonth: number[]
}

export interface ContentItem {
  id: string
  title: string
  description: string
  type: ContentType
  column: ContentColumn
  date: string
  approved: boolean
}
