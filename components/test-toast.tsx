"use client"

import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"

export function TestToast() {
  return (
    <Button
      onClick={() => {
        toast({
          title: "Toast Test",
          description: "This is a test toast message",
        })
      }}
      variant="outline"
      size="sm"
      className="mt-2"
    >
      Test Toast
    </Button>
  )
}

