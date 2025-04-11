import type React from "react"
import { NotificationProvider } from "@/components/notification-provider"
import { Toaster } from "@/components/ui/toaster"
import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Annapurna Badavane Association",
  description: "Monthly maintenance bill generating portal",
    generator: 'v0.dev'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <NotificationProvider>
          {children}
          <Toaster />
        </NotificationProvider>
      </body>
    </html>
  )
}



import './globals.css'
