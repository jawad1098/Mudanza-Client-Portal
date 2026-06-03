import { PageHeader } from "@/components/layout/PageHeader"
import { ProfileCard } from "@/components/contact/ProfileCard"
import { WorkingHours } from "@/components/contact/WorkingHours"

export default function ContactPage() {
  return (
    <div>
      <PageHeader title="Contact & Hours" description="Get in touch with Jawad" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl">
        <ProfileCard />
        <WorkingHours />
      </div>
    </div>
  )
}
