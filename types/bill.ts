export interface SentBill {
  id: string
  residentId: string
  residentName: string
  flatNumber: string
  email: string
  amount: string
  status: "Paid" | "Pending"
  sentDate: string
  month: string
  year: string
  createdAt: Date
  updatedAt: Date
}

export interface BillInput {
  residentId: string
  residentName: string
  flatNumber: string
  email: string
  amount: string
  status: "Paid" | "Pending"
  month: string
  year: string
}

