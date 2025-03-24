"use client"

import { useState, useEffect } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"

type NotificationType = "success" | "error" | "info"

interface NotificationBannerProps {
  message: string
  type: NotificationType
  duration?: number
  onClose?: () => void
}

export function NotificationBanner({ message, type = "info", duration = 5000, onClose }: NotificationBannerProps) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false)
      if (onClose) onClose()
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onClose])

  if (!visible) return null

  const bgColor =
    type === "success"
      ? "bg-green-100 border-green-500 text-green-800"
      : type === "error"
        ? "bg-red-100 border-red-500 text-red-800"
        : "bg-blue-100 border-blue-500 text-blue-800"

  return (
    <div
      className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md px-4 py-3 rounded-md shadow-md border-l-4 ${bgColor} flex justify-between items-center`}
    >
      <div>{message}</div>
      <Button
        variant="ghost"
        size="sm"
        className="h-6 w-6 p-0 rounded-full"
        onClick={() => {
          setVisible(false)
          if (onClose) onClose()
        }}
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  )
}

