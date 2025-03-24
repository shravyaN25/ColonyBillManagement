"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Send, Eye, Search, Loader2 } from "lucide-react"
import { BillPreview } from "@/components/bill-preview"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useResidents } from "@/hooks/use-residents"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import type { BillInput } from "@/types/bill"
import { useNotification } from "@/components/notification-provider"

export function BillingPanel() {
  const { residents, isLoading: isLoadingResidents } = useResidents()
  const [selectedMonth, setSelectedMonth] = useState("june")
  const [selectedYear, setSelectedYear] = useState("2025")
  const [defaultAmount, setDefaultAmount] = useState("400")
  const [selectedResidents, setSelectedResidents] = useState<string[]>([])
  const [residentAmounts, setResidentAmounts] = useState<Record<string, string>>({})
  const [previewResident, setPreviewResident] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [emailResults, setEmailResults] = useState<any>(null)

  // Add the useNotification hook inside the component
  const { showNotification } = useNotification()

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]

  const years = ["2025"]

  const filteredResidents = residents.filter(
    (resident) =>
      resident.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resident.flatNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resident.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Initialize resident amounts with default amount
  useEffect(() => {
    const newAmounts = { ...residentAmounts }
    let updated = false

    residents.forEach((resident) => {
      if (!residentAmounts[resident.id]) {
        newAmounts[resident.id] = defaultAmount || "0" // Ensure we never have an empty string
        updated = true
      }
    })

    if (updated) {
      setResidentAmounts(newAmounts)
    }
  }, [residents, defaultAmount, residentAmounts])

  const toggleResident = (id: string) => {
    setSelectedResidents((prev) => {
      if (prev.includes(id)) {
        return prev.filter((resId) => resId !== id)
      } else {
        return [...prev, id]
      }
    })
  }

  const toggleAllResidents = () => {
    if (selectedResidents.length === filteredResidents.length) {
      // Deselect all
      setSelectedResidents([])
    } else {
      // Select all
      const newSelected = filteredResidents.map((res) => res.id)
      setSelectedResidents(newSelected)
    }
  }

  const handleAmountChange = (id: string, amount: string) => {
    // Ensure amount is never empty
    const validAmount = amount === "" ? "0" : amount
    setResidentAmounts((prev) => ({
      ...prev,
      [id]: validAmount,
    }))
  }

  const getResidentById = (id: string) => {
    return residents.find((resident) => resident.id === id) || null
  }

  const getResidentAmount = (id: string) => {
    // Ensure we never return an empty string
    return residentAmounts[id] || defaultAmount || "0"
  }

  const openPreview = (id: string) => {
    setPreviewResident(id)
  }

  const handleDefaultAmountChange = (value: string) => {
    // Prevent empty value - set to 0 if user tries to clear it
    const newAmount = value === "" ? "0" : value
    const oldAmount = defaultAmount
    setDefaultAmount(newAmount)

    // Update amounts for residents that had the old default amount
    const newAmounts = { ...residentAmounts }
    residents.forEach((resident) => {
      if (residentAmounts[resident.id] === oldAmount) {
        newAmounts[resident.id] = newAmount
      }
    })
    setResidentAmounts(newAmounts)
  }

  const handleSendBills = async () => {
    if (selectedResidents.length === 0) {
      toast({
        title: "No residents selected",
        description: "Please select at least one resident to send bills to.",
        variant: "destructive",
      })
      return
    }

    setIsSending(true)
    setEmailResults(null)

    try {
      // Prepare bills for selected residents
      const billsToSend: BillInput[] = selectedResidents
        .map((residentId) => {
          const resident = getResidentById(residentId)
          if (!resident) return null

          // Ensure amount is never empty
          const amount = getResidentAmount(residentId)

          return {
            residentId: resident.id,
            residentName: resident.name,
            flatNumber: resident.flatNumber,
            email: resident.email,
            amount: amount,
            status: "Paid",
            month: selectedMonth,
            year: selectedYear,
          }
        })
        .filter(Boolean) as BillInput[]

      console.log("Sending bills:", billsToSend)

      // Send bills in bulk
      const response = await fetch("/api/bills/bulk", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ bills: billsToSend }),
      })

      const result = await response.json()
      console.log("Bulk send result:", result)

      if (response.ok) {
        setEmailResults(result.emailResults)

        // Show success/failure message
        if (result.emailResults.failed === 0) {
          toast({
            title: "Bills Sent Successfully",
            description: `${result.count} bills have been sent to residents' email addresses.`,
            variant: "default",
          })
          showNotification(`${result.count} bills have been sent to residents' email addresses.`, "success")
        } else if (result.emailResults.successful > 0) {
          toast({
            title: "Bills Partially Sent",
            description: `${result.emailResults.successful} bills sent successfully, ${result.emailResults.failed} failed.`,
            variant: "destructive",
          })
          showNotification(
            `${result.emailResults.successful} bills sent successfully, ${result.emailResults.failed} failed.`,
            "info",
          )
        } else {
          toast({
            title: "Bills Failed to Send",
            description: `All ${result.emailResults.failed} bills failed to send.`,
            variant: "destructive",
          })
          showNotification(`All ${result.emailResults.failed} bills failed to send.`, "error")
        }

        // Clear selection after sending
        setSelectedResidents([])
      } else {
        throw new Error(result.error || "Failed to send bills")
      }
    } catch (error) {
      console.error("Error sending bills:", error)
      toast({
        title: "Error Sending Bills",
        description: error.message || "There was an error sending the bills. Please try again.",
        variant: "destructive",
      })
      showNotification(error.message || "There was an error sending the bills. Please try again.", "error")
    } finally {
      setIsSending(false)
    }
  }

  if (isLoadingResidents) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Generate Bills</h2>
      </div>

      <p className="text-gray-600 mb-4">
        Generate and send bills to residents who have made payments. All sent bills will be marked as "Paid".
      </p>
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="month">Bill Month</Label>
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger id="month">
                <SelectValue placeholder="Select month" />
              </SelectTrigger>
              <SelectContent>
                {months.map((month) => (
                  <SelectItem key={month} value={month.toLowerCase()}>
                    {month}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="year">Bill Year</Label>
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger id="year">
                <SelectValue placeholder="Select year" />
              </SelectTrigger>
              <SelectContent>
                {years.map((year) => (
                  <SelectItem key={year} value={year}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="defaultAmount">Default Amount (₹)</Label>
            <Input
              id="defaultAmount"
              type="number"
              min="0"
              value={defaultAmount}
              onChange={(e) => handleDefaultAmountChange(e.target.value)}
              placeholder="Enter default amount"
              onBlur={() => {
                // If somehow the field is empty on blur, set it to 0
                if (defaultAmount === "") {
                  handleDefaultAmountChange("0")
                }
              }}
            />
          </div>
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input
            placeholder="Search residents by name, flat number, or email..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">
                  <Checkbox
                    checked={selectedResidents.length === filteredResidents.length && filteredResidents.length > 0}
                    onCheckedChange={toggleAllResidents}
                  />
                </TableHead>
                <TableHead>Flat No.</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Amount (₹)</TableHead>
                <TableHead className="w-[80px]">Preview</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredResidents.length > 0 ? (
                filteredResidents.map((resident) => (
                  <TableRow key={resident.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedResidents.includes(resident.id)}
                        onCheckedChange={() => toggleResident(resident.id)}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{resident.flatNumber}</TableCell>
                    <TableCell>{resident.name}</TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min="0"
                        value={residentAmounts[resident.id] || defaultAmount || "0"}
                        onChange={(e) => handleAmountChange(resident.id, e.target.value)}
                        onBlur={(e) => {
                          // If somehow the field is empty on blur, set it to 0
                          if (e.target.value === "") {
                            handleAmountChange(resident.id, "0")
                          }
                        }}
                        className="w-24"
                      />
                    </TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openPreview(resident.id)}
                            disabled={!selectedResidents.includes(resident.id)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                          <DialogHeader>
                            <DialogTitle>Bill Preview</DialogTitle>
                          </DialogHeader>
                          <BillPreview
                            resident={resident}
                            month={months.find((m) => m.toLowerCase() === selectedMonth) || ""}
                            year={selectedYear}
                            amount={getResidentAmount(resident.id)}
                          />
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6 text-gray-500">
                    {searchTerm
                      ? "No residents found. Try a different search term."
                      : "No residents added yet. Add residents in the Residents panel."}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex justify-center mt-6">
          <Button
            className="bg-blue-500 hover:bg-blue-600 px-8"
            disabled={selectedResidents.length === 0 || !selectedMonth || isSending}
            onClick={handleSendBills}
          >
            {isSending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Send Bills ({selectedResidents.length})
              </>
            )}
          </Button>
        </div>
      </div>
      <Toaster />
    </div>
  )
}



