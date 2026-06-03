export const CONFIG = {
  freelancer: {
    name: "Jawad",
    title: "Digital Marketing & Web Services Freelancer",
    whatsapp: "923159782971",
    email: "mjawadofficial46@gmail.com",
    whatsappResponseTime: "Within 1 hr",
    emailResponseTime: "Within 4 hrs",
    skills: ["Web Management", "Google Business", "Social Media", "SEO", "Blog Writing"],
  },
  client: {
    name: "Gabriel",
    fullName: "Gabriel Gonzalez",
    company: "Mudanza Moving Services",
    initials: "GG",
  },
  booking: {
    availableSlots: [
      { time: "9:00 AM", duration: "30 min" },
      { time: "10:00 AM", duration: "30 min" },
      { time: "11:00 AM", duration: "45 min" },
      { time: "2:00 PM", duration: "30 min" },
      { time: "3:00 PM", duration: "45 min" },
      { time: "4:00 PM", duration: "30 min" },
    ],
    bookedDates: {
      "2026-06-03": ["10:00 AM"],
      "2026-06-10": ["11:00 AM", "3:00 PM"],
    } as Record<string, string[]>,
    whatsappTemplate: "Hi Jawad! I'd like to book a {type} call.\n\n📅 Date: {date}\n🕐 Time: {time}\n\nPlease confirm!",
  },
  workingHours: [
    { day: "Monday", open: "9:00 AM", close: "6:00 PM" },
    { day: "Tuesday", open: "9:00 AM", close: "6:00 PM" },
    { day: "Wednesday", open: "9:00 AM", close: "6:00 PM" },
    { day: "Thursday", open: "9:00 AM", close: "6:00 PM" },
    { day: "Friday", open: "9:00 AM", close: "4:00 PM" },
    { day: "Saturday", open: null, close: null },
    { day: "Sunday", open: null, close: null },
  ],
}
