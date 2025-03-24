import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import type { ResidentInput } from "@/types/resident"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const client = await clientPromise
    const db = client.db()

    const resident = await db.collection("residents").findOne({ id })

    if (!resident) {
      return NextResponse.json({ error: "Resident not found" }, { status: 404 })
    }

    return NextResponse.json(resident)
  } catch (error) {
    console.error("Error fetching resident:", error)
    return NextResponse.json({ error: "Failed to fetch resident" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const client = await clientPromise
    const db = client.db()

    const data: ResidentInput = await request.json()

    // Validate required fields
    if (!data.name || !data.flatNumber || !data.email || !data.phone) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Check if flat number already exists for a different resident
    const existingResident = await db.collection("residents").findOne({
      flatNumber: data.flatNumber,
      id: { $ne: id },
    })

    if (existingResident) {
      return NextResponse.json({ error: "Flat number already exists" }, { status: 409 })
    }

    const updatedResident = {
      ...data,
      updatedAt: new Date(),
    }

    const result = await db.collection("residents").updateOne({ id }, { $set: updatedResident })

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Resident not found" }, { status: 404 })
    }

    return NextResponse.json({ id, ...updatedResident })
  } catch (error) {
    console.error("Error updating resident:", error)
    return NextResponse.json({ error: "Failed to update resident" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const client = await clientPromise
    const db = client.db()

    // Get the URL to check for force parameter
    const url = new URL(request.url)
    const forceDelete = url.searchParams.get("force") === "true"

    // Check if there are any bills associated with this resident
    const billCount = await db.collection("bills").countDocuments({ residentId: id })

    if (billCount > 0 && !forceDelete) {
      // If there are bills and force delete is not enabled, return an error
      return NextResponse.json(
        {
          error: "Cannot delete resident with associated bills. This resident has bills in the system.",
          hasBills: true,
          billCount,
        },
        { status: 409 },
      )
    }

    // If force delete is enabled, also delete associated bills
    if (forceDelete && billCount > 0) {
      await db.collection("bills").deleteMany({ residentId: id })
    }

    const result = await db.collection("residents").deleteOne({ id })

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Resident not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      id,
      billsDeleted: forceDelete ? billCount : 0,
    })
  } catch (error) {
    console.error("Error deleting resident:", error)
    return NextResponse.json({ error: "Failed to delete resident. Database error occurred." }, { status: 500 })
  }
}

