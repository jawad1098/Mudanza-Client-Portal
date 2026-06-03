"use client"
import { MessageCircle, Mail } from "lucide-react"
import { CONFIG } from "@/lib/config"

export function ProfileCard() {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      <div className="flex flex-col items-center text-center mb-6">
        <div className="w-16 h-16 rounded-full bg-blue-700 flex items-center justify-center text-white font-bold text-xl mb-4">
          J
        </div>
        <h3 className="font-semibold text-gray-900 text-lg">{CONFIG.freelancer.name}</h3>
        <p className="text-sm text-gray-500 mt-0.5">{CONFIG.freelancer.title}</p>
        <div className="flex flex-wrap justify-center gap-2 mt-4">
          {CONFIG.freelancer.skills.map((skill) => (
            <span key={skill} className="text-xs bg-gray-100 text-gray-600 rounded-full px-3 py-1">{skill}</span>
          ))}
        </div>
      </div>

      <div className="space-y-3 mb-6">
        <a
          href={`https://wa.me/${CONFIG.freelancer.whatsapp}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-lg text-sm font-medium transition-colors"
        >
          <MessageCircle size={16} /> WhatsApp
        </a>
        <a
          href={`mailto:${CONFIG.freelancer.email}`}
          className="flex items-center justify-center gap-2 w-full bg-blue-700 hover:bg-blue-800 text-white py-2.5 rounded-lg text-sm font-medium transition-colors"
        >
          <Mail size={16} /> Email
        </a>
      </div>

      <div className="border-t border-gray-100 pt-4 space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-2 text-gray-500"><MessageCircle size={14} /> WhatsApp</span>
          <span className="text-gray-700 font-medium">{CONFIG.freelancer.whatsappResponseTime}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-2 text-gray-500"><Mail size={14} /> Email</span>
          <span className="text-gray-700 font-medium">{CONFIG.freelancer.emailResponseTime}</span>
        </div>
      </div>
    </div>
  )
}
