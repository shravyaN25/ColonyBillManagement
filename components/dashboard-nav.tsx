"use client"

import { Users, FileText, Send } from "lucide-react"

interface DashboardNavProps {
  activeTab: string
  setActiveTab: (tab: string) => void
}

export function DashboardNav({ activeTab, setActiveTab }: DashboardNavProps) {
  const tabs = [
    {
      id: "residents",
      label: "Residents",
      icon: Users,
    },
    {
      id: "billing",
      label: "Generate Bills",
      icon: FileText,
    },
    {
      id: "reports",
      label: "Sent Bills",
      icon: Send,
    },
  ]

  return (
    <div className="bg-white rounded-lg shadow-md p-2 flex">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`flex items-center gap-2 px-4 py-3 rounded-md flex-1 transition-all ${
            activeTab === tab.id
              ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
              : "hover:bg-gray-100 text-gray-700"
          }`}
        >
          <tab.icon size={20} />
          <span className="font-medium">{tab.label}</span>
        </button>
      ))}
    </div>
  )
}

