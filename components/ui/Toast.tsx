"use client"
import { createContext, useContext, useState, useCallback } from "react"
import { X, CheckCircle2, AlertCircle, Info } from "lucide-react"
import { cn } from "@/lib/utils"

interface Toast {
  id: string
  message: string
  type: "success" | "error" | "info"
}

interface ToastContextValue {
  showToast: (message: string, type?: Toast["type"]) => void
}

const ToastContext = createContext<ToastContextValue>({ showToast: () => {} })

export function useToast() {
  return useContext(ToastContext)
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const showToast = useCallback((message: string, type: Toast["type"] = "success") => {
    const id = Math.random().toString(36).slice(2)
    setToasts((prev) => [...prev.slice(-2), { id, message, type }])
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3000)
  }, [])

  const dismiss = (id: string) => setToasts((prev) => prev.filter((t) => t.id !== id))

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={cn(
              "bg-white shadow-lg rounded-lg px-4 py-3 flex items-center gap-3 border-l-4 min-w-[280px] animate-in slide-in-from-right-5",
              toast.type === "success" && "border-green-500",
              toast.type === "error" && "border-red-500",
              toast.type === "info" && "border-blue-500"
            )}
          >
            {toast.type === "success" && <CheckCircle2 size={16} className="text-green-500 shrink-0" />}
            {toast.type === "error" && <AlertCircle size={16} className="text-red-500 shrink-0" />}
            {toast.type === "info" && <Info size={16} className="text-blue-500 shrink-0" />}
            <p className="text-sm text-gray-700 flex-1">{toast.message}</p>
            <button onClick={() => dismiss(toast.id)} className="text-gray-400 hover:text-gray-600">
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
