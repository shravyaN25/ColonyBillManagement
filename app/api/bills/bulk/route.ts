import { type NextRequest, NextResponse } from "next/server"
import { v4 as uuidv4 } from "uuid"
import clientPromise from "@/lib/mongodb"
import type { BillInput } from "@/types/bill"
import { sendBillEmail } from "@/lib/email"

export async function POST(request: NextRequest) {
  try {
    console.log("Bulk bills API called")
    const client = await clientPromise
    const db = client.db()

    const { bills }: { bills: BillInput[] } = await request.json()

    if (!bills || !Array.isArray(bills) || bills.length === 0) {
      console.error("No bills provided in request")
      return NextResponse.json({ error: "No bills provided" }, { status: 400 })
    }

    console.log(`Processing ${bills.length} bills`)

    // Format the date as DD/MM/YYYY
    const today = new Date()
    const sentDate = `${today.getDate().toString().padStart(2, "0")}/${(today.getMonth() + 1).toString().padStart(2, "0")}/${today.getFullYear()}`
    const now = new Date()

    const newBills = []
    const emailResults = []

    for (const billData of bills) {
      // Validate required fields
      if (!billData.residentId || !billData.month || !billData.year || !billData.amount) {
        console.warn("Skipping invalid bill:", billData)
        continue // Skip invalid bills
      }

      const newBill = {
        id: uuidv4(),
        ...billData,
        sentDate,
        createdAt: now,
        updatedAt: now,
      }

      newBills.push(newBill)

      // Get the resident to send email
      console.log(`Fetching resident with ID: ${billData.residentId}`)
      const resident = await db.collection("residents").findOne({ id: billData.residentId })

      if (resident) {
        console.log(`Sending email to resident: ${resident.name} (${resident.email})`)
        // Send email and track result
        try {
          const emailResult = await sendBillEmail(resident, newBill)
          emailResults.push({
            residentId: resident.id,
            email: resident.email,
            success: emailResult.success,
            error: emailResult.success ? null : emailResult.error,
          })
        } catch (error) {
          console.error(`Error sending email to ${resident.email}:`, error)
          emailResults.push({
            residentId: resident.id,
            email: resident.email,
            success: false,
            error: error.message || "Unknown error",
          })
        }
      } else {
        console.error(`Resident with ID ${billData.residentId} not found`)
        emailResults.push({
          residentId: billData.residentId,
          email: "unknown",
          success: false,
          error: "Resident not found",
        })
      }
    }

    if (newBills.length === 0) {
      console.error("No valid bills to create")
      return NextResponse.json({ error: "No valid bills to create" }, { status: 400 })
    }

    // Insert all bills at once
    console.log(`Inserting ${newBills.length} bills into database`)
    await db.collection("bills").insertMany(newBills)

    // Count successful and failed emails
    const successfulEmails = emailResults.filter((r) => r.success).length
    const failedEmails = emailResults.filter((r) => !r.success).length

    console.log(`Email sending results: ${successfulEmails} successful, ${failedEmails} failed`)

    return NextResponse.json(
      {
        success: true,
        count: newBills.length,
        bills: newBills,
        emailResults: {
          total: emailResults.length,
          successful: successfulEmails,
          failed: failedEmails,
          details: emailResults,
        },
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error creating bills in bulk:", error)
    return NextResponse.json(
      {
        error: "Failed to create bills",
        details: error.message,
      },
      { status: 500 },
    )
  }
}

