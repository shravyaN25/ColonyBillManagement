import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { PWARegister } from "@/components/pwa-register"
import { Toaster } from "@/components/ui/toaster"
import { NotificationProvider } from "@/components/providers/notification-provider"

const inter = Inter({ subsets: ["latin"] })

// Update the metadata object to include PWA-related metadata
export const metadata: Metadata = {
  title: "Annapurna Badavane Association",
  description: "Monthly maintenance bill generating portal",
  generator: "v0.dev",
  manifest: "/manifest.json",
  themeColor: "#3b82f6",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Annapurna Badavane",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
  },
}

// Add the PWARegister component to the body
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head />
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <NotificationProvider>
            <PWARegister />
            {children}
            <Toaster />
          </NotificationProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

