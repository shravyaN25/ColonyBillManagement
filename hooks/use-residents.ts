"use client"

import { useState, useEffect, useCallback } from "react"
import type { Resident, ResidentInput } from "@/types/resident"
import { toast } from "@/components/ui/use-toast"

export function useResidents() {
  const [residents, setResidents] = useState<Resident[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastApiResponse, setLastApiResponse] = useState<any>(null)

  // Fetch residents from API
  const fetchResidents = useCallback(async () => {
    console.log("Fetching residents...")
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/residents")

      // Check if response is ok before trying to parse JSON
      if (!response.ok) {
        let errorMessage = `Failed to fetch residents: ${response.status} ${response.statusText}`
        let responseData = {}

        try {
          responseData = await response.json()
          if (responseData && responseData.error) {
            errorMessage = responseData.error
          }
        } catch (jsonError) {
          console.error("Error parsing JSON response:", jsonError)
          // Continue with the default error message
        }

        console.error("Error response from API:", responseData)
        throw new Error(errorMessage)
      }

      // If response is ok, parse the JSON
      const responseData = await response.json()
      setLastApiResponse(responseData)

      console.log(`Fetched ${responseData.length} residents`)
      setResidents(responseData)
    } catch (err) {
      console.error("Error fetching residents:", err)
      setError(err instanceof Error ? err.message : "An unknown error occurred")
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to load residents",
        variant: "destructive",
      })

      // Set empty array to avoid undefined errors
      setResidents([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Load residents on initial render
  useEffect(() => {
    fetchResidents()
  }, [fetchResidents])

  // Add a new resident
  const addResident = async (resident: ResidentInput) => {
    console.log("Adding resident:", resident)
    try {
      const response = await fetch("/api/residents", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(resident),
      })

      let responseData
      try {
        responseData = await response.json()
      } catch (e) {
        responseData = { error: "Invalid response from server" }
      }

      setLastApiResponse(responseData)

      if (!response.ok) {
        console.error("Error response from API:", responseData)
        throw new Error(responseData.error || "Failed to add resident")
      }

      console.log("Resident added successfully:", responseData)
      setResidents((prev) => [...prev, responseData])

      toast({
        title: "Success",
        description: `Resident ${responseData.name} has been added`,
      })

      return responseData
    } catch (err) {
      console.error("Error adding resident:", err)
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to add resident",
        variant: "destructive",
      })
      throw err
    }
  }

  // Update an existing resident
  const updateResident = async (id: string, updates: Partial<ResidentInput>) => {
    console.log("Updating resident:", id, updates)
    try {
      const resident = residents.find((r) => r.id === id)

      if (!resident) {
        throw new Error("Resident not found")
      }

      const updatedData = {
        name: updates.name ?? resident.name,
        flatNumber: updates.flatNumber ?? resident.flatNumber,
        email: updates.email ?? resident.email,
        phone: updates.phone ?? resident.phone,
      }

      const response = await fetch(`/api/residents/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedData),
      })

      let responseData
      try {
        responseData = await response.json()
      } catch (e) {
        responseData = { error: "Invalid response from server" }
      }

      setLastApiResponse(responseData)

      if (!response.ok) {
        console.error("Error response from API:", responseData)
        throw new Error(responseData.error || "Failed to update resident")
      }

      console.log("Resident updated successfully:", responseData)
      setResidents((prev) => prev.map((resident) => (resident.id === id ? { ...resident, ...responseData } : resident)))

      toast({
        title: "Success",
        description: `Resident ${responseData.name} has been updated`,
      })
    } catch (err) {
      console.error("Error updating resident:", err)
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to update resident",
        variant: "destructive",
      })
      throw err
    }
  }

  // Delete a resident
  const deleteResident = async (id: string, forceDelete = false) => {
    console.log("Deleting resident:", id, forceDelete ? "(with force delete)" : "")
    try {
      // Find the resident in the current state to have a reference even if the API call fails
      const residentToDelete = residents.find((r) => r.id === id)
      if (!residentToDelete) {
        throw new Error("Resident not found in local state")
      }

      const url = forceDelete ? `/api/residents/${id}?force=true` : `/api/residents/${id}`
      console.log(`Sending DELETE request to ${url}`)

      const response = await fetch(url, {
        method: "DELETE",
      })

      console.log(`DELETE response status: ${response.status} ${response.statusText}`)

      let responseData
      try {
        const text = await response.text()
        console.log(`Response text: ${text.substring(0, 200)}${text.length > 200 ? "..." : ""}`)

        // Only try to parse as JSON if there's actual content
        if (text.trim()) {
          responseData = JSON.parse(text)
        } else {
          responseData = { error: "Empty response from server" }
        }
      } catch (parseError) {
        console.error("Error parsing response:", parseError)
        responseData = {
          error: "Invalid response from server",
          parseError: parseError instanceof Error ? parseError.message : String(parseError),
        }
      }

      setLastApiResponse(responseData || {})

      // If we get a 409 (Conflict) and it has bills, return a special response instead of throwing
      if (response.status === 409 && responseData && responseData.hasBills) {
        return {
          success: false,
          hasBills: true,
          billCount: responseData.billCount || 0,
          message: responseData.error || "Cannot delete resident with associated bills",
          resident: residentToDelete,
        }
      }

      if (!response.ok) {
        console.error("Error response from API:", responseData || {})
        throw new Error(
          responseData && responseData.error ? responseData.error : `Failed to delete resident (${response.status})`,
        )
      }

      console.log("Resident deleted successfully:", id)
      setResidents((prev) => prev.filter((resident) => resident.id !== id))

      // Show different toast based on whether bills were deleted
      if (forceDelete && responseData && responseData.billsDeleted > 0) {
        toast({
          title: "Success",
          description: `${residentToDelete.name} has been deleted along with ${responseData.billsDeleted} associated bill(s)`,
        })
      } else {
        toast({
          title: "Success",
          description: `${residentToDelete.name} has been deleted`,
        })
      }

      return { success: true, id, ...responseData }
    } catch (err) {
      console.error("Error deleting resident:", err)

      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to delete resident",
        variant: "destructive",
      })
      throw err
    }
  }

  // Test MongoDB connection
  const testMongoDBConnection = async () => {
    try {
      const response = await fetch("/api/test-mongodb")
      const result = await response.json()
      return result
    } catch (error) {
      console.error("Error testing MongoDB connection:", error)
      return { success: false, error: error.message }
    }
  }

  return {
    residents,
    isLoading,
    error,
    addResident,
    updateResident,
    deleteResident,
    refreshResidents: fetchResidents,
    testMongoDBConnection,
    lastApiResponse,
  }
}

