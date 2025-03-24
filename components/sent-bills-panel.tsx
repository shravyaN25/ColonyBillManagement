"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Eye, Loader2 } from "lucide-react"
import { BillPreview } from "@/components/bill-preview"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useSentBills, type SentBill } from "@/hooks/use-sent-bills"
import { useResidents } from "@/hooks/use-residents"

export function SentBillsPanel() {
  const { sentBills, isLoading, updateSentBill, refreshBills } = useSentBills()
  const { residents, isLoading: isLoadingResidents } = useResidents()
  const [selectedMonth, setSelectedMonth] = useState("")
  const [selectedYear, setSelectedYear] = useState("2025")
  const [searchTerm, setSearchTerm] = useState("")
  const [previewBill, setPreviewBill] = useState<SentBill | null>(null)

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

  const years = ["2025"] // Only 2025 as an option

  // Refresh bills when filters change
  useEffect(() => {
    const filters: Record<string, string> = {}
    if (selectedMonth && selectedMonth !== "all") filters.month = selectedMonth
    if (selectedYear && selectedYear !== "all") filters.year = selectedYear

    refreshBills(filters)
  }, [selectedMonth, selectedYear, refreshBills])

  // Filter bills based on search term
  const filteredBills = sentBills.filter((bill) => {
    return (
      searchTerm === "" ||
      bill.residentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bill.flatNumber.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })

  // Create a map of resident IDs to their latest bill
  const residentBillMap = new Map<string, SentBill>()

  // Group bills by resident and keep only the latest one for each resident
  sentBills.forEach((bill) => {
    const existingBill = residentBillMap.get(bill.residentId)
    if (
      !existingBill ||
      new Date(bill.sentDate.split("/").reverse().join("-")) >
        new Date(existingBill.sentDate.split("/").reverse().join("-"))
    ) {
      residentBillMap.set(bill.residentId, bill)
    }
  })

  if (isLoading || isLoadingResidents) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="month">Month</Label>
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger id="month">
                <SelectValue placeholder="Select month" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Months</SelectItem>
                {months.map((month) => (
                  <SelectItem key={month} value={month.toLowerCase()}>
                    {month}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="year">Year</Label>
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
        </div>

        <div className="space-y-2">
          <Label htmlFor="search">Search</Label>
          <Input
            id="search"
            placeholder="Search by name or flat no."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Flat No.</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Sent Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {searchTerm === "" && selectedMonth === "" ? (
                // Show all residents with their latest bill status or "No Bill" if they don't have any
                <>
                  {residents.map((resident) => {
                    const latestBill = residentBillMap.get(resident.id)

                    return (
                      <TableRow key={resident.id}>
                        <TableCell className="font-medium">{resident.flatNumber}</TableCell>
                        <TableCell>{resident.name}</TableCell>
                        <TableCell>{latestBill ? `₹${latestBill.amount}` : "No Bill"}</TableCell>
                        <TableCell>
                          {latestBill ? (
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              {latestBill.status}
                            </span>
                          ) : (
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              No Bill
                            </span>
                          )}
                        </TableCell>
                        <TableCell>{latestBill ? latestBill.sentDate : "N/A"}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {latestBill ? (
                              <>
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button variant="ghost" size="icon" onClick={() => setPreviewBill(latestBill)}>
                                      <Eye className="h-4 w-4" />
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="sm:max-w-[425px]">
                                    <DialogHeader>
                                      <DialogTitle>Bill Preview</DialogTitle>
                                    </DialogHeader>
                                    {previewBill && (
                                      <BillPreview
                                        resident={{
                                          name: previewBill.residentName,
                                          flatNumber: previewBill.flatNumber,
                                          email: previewBill.email,
                                        }}
                                        month={months.find((m) => m.toLowerCase() === previewBill.month) || ""}
                                        year={previewBill.year}
                                        amount={previewBill.amount}
                                      />
                                    )}
                                  </DialogContent>
                                </Dialog>
                                {/* PDF download button removed */}
                              </>
                            ) : (
                              <span className="text-gray-400 text-xs">No actions available</span>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </>
              ) : filteredBills.length > 0 ? (
                // Show filtered bills
                filteredBills.map((bill) => (
                  <TableRow key={bill.id}>
                    <TableCell className="font-medium">{bill.flatNumber}</TableCell>
                    <TableCell>{bill.residentName}</TableCell>
                    <TableCell>₹{bill.amount}</TableCell>
                    <TableCell>
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {bill.status}
                      </span>
                    </TableCell>
                    <TableCell>{bill.sentDate}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="icon" onClick={() => setPreviewBill(bill)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                              <DialogTitle>Bill Preview</DialogTitle>
                            </DialogHeader>
                            {previewBill && (
                              <BillPreview
                                resident={{
                                  name: previewBill.residentName,
                                  flatNumber: previewBill.flatNumber,
                                  email: previewBill.email,
                                }}
                                month={months.find((m) => m.toLowerCase() === previewBill.month) || ""}
                                year={previewBill.year}
                                amount={previewBill.amount}
                              />
                            )}
                          </DialogContent>
                        </Dialog>
                        {/* PDF download button removed */}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6 text-gray-500">
                    {sentBills.length === 0
                      ? "No bills have been sent yet. Generate and send bills from the 'Generate Bills' tab."
                      : "No bills found matching the selected filters."}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}

