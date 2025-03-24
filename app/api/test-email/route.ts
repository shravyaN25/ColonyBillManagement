import { type NextRequest, NextResponse } from "next/server"
import { testEmailConfiguration, sendBillEmail, checkEmailConfig, isValidEmail } from "@/lib/email"

export async function GET(request: NextRequest) {
  try {
    // Check for common configuration issues
    const configCheck = checkEmailConfig()

    // Test the email configuration
    const configResult = await testEmailConfiguration()

    return NextResponse.json({
      success: configResult.success,
      message: configResult.success ? "Email configuration is valid" : "Email configuration test failed",
      configCheck,
      details: configResult,
    })
  } catch (error) {
    console.error("Error testing email configuration:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to test email configuration",
        details: error.message,
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "Email address is required" }, { status: 400 })
    }

    if (!isValidEmail(email)) {
      return NextResponse.json({ error: "Invalid email address format" }, { status: 400 })
    }

    // Check for common configuration issues first
    const configCheck = checkEmailConfig()
    if (configCheck.hasIssues) {
      return NextResponse.json(
        {
          success: false,
          message: "Email configuration has issues that need to be fixed",
          configCheck,
        },
        { status: 400 },
      )
    }

    // Create a test resident and bill
    const testResident = {
      id: "test-id",
      name: "Test Resident",
      flatNumber: "A-101",
      email: email,
      phone: "1234567890",
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const testBill = {
      id: "test-bill-id",
      residentId: "test-id",
      residentName: "Test Resident",
      flatNumber: "A-101",
      email: email,
      amount: "500",
      status: "Paid" as const,
      sentDate: new Date().toLocaleDateString("en-GB"),
      month: "june",
      year: "2025",
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    // Send a test email
    console.log(`Sending test email to ${email}...`)
    const result = await sendBillEmail(testResident, testBill)

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: `Test email sent successfully to ${email}`,
        details: result,
      })
    } else {
      return NextResponse.json(
        {
          success: false,
          message: "Failed to send test email",
          details: result,
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Error sending test email:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to send test email",
        details: error.message,
      },
      { status: 500 },
    )
  }
}

