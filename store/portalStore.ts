import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import { nanoid } from "nanoid"
import type {
  Task, NeedItem, ActivityItem, Service, Lead, Analytics, ContentItem, ContentColumn,
} from "@/types"
import { CONFIG } from "@/lib/config"

export interface ClientConfig {
  name: string
  fullName: string
  company: string
  initials: string
}

export interface ContactConfig {
  name: string
  title: string
  whatsapp: string
  email: string
  whatsappResponseTime: string
  emailResponseTime: string
  skills: string[]
}

export interface WorkingHourEntry {
  day: string
  open: string | null
  close: string | null
}

// ── Default seed data ─────────────────────────────────────────────────────────
const defaultServices: Service[] = [
  { id: nanoid(), icon: "🌐", name: "Website Management", description: "Full website maintenance and updates", status: "waiting", statusLabel: "Waiting on Credentials", progress: 35 },
  { id: nanoid(), icon: "📍", name: "Google Business Profile", description: "GBP optimization and management", status: "waiting", statusLabel: "Waiting on GMB Access", progress: 20 },
  { id: nanoid(), icon: "📱", name: "Social Media Management", description: "Instagram and Facebook content", status: "active", statusLabel: "In Progress", progress: 60 },
  { id: nanoid(), icon: "🔍", name: "SEO", description: "Search engine optimization", status: "active", statusLabel: "Research Phase", progress: 45 },
  { id: nanoid(), icon: "✍️", name: "Blog Posting", description: "Content writing and publishing", status: "review", statusLabel: "Needs Your Review", progress: 80 },
]

const defaultTasks: Task[] = [
  { id: nanoid(), name: "Keyword research for moving industry", category: "SEO", week: "W1", date: "2026-06-02", status: "done" },
  { id: nanoid(), name: "GBP audit report", category: "GMB", week: "W1", date: "2026-06-03", status: "done" },
  { id: nanoid(), name: "Social media content calendar June", category: "Social", week: "W1", date: "2026-06-04", status: "done" },
  { id: nanoid(), name: "Blog post: Top 5 Tips for a Stress-Free Move", category: "Blog", week: "W2", date: "2026-06-09", status: "done" },
  { id: nanoid(), name: "On-page SEO audit homepage and service pages", category: "SEO", week: "W2", date: "2026-06-10", status: "pending" },
  { id: nanoid(), name: "Set up Google Search Console", category: "Technical", week: "W2", date: "2026-06-11", status: "pending" },
  { id: nanoid(), name: "Design social media templates", category: "Social", week: "W2", date: "2026-06-12", status: "pending" },
  { id: nanoid(), name: "GBP post schedule Week 1", category: "GMB", week: "W3", date: "2026-06-16", status: "pending" },
  { id: nanoid(), name: "Build 5 local citations Yelp BBB etc", category: "SEO", week: "W3", date: "2026-06-17", status: "pending" },
  { id: nanoid(), name: "Website speed audit and recommendations", category: "Technical", week: "W3", date: "2026-06-18", status: "pending" },
  { id: nanoid(), name: "Monthly analytics report", category: "Analytics", week: "W4", date: "2026-06-23", status: "pending" },
  { id: nanoid(), name: "Blog post 2 draft", category: "Blog", week: "W4", date: "2026-06-24", status: "pending" },
]

