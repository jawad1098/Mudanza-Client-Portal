"use client"
import { Modal } from "@/components/ui/Modal"

interface HowToModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  howTo: string
}

export function HowToModal({ isOpen, onClose, title, howTo }: HowToModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`How to: ${title}`}>
      <pre className="whitespace-pre-wrap text-sm text-gray-600 font-sans leading-relaxed">{howTo}</pre>
    </Modal>
  )
}
