"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ShieldAlert } from 'lucide-react'

export default function UnauthorizedPage() {
  const router = useRouter()

  const handleHomeClick = () => {
    // Use router.push for client-side navigation
    router.push("/")
    
    // As a fallback, also use window.location for a hard redirect
    setTimeout(() => {
      window.location.href = "/"
    }, 100)
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="w-full max-w-md space-y-6 text-center">
        <div className="mx-auto w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
          <ShieldAlert className="h-8 w-8 text-red-600" />
        </div>
        
        <h1 className="text-3xl font-bold text-gray-800">BUSTED! 🕵️‍♂️</h1>
        
        <p className="text-gray-600">
          Our security system just caught you red-handed! Your hacking skills need serious work... have you tried "admin" and "password123"? Oh wait, that won't work either! 😂
        </p>
        
        <Button 
          onClick={handleHomeClick}
          className="mt-6 w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all"
        >
          Escape Plan B →
        </Button>
      </div>
      
      <footer className="fixed bottom-4 text-center text-sm text-gray-500">
        <p>Made with ❤️ by Shravya N</p>
      </footer>
    </div>
  )
}