const defaultNeeds: NeedItem[] = [
  { id: nanoid(), icon: "🗺️", title: "Grant Google Business Profile Access", priority: "urgent", description: "Jawad needs manager access to your Google Business Profile to start GMB optimization and posting.", blockingLabel: "Blocking: SEO & GMB setup", howTo: "1. Go to business.google.com\n2. Click your business\n3. Go to Users in the left menu\n4. Click Add user\n5. Enter mjawadofficial46@gmail.com\n6. Select role: Manager\n7. Click Invite", done: false },
  { id: nanoid(), icon: "🔐", title: "Share Website Credentials", priority: "urgent", description: "Website login credentials are needed to begin web management, speed improvements, and technical SEO.", blockingLabel: "Blocking: Web management & SEO", howTo: "Use the Send Files tab and select Credentials category.\n\nNeeded:\n- Hosting dashboard login (cPanel)\n- WordPress or website builder login", done: false },
  { id: nanoid(), icon: "📲", title: "Share Social Media Access", priority: "high", description: "Admin access to Facebook and Instagram pages is required to begin posting and managing content.", blockingLabel: "Blocking: Social media management", howTo: "Option A: Go to Facebook Business Settings and add mjawadofficial46@gmail.com as Page Admin.\n\nOption B: Use Send Files tab to share credentials securely.", done: false },
  { id: nanoid(), icon: "🎨", title: "Upload Brand Assets", priority: "high", description: "Logo files, brand colors, and photos are needed to create consistent, on-brand content across all channels.", blockingLabel: "Blocking: All content creation", howTo: "Use Send Files tab and select Brand Assets.\n\nNeeded:\n- Logo PNG transparent background\n- Logo SVG vector\n- Brand color codes\n- Team or truck photos", done: false },
  { id: nanoid(), icon: "📝", title: "Review Blog Post Draft", priority: "normal", description: "The first blog post is ready for your review. Approve it so Jawad can publish it to your website.", blockingLabel: "Blocking: Blog launch", howTo: "Jawad will share the draft link via WhatsApp.\n\n1. Read through the full post\n2. Check facts and names are correct\n3. Reply: Approved or list changes\n4. Jawad will publish within 24 hours", done: false },
]

const defaultActivity: ActivityItem[] = [
  { id: nanoid(), text: "<strong>Blog post draft completed</strong> — Top 5 Tips for a Stress-Free Move ready for review.", time: "Today, 9:42 AM", color: "green" },
  { id: nanoid(), text: "<strong>Social media calendar</strong> — June content plan finalized: 12 posts across Instagram and Facebook.", time: "Yesterday, 3:15 PM", color: "blue" },
  { id: nanoid(), text: "<strong>SEO keyword research</strong> — 38 high-intent keywords identified for local moving searches.", time: "May 28, 11:00 AM", color: "violet" },
  { id: nanoid(), text: "<strong>GMB profile audit complete</strong> — 6 optimization opportunities identified.", time: "May 26, 2:30 PM", color: "amber" },
  { id: nanoid(), text: "<strong>Portal launched</strong> — Client portal set up and shared with Gabriel!", time: "May 25, 10:00 AM", color: "teal" },
]

const defaultLeads: Lead[] = [
  { id: nanoid(), date: "2026-05-28", customerName: "Maria Rodriguez", moveSize: "2 Bedroom", from: "Chula Vista CA", to: "San Diego CA", estimatedValue: 650, status: "Booked" },
  { id: nanoid(), date: "2026-05-30", customerName: "James Turner", moveSize: "3 Bedroom", from: "San Diego CA", to: "Los Angeles CA", estimatedValue: 1200, status: "Quoted" },
  { id: nanoid(), date: "2026-06-01", customerName: "Sofia Herrera", moveSize: "Studio", from: "La Jolla CA", to: "Encinitas CA", estimatedValue: 420, status: "New" },
  { id: nanoid(), date: "2026-06-01", customerName: "David Kim", moveSize: "1 Bedroom", from: "National City", to: "Coronado CA", estimatedValue: 580, status: "Contacted" },
  { id: nanoid(), date: "2026-06-02", customerName: "Angela Brooks", moveSize: "4+ Bedroom", from: "Escondido CA", to: "San Diego CA", estimatedValue: 1800, status: "Quoted" },
]

