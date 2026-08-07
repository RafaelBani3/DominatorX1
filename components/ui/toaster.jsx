"use client"

import { useToast } from "@/hooks/use-toast"
import { X } from "lucide-react"

export function Toaster() {
  const { toasts, dismiss } = useToast()

  return (
    <div className="fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse gap-2 p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px] pointer-events-none">
      {toasts.map(function ({ id, title, description, action, variant }) {
        return (
          <div 
            key={id} 
            className={`pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-xl border p-5 shadow-lg transition-all ${
              variant === 'destructive' 
                ? 'border-destructive bg-destructive text-destructive-foreground' 
                : 'bg-background border-border text-foreground'
            }`}
          >
            <div className="grid gap-1">
              {title && <div className="text-md font-bold">{title}</div>}
              {description && <div className="text-sm opacity-90">{description}</div>}
            </div>
            {action}
            <button 
              onClick={() => dismiss(id)}
              className="absolute right-2 top-2 rounded-md p-1 opacity-70 transition-opacity hover:opacity-100 focus:outline-none"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )
      })}
    </div>
  )
}
