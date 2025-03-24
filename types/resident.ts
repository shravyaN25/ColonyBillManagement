export interface Resident {
  id: string
  name: string
  flatNumber: string
  email: string
  phone: string
  createdAt: Date
  updatedAt: Date
}

export interface ResidentInput {
  name: string
  flatNumber: string
  email: string
  phone: string
}

