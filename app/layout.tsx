import { redirect } from "next/navigation"
import { checkAuth } from "@/app/actions"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Check authentication on the server
  const { authenticated } = await checkAuth()
  
  // If not authenticated, redirect to login
  if (!authenticated) {
    redirect("/login")
  }
  
  return <>{children}</>
}
