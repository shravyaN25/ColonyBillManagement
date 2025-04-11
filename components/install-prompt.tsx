"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Download, X } from "lucide-react"

export function InstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true)
      return
    }

    // Listen for the beforeinstallprompt event
    window.addEventListener("beforeinstallprompt", (e) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault()
      // Stash the event so it can be triggered later
      setDeferredPrompt(e)
      // Show our custom install prompt
      setShowPrompt(true)
    })

    // Listen for app installed event
    window.addEventListener("appinstalled", () => {
      setIsInstalled(true)
      setShowPrompt(false)
    })
  }, [])

  const handleInstallClick = () => {
    if (!deferredPrompt) return

    // Show the install prompt
    deferredPrompt.prompt()

    // Wait for the user to respond to the prompt
    deferredPrompt.userChoice.then((choiceResult: { outcome: string }) => {
      if (choiceResult.outcome === "accepted") {
        console.log("User accepted the install prompt")
      } else {
        console.log("User dismissed the install prompt")
      }
      // Clear the saved prompt since it can't be used again
      setDeferredPrompt(null)
      setShowPrompt(false)
    })
  }

  if (!showPrompt || isInstalled) return null

  return (
    <Card className="fixed bottom-4 right-4 z-50 max-w-sm shadow-lg">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Install App</CardTitle>
          <Button variant="ghost" size="icon" onClick={() => setShowPrompt(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <CardDescription>Add Annapurna Badavane to your home screen for quick access</CardDescription>
      </CardHeader>
      <CardContent className="pb-2">
        <p className="text-sm text-muted-foreground">
          Install this application on your device to access it like a regular app with improved performance and offline
          functionality.
        </p>
      </CardContent>
      <CardFooter>
        <Button onClick={handleInstallClick} className="w-full">
          <Download className="mr-2 h-4 w-4" /> Install Now
        </Button>
      </CardFooter>
    </Card>
  )
}