const defaultAnalytics: Analytics = {
  gbpImpressions: 4820, phoneCalls: 67, directionRequests: 134, gbpRating: 4.8,
  websiteTraffic: [
    { month: "Jan", visits: 320 }, { month: "Feb", visits: 410 }, { month: "Mar", visits: 390 },
    { month: "Apr", visits: 520 }, { month: "May", visits: 680 }, { month: "Jun", visits: 750 },
  ],
  keywordRankings: [
    { keyword: "Moving services San Diego", position: 7 },
    { keyword: "Local movers near me", position: 12 },
    { keyword: "Apartment movers San Diego", position: 9 },
    { keyword: "Affordable moving company", position: 15 },
    { keyword: "Furniture movers San Diego", position: 11 },
  ],
  callsByMonth: [28, 35, 42, 51, 58, 67],
}

const defaultContent: ContentItem[] = [
  { id: nanoid(), title: "Top 5 Tips for a Stress-Free Move", description: "Practical moving tips for families relocating in San Diego.", type: "Blog Post", column: "approval", date: "2026-06-02", approved: false },
  { id: nanoid(), title: "Summer Moving Season — Book Early!", description: "Facebook post promoting early booking discounts for summer moves.", type: "Facebook Post", column: "drafted", date: "2026-06-05", approved: false },
  { id: nanoid(), title: "Before and After Office Relocation", description: "Instagram caption for office move transformation photos.", type: "Instagram Caption", column: "drafted", date: "2026-06-07", approved: false },
  { id: nanoid(), title: "Why San Diego Trusts Mudanza Moving", description: "Customer trust and social proof GMB post.", type: "GMB Post", column: "published", date: "2026-05-28", approved: true },
  { id: nanoid(), title: "Moving with Kids: A Survival Guide", description: "Blog post covering tips for families moving with children.", type: "Blog Post", column: "approval", date: "2026-06-10", approved: false },
]

// ── Store interface ───────────────────────────────────────────────────────────
interface PortalStore {
  isAdminMode: boolean
  setAdminMode: (v: boolean) => void
  hasSeeded: boolean
  services: Service[]
  activity: ActivityItem[]
  tasks: Task[]
  needs: NeedItem[]
  leads: Lead[]
  analytics: Analytics
  content: ContentItem[]

  setTasksFromDB: (tasks: Task[]) => void
  addTask: (task: Omit<Task, "id">) => void
  addTasks: (tasks: Omit<Task, "id">[]) => void
  updateTask: (id: string, updates: Partial<Task>) => void
  deleteTask: (id: string) => void
  toggleTaskStatus: (id: string) => void

  addNeed: (need: Omit<NeedItem, "id">) => void
  updateNeed: (id: string, updates: Partial<NeedItem>) => void
  deleteNeed: (id: string) => void
  toggleNeedDone: (id: string) => void

  addActivityItem: (item: Omit<ActivityItem, "id">) => void
  deleteActivityItem: (id: string) => void

  updateService: (id: string, updates: Partial<Service>) => void

  setLeadsFromDB: (leads: Lead[]) => void
  addLead: (lead: Lead) => void
  updateLead: (id: string, updates: Partial<Lead>) => void
  deleteLead: (id: string) => void

  updateAnalytics: (updates: Partial<Analytics>) => void

  addContentItem: (item: Omit<ContentItem, "id">) => void
  moveContentItem: (id: string, column: ContentColumn) => void
  approveContent: (id: string) => void
  deleteContentItem: (id: string) => void

  contactConfig: ContactConfig
  workingHours: WorkingHourEntry[]
  updateContactConfig: (updates: Partial<ContactConfig>) => void
  updateWorkingHour: (day: string, open: string | null, close: string | null) => void

  clientConfig: ClientConfig
  updateClientConfig: (updates: Partial<ClientConfig>) => void
}

