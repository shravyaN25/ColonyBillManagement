"use client"

import { useState } from "react"
import { Logo } from "@/components/logo"
import { DashboardNav } from "@/components/dashboard-nav"
import { ResidentsPanel } from "@/components/residents-panel"
import { BillingPanel } from "@/components/billing-panel"
import { SentBillsPanel } from "@/components/sent-bills-panel"
import { LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { Toaster } from "@/components/ui/toaster"
import { toast } from "@/components/ui/use-toast"
import { useNotification } from "@/components/notification-provider"

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("residents")
  const router = useRouter()
  const { showNotification } = useNotification()

  const handleLogout = () => {
    // In a real app, you would clear session/auth state here
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
      variant: "default",
    })

    // Show our custom notification
    showNotification("You have been successfully logged out.", "info")

    // Force a hard redirect to ensure complete logout
    window.location.href = "/"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex flex-col">
      <header className="w-full p-4 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Logo />
          <Button variant="ghost" className="flex items-center gap-2 text-gray-600" onClick={handleLogout}>
            <span>Logout</span>
            <LogOut size={16} />
          </Button>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
          <p className="text-gray-600">Manage residents, generate bills, and track sent bills</p>
        </div>

        <DashboardNav activeTab={activeTab} setActiveTab={setActiveTab} />

        <div className="mt-6">
          {activeTab === "residents" && <ResidentsPanel />}
          {activeTab === "billing" && <BillingPanel />}
          {activeTab === "reports" && <SentBillsPanel />}
        </div>
      </main>

      <footer className="p-4 text-center text-sm text-gray-500">
        <p>Made with ❤️ by Shravya N</p>
      </footer>

      <Toaster />
    </div>
  )
}

