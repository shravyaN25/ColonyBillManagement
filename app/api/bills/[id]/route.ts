import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const client = await clientPromise
    const db = client.db()

    const bill = await db.collection("bills").findOne({ id })

    if (!bill) {
      return NextResponse.json({ error: "Bill not found" }, { status: 404 })
    }

    return NextResponse.json(bill)
  } catch (error) {
    console.error("Error fetching bill:", error)
    return NextResponse.json({ error: "Failed to fetch bill" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const client = await clientPromise
    const db = client.db()

    const data = await request.json()

    // Only allow updating the status
    if (!data.status) {
      return NextResponse.json({ error: "Status is required" }, { status: 400 })
    }

    const updatedBill = {
      status: data.status,
      updatedAt: new Date(),
    }

    const result = await db.collection("bills").updateOne({ id }, { $set: updatedBill })

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Bill not found" }, { status: 404 })
    }

    return NextResponse.json({ id, ...updatedBill })
  } catch (error) {
    console.error("Error updating bill:", error)
    return NextResponse.json({ error: "Failed to update bill" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const client = await clientPromise
    const db = client.db()

    const result = await db.collection("bills").deleteOne({ id })

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Bill not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, id })
  } catch (error) {
    console.error("Error deleting bill:", error)
    return NextResponse.json({ error: "Failed to delete bill" }, { status: 500 })
  }
}

