"use client"

import { useToast } from "@/context/ToastContext"
import { CheckCircle, AlertCircle, Info } from "lucide-react"
import { useState, useEffect } from "react"

const icons = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
}

const styles = {
  success: "border-primary/30 bg-primary/10 text-primary",
  error: "border-negative/30 bg-negative-bg text-white",
  info: "border-primary/20 bg-surface-card text-canvas-soft",
}

export default function Toaster() {
  const { toasts } = useToast()

  return (
    <div className="fixed bottom-6 right-6 z-[200] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} />
      ))}
    </div>
  )
}

function ToastItem({ toast }: { toast: { id: string; message: string; type: "success" | "error" | "info" } }) {
  const [visible, setVisible] = useState(false)
  const Icon = icons[toast.type]

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true))
    const timer = setTimeout(() => setVisible(false), 3500)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div
      className={`pointer-events-auto flex items-start gap-3 rounded-xl border px-4 py-3 shadow-lg backdrop-blur-md transition-all duration-300 ${
        styles[toast.type]
      } ${visible ? "translate-x-0 opacity-100" : "translate-x-8 opacity-0"}`}
    >
      <Icon className="w-5 h-5 shrink-0 mt-0.5" />
      <p className="text-sm leading-relaxed flex-1">{toast.message}</p>
    </div>
  )
}
