"use client"

import { useState, useEffect, useCallback } from "react"
import type { SentBill, BillInput } from "@/types/bill"
import { toast } from "@/components/ui/use-toast"

export function useSentBills() {
  const [sentBills, setSentBills] = useState<SentBill[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch bills from API
  const fetchBills = useCallback(async (filters?: Record<string, string>) => {
    setIsLoading(true)
    setError(null)

    try {
      let url = "/api/bills"

      // Add query parameters if filters are provided
      if (filters && Object.keys(filters).length > 0) {
        const params = new URLSearchParams()
        Object.entries(filters).forEach(([key, value]) => {
          if (value) params.append(key, value)
        })
        url += `?${params.toString()}`
      }

      const response = await fetch(url)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to fetch bills")
      }

      const data = await response.json()
      setSentBills(data)
    } catch (err) {
      console.error("Error fetching bills:", err)
      setError(err instanceof Error ? err.message : "An unknown error occurred")
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to load bills",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Load bills on initial render
  useEffect(() => {
    fetchBills()
  }, [fetchBills])

  // Add a new bill
  const addSentBill = async (bill: BillInput) => {
    try {
      const response = await fetch("/api/bills", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bill),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to add bill")
      }

      const newBill = await response.json()
      setSentBills((prev) => [...prev, newBill])

      toast({
        title: "Success",
        description: `Bill has been sent to ${newBill.residentName}`,
      })

      return newBill
    } catch (err) {
      console.error("Error adding bill:", err)
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to send bill",
        variant: "destructive",
      })
      throw err
    }
  }

  // Add multiple bills at once
  const addMultipleBills = async (bills: BillInput[]) => {
    try {
      const response = await fetch("/api/bills/bulk", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ bills }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to send bills")
      }

      const result = await response.json()

      // Refresh bills after bulk operation
      await fetchBills()

      toast({
        title: "Success",
        description: `${result.count} bills have been sent`,
      })

      return result.bills
    } catch (err) {
      console.error("Error sending bills in bulk:", err)
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to send bills",
        variant: "destructive",
      })
      throw err
    }
  }

  // Update an existing bill (only status can be updated)
  const updateSentBill = async (id: string, updates: { status: "Paid" | "Pending" }) => {
    try {
      const response = await fetch(`/api/bills/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to update bill status")
      }

      const updatedBill = await response.json()

      setSentBills((prev) => prev.map((bill) => (bill.id === id ? { ...bill, ...updatedBill } : bill)))

      toast({
        title: "Success",
        description: `Bill status has been updated to ${updates.status}`,
      })
    } catch (err) {
      console.error("Error updating bill:", err)
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to update bill status",
        variant: "destructive",
      })
      throw err
    }
  }

  // Delete a bill
  const deleteSentBill = async (id: string) => {
    try {
      const response = await fetch(`/api/bills/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to delete bill")
      }

      setSentBills((prev) => prev.filter((bill) => bill.id !== id))

      toast({
        title: "Success",
        description: "Bill has been deleted",
      })
    } catch (err) {
      console.error("Error deleting bill:", err)
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to delete bill",
        variant: "destructive",
      })
      throw err
    }
  }

  return {
    sentBills,
    isLoading,
    error,
    addSentBill,
    addMultipleBills,
    updateSentBill,
    deleteSentBill,
    refreshBills: fetchBills,
  }
}