// ── Store (localStorage — instant UI, Supabase sync handled separately) ───────
export const usePortalStore = create<PortalStore>()(
  persist(
    (set) => ({
      isAdminMode: false,
      setAdminMode: (v) => set({ isAdminMode: v }),
      hasSeeded: false,
      services: [],
      activity: [],
      tasks: [],
      needs: [],
      leads: [],
      analytics: defaultAnalytics,
      content: [],

      setTasksFromDB: (tasks) => set({ tasks }),
      addTask: (task) => set((s) => ({ tasks: [...s.tasks, { ...task, id: nanoid() }] })),
      addTasks: (tasks) => set((s) => ({ tasks: [...s.tasks, ...tasks.map((t) => ({ ...t, id: nanoid() }))] })),
      updateTask: (id, updates) => set((s) => ({ tasks: s.tasks.map((t) => t.id === id ? { ...t, ...updates } : t) })),
      deleteTask: (id) => set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) })),
      toggleTaskStatus: (id) => set((s) => ({ tasks: s.tasks.map((t) => t.id === id ? { ...t, status: (t.status === "done" ? "pending" : "done") as Task["status"] } : t) })),

      addNeed: (need) => set((s) => ({ needs: [...s.needs, { ...need, id: nanoid() }] })),
      updateNeed: (id, updates) => set((s) => ({ needs: s.needs.map((n) => n.id === id ? { ...n, ...updates } : n) })),
      deleteNeed: (id) => set((s) => ({ needs: s.needs.filter((n) => n.id !== id) })),
      toggleNeedDone: (id) => set((s) => ({ needs: s.needs.map((n) => n.id === id ? { ...n, done: !n.done } : n) })),

      addActivityItem: (item) => set((s) => ({ activity: [{ ...item, id: nanoid() }, ...s.activity] })),
      deleteActivityItem: (id) => set((s) => ({ activity: s.activity.filter((a) => a.id !== id) })),

      updateService: (id, updates) => set((s) => ({ services: s.services.map((sv) => sv.id === id ? { ...sv, ...updates } : sv) })),

      setLeadsFromDB: (leads) => set({ leads }),
      addLead: (lead) => set((s) => ({ leads: [...s.leads, lead] })),
      updateLead: (id, updates) => set((s) => ({ leads: s.leads.map((l) => l.id === id ? { ...l, ...updates } : l) })),
      deleteLead: (id) => set((s) => ({ leads: s.leads.filter((l) => l.id !== id) })),

      updateAnalytics: (updates) => set((s) => ({ analytics: { ...s.analytics, ...updates } })),

      addContentItem: (item) => set((s) => ({ content: [...s.content, { ...item, id: nanoid() }] })),
      moveContentItem: (id, column) => set((s) => ({ content: s.content.map((c) => c.id === id ? { ...c, column } : c) })),
      approveContent: (id) => set((s) => ({ content: s.content.map((c) => c.id === id ? { ...c, approved: true } : c) })),
      deleteContentItem: (id) => set((s) => ({ content: s.content.filter((c) => c.id !== id) })),

      contactConfig: {
        name: CONFIG.freelancer.name,
        title: CONFIG.freelancer.title,
        whatsapp: CONFIG.freelancer.whatsapp,
        email: CONFIG.freelancer.email,
        whatsappResponseTime: CONFIG.freelancer.whatsappResponseTime,
        emailResponseTime: CONFIG.freelancer.emailResponseTime,
        skills: CONFIG.freelancer.skills,
      },
      workingHours: CONFIG.workingHours,
      updateContactConfig: (updates) => set((s) => ({ contactConfig: { ...s.contactConfig, ...updates } })),
      updateWorkingHour: (day, open, close) => set((s) => ({
        workingHours: s.workingHours.map((h) => h.day === day ? { ...h, open, close } : h)
      })),

      clientConfig: {
        name: CONFIG.client.name,
        fullName: CONFIG.client.fullName,
        company: CONFIG.client.company,
        initials: CONFIG.client.initials,
      },
      updateClientConfig: (updates) => set((s) => ({ clientConfig: { ...s.clientConfig, ...updates } })),
    }),
    {
      name: "portal-v1",
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        if (state && !state.hasSeeded) {
          state.services = defaultServices
          state.activity = defaultActivity
          state.tasks = defaultTasks
          state.needs = defaultNeeds
          state.leads = defaultLeads
          state.analytics = defaultAnalytics
          state.content = defaultContent
          state.hasSeeded = true
        }
      },
    }
  )
)
