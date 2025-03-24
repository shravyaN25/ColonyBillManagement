import { type NextRequest, NextResponse } from "next/server"
import { v4 as uuidv4 } from "uuid"
import clientPromise from "@/lib/mongodb"
import type { BillInput, SentBill } from "@/types/bill"
import { sendBillEmail } from "@/lib/email"

export async function GET(request: NextRequest) {
  try {
    const client = await clientPromise
    const db = client.db()

    // Get query parameters
    const url = new URL(request.url)
    const month = url.searchParams.get("month")
    const year = url.searchParams.get("year")
    const status = url.searchParams.get("status")
    const residentId = url.searchParams.get("residentId")

    // Build query
    const query: any = {}
    if (month) query.month = month
    if (year) query.year = year
    if (status) query.status = status
    if (residentId) query.residentId = residentId

    const bills = await db.collection("bills").find(query).sort({ sentDate: -1 }).toArray()

    return NextResponse.json(bills)
  } catch (error) {
    console.error("Error fetching bills:", error)
    return NextResponse.json({ error: "Failed to fetch bills" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const client = await clientPromise
    const db = client.db()

    const data: BillInput = await request.json()

    // Validate required fields
    if (!data.residentId || !data.month || !data.year || !data.amount) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Get the resident to send email
    const resident = await db.collection("residents").findOne({ id: data.residentId })

    if (!resident) {
      return NextResponse.json({ error: "Resident not found" }, { status: 404 })
    }

    // Format the date as DD/MM/YYYY
    const today = new Date()
    const sentDate = `${today.getDate().toString().padStart(2, "0")}/${(today.getMonth() + 1).toString().padStart(2, "0")}/${today.getFullYear()}`

    const now = new Date()
    const newBill: SentBill = {
      id: uuidv4(),
      ...data,
      sentDate,
      createdAt: now,
      updatedAt: now,
    }

    await db.collection("bills").insertOne(newBill)

    // Send email notification
    await sendBillEmail(resident, newBill)

    return NextResponse.json(newBill, { status: 201 })
  } catch (error) {
    console.error("Error creating bill:", error)
    return NextResponse.json({ error: "Failed to create bill" }, { status: 500 })
  }
}

