import { type NextRequest, NextResponse } from "next/server"
import clientPromise, { testMongoConnection } from "@/lib/mongodb"

export async function GET(request: NextRequest) {
  try {
    // Test the MongoDB connection
    const connectionResult = await testMongoConnection()

    if (connectionResult.success) {
      // If connection is successful, try to list collections
      const client = await clientPromise
      const db = client.db()
      const collections = await db.listCollections().toArray()

      return NextResponse.json({
        success: true,
        message: "MongoDB connection is working",
        details: {
          connectionTest: connectionResult,
          collections: collections.map((c) => c.name),
        },
      })
    } else {
      return NextResponse.json(
        {
          success: false,
          message: "MongoDB connection failed",
          details: connectionResult,
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Error testing MongoDB connection:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to test MongoDB connection",
        details: error.message,
      },
      { status: 500 },
    )
  }
}

