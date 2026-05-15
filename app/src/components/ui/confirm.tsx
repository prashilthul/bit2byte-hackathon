"use client"

import { useState, useCallback, createContext, useContext, type ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"

interface ConfirmOptions {
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: "danger" | "default"
}

interface ConfirmContextType {
  confirm: (options: ConfirmOptions) => Promise<boolean>
}

const ConfirmContext = createContext<ConfirmContextType>({
  confirm: () => Promise.resolve(false),
})

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const [options, setOptions] = useState<ConfirmOptions>({ title: "", message: "" })
  const [resolveRef, setResolveRef] = useState<((value: boolean) => void) | null>(null)

  const confirm = useCallback((opts: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      setOptions(opts)
      setOpen(true)
      setResolveRef(() => resolve)
    })
  }, [])

  const handleConfirm = () => {
    resolveRef?.(true)
    setOpen(false)
  }

  const handleCancel = () => {
    resolveRef?.(false)
    setOpen(false)
  }

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={handleCancel}
          />
          <div className="relative bg-surface-card rounded-2xl border border-primary/5 p-6 max-w-sm w-full shadow-2xl">
            <div className="flex items-start gap-4">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  options.variant === "danger"
                    ? "bg-negative/10 text-negative"
                    : "bg-primary/10 text-primary"
                }`}
              >
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-body-md-strong text-canvas-soft">
                  {options.title}
                </h3>
                <p className="text-body-sm text-canvas-soft/50 mt-1">
                  {options.message}
                </p>
              </div>
            </div>
            <div className="flex gap-3 mt-6 justify-end">
              <Button
                variant="secondary"
                size="sm"
                onClick={handleCancel}
                className="bg-surface-elevated text-canvas-soft hover:bg-surface-card cursor-pointer"
              >
                {options.cancelLabel || "Cancel"}
              </Button>
              <Button
                variant={options.variant === "danger" ? "primary" : "primary"}
                size="sm"
                onClick={handleConfirm}
                className={`cursor-pointer ${
                  options.variant === "danger"
                    ? "bg-negative hover:bg-negative-deep text-white"
                    : ""
                }`}
              >
                {options.confirmLabel || "Confirm"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  )
}

export const useConfirm = () => useContext(ConfirmContext)
