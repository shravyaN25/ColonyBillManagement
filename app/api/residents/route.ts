import { type NextRequest, NextResponse } from "next/server"
import { v4 as uuidv4 } from "uuid"
import clientPromise from "@/lib/mongodb"
import type { Resident, ResidentInput } from "@/types/resident"

export async function GET(request: NextRequest) {
  console.log("GET /api/residents - Fetching all residents")
  try {
    const client = await clientPromise
    const db = client.db()

    const residents = await db.collection("residents").find({}).sort({ flatNumber: 1 }).toArray()
    console.log(`GET /api/residents - Successfully fetched ${residents.length} residents`)

    return NextResponse.json(residents)
  } catch (error) {
    console.error("Error fetching residents:", error)
    return NextResponse.json({ error: "Failed to fetch residents", details: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  console.log("POST /api/residents - Creating new resident")
  try {
    const client = await clientPromise
    console.log("MongoDB client connected successfully")
    const db = client.db()

    let data: ResidentInput
    try {
      data = await request.json()
      console.log("Received resident data:", data)
    } catch (error) {
      console.error("Error parsing request body:", error)
      return NextResponse.json({ error: "Invalid request body", details: error.message }, { status: 400 })
    }

    // Validate required fields
    if (!data.name || !data.flatNumber || !data.email || !data.phone) {
      console.error("Missing required fields:", data)
      return NextResponse.json(
        {
          error: "Missing required fields",
          details: {
            name: !data.name ? "Name is required" : null,
            flatNumber: !data.flatNumber ? "Flat number is required" : null,
            email: !data.email ? "Email is required" : null,
            phone: !data.phone ? "Phone is required" : null,
          },
        },
        { status: 400 },
      )
    }

    // Check if flat number already exists
    console.log(`Checking if flat number ${data.flatNumber} already exists`)
    const existingResident = await db.collection("residents").findOne({ flatNumber: data.flatNumber })
    if (existingResident) {
      console.error(`Flat number ${data.flatNumber} already exists`)
      return NextResponse.json({ error: "Flat number already exists" }, { status: 409 })
    }

    const now = new Date()
    const newResident: Resident = {
      id: uuidv4(),
      ...data,
      createdAt: now,
      updatedAt: now,
    }

    console.log("Inserting new resident:", newResident)
    try {
      await db.collection("residents").insertOne(newResident)
      console.log("Resident created successfully with ID:", newResident.id)
    } catch (dbError) {
      console.error("Database error when inserting resident:", dbError)
      return NextResponse.json({ error: "Database error", details: dbError.message }, { status: 500 })
    }

    return NextResponse.json(newResident, { status: 201 })
  } catch (error) {
    console.error("Error creating resident:", error)
    return NextResponse.json({ error: "Failed to create resident", details: error.message }, { status: 500 })
  }
}

