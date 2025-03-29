import nodemailer from "nodemailer"
import type { Resident } from "@/types/resident"
import type { SentBill } from "@/types/bill"

// Create a transporter with verbose logging
const createTransporter = () => {
  console.log("=== EMAIL CONFIGURATION ===")
  console.log(`- Host: ${process.env.EMAIL_HOST}`)
  console.log(`- Port: ${process.env.EMAIL_PORT}`)
  console.log(`- User: ${process.env.EMAIL_USER}`)
  console.log(`- From: ${process.env.EMAIL_FROM}`)
  console.log(`- Secure: ${process.env.EMAIL_PORT === "465" ? "Yes" : "No"}`)

  // Check if all required email configuration is present
  if (!process.env.EMAIL_HOST) {
    console.error("ERROR: Missing EMAIL_HOST environment variable")
    return null
  }
  if (!process.env.EMAIL_PORT) {
    console.error("ERROR: Missing EMAIL_PORT environment variable")
    return null
  }
  if (!process.env.EMAIL_USER) {
    console.error("ERROR: Missing EMAIL_USER environment variable")
    return null
  }
  if (!process.env.EMAIL_PASSWORD) {
    console.error("ERROR: Missing EMAIL_PASSWORD environment variable")
    return null
  }
  if (!process.env.EMAIL_FROM) {
    console.error("ERROR: Missing EMAIL_FROM environment variable")
    return null
  }

  try {
    const transportConfig = {
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT),
      secure: process.env.EMAIL_PORT === "465", // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
      debug: true, // Enable debug output
      logger: true, // Log information about the transport
    }

    console.log(
      "Creating email transporter with config:",
      JSON.stringify({
        ...transportConfig,
        auth: {
          user: transportConfig.auth.user,
          pass: "********", // Don't log the actual password
        },
      }),
    )

    return nodemailer.createTransport(transportConfig)
  } catch (error) {
    console.error("ERROR: Failed to create email transporter:", error)
    return null
  }
}

export async function sendBillEmail(resident: Resident, bill: SentBill) {
  console.log(`=== SENDING EMAIL ===`)
  console.log(`- To: ${resident.name} (${resident.email})`)
  console.log(`- Subject: Maintenance Bill for ${bill.month} ${bill.year}`)

  const transporter = createTransporter()
  if (!transporter) {
    console.error("ERROR: Email transporter could not be created")
    return { success: false, error: "Email transporter could not be created" }
  }

  const { name, email, flatNumber } = resident
  const { month, year, amount } = bill

  // Format the month name properly
  const monthName = month.charAt(0).toUpperCase() + month.slice(1)

  // Create the email content
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: `Annapurna Badavane Association - Maintenance Bill for ${monthName} ${year}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="color: #333;">Annapurna Badavane Association</h2>
          <p style="color: #666;">Monthly Maintenance Bill</p>
        </div>
        
        <div style="margin-bottom: 20px;">
          <h3 style="color: #333; margin-bottom: 10px;">Bill To:</h3>
          <p style="margin: 5px 0;">${name}</p>
          <p style="margin: 5px 0;">Flat No: ${flatNumber}</p>
        </div>
        
        <div style="margin-bottom: 20px;">
          <h3 style="color: #333; margin-bottom: 10px;">Bill Details:</h3>
          <p style="margin: 5px 0;">Bill Date: ${new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</p>
          <p style="margin: 5px 0;">Bill Period: ${monthName} ${year}</p>
          <p style="margin: 5px 0;">Bill No: ABM-${Math.floor(10000 + Math.random() * 90000)}</p>
        </div>
        
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <thead>
            <tr style="background-color: #f5f5f5;">
              <th style="text-align: left; padding: 10px; border: 1px solid #e0e0e0;">Description</th>
              <th style="text-align: right; padding: 10px; border: 1px solid #e0e0e0;">Amount (₹)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="padding: 10px; border: 1px solid #e0e0e0;">Monthly Maintenance Fee (${monthName} ${year})</td>
              <td style="text-align: right; padding: 10px; border: 1px solid #e0e0e0;">${amount}</td>
            </tr>
            <tr style="font-weight: bold;">
              <td style="padding: 10px; border: 1px solid #e0e0e0;">Total</td>
              <td style="text-align: right; padding: 10px; border: 1px solid #e0e0e0;">₹${amount}</td>
            </tr>
          </tbody>
        </table>
        
        <div style="margin-top: 30px; text-align: right;">
          <p style="font-weight: bold; margin-bottom: 5px;">Treasurer</p>
          <p>GY Niranjan</p>
        </div>
        
        <div style="margin-top: 30px; font-size: 12px; color: #666; text-align: center; border-top: 1px solid #e0e0e0; padding-top: 15px;">
          <p style="margin-bottom: 10px;">If you have any queries, mail at annapurnabadavane@gmail.com</p>
      
        </div>
      </div>
    `,
  }

  console.log("Email options prepared:")
  console.log(`- From: ${mailOptions.from}`)
  console.log(`- To: ${mailOptions.to}`)
  console.log(`- Subject: ${mailOptions.subject}`)

  // Send the email
  try {
    console.log("Attempting to send email...")
    const info = await transporter.sendMail(mailOptions)
    console.log("Email sent successfully!")
    console.log("- Message ID:", info.messageId)
    console.log("- Response:", info.response)
    return { success: true, messageId: info.messageId, response: info.response }
  } catch (error) {
    console.error("ERROR: Failed to send email:", error)

    // More detailed error information
    const errorDetails = {
      message: error.message,
      code: error.code,
      command: error.command,
      responseCode: error.responseCode,
      response: error.response,
    }

    console.error("Error details:", JSON.stringify(errorDetails, null, 2))

    // Common error codes and their meanings
    if (error.code === "EAUTH") {
      console.error("Authentication error. Check your email credentials.")
      return {
        success: false,
        error: "Authentication failed. Please check your email username and password.",
        details: errorDetails,
      }
    } else if (error.code === "ESOCKET") {
      console.error("Socket error. Check your email host and port settings.")
      return {
        success: false,
        error: "Connection error. Please check your email host and port settings.",
        details: errorDetails,
      }
    } else if (error.code === "ECONNECTION") {
      console.error("Connection error. Check your network and email server settings.")
      return {
        success: false,
        error: "Network connection error. Please check your internet connection and email server settings.",
        details: errorDetails,
      }
    } else if (error.code === "ETIMEDOUT") {
      console.error("Connection timed out. The email server is not responding.")
      return {
        success: false,
        error: "Connection timed out. The email server is not responding.",
        details: errorDetails,
      }
    } else if (error.responseCode === 550) {
      console.error("Recipient address rejected. The email address may not exist.")
      return {
        success: false,
        error: "Recipient address rejected. The email address may not exist or be invalid.",
        details: errorDetails,
      }
    } else if (error.responseCode === 554) {
      console.error("Transaction failed. This could be due to spam filtering.")
      return {
        success: false,
        error: "Transaction failed. This could be due to spam filtering or content restrictions.",
        details: errorDetails,
      }
    }

    return {
      success: false,
      error: error.message || "Unknown error",
      details: errorDetails,
    }
  }
}

// Test function to verify email configuration
export async function testEmailConfiguration() {
  console.log("=== TESTING EMAIL CONFIGURATION ===")

  const transporter = createTransporter()
  if (!transporter) {
    return {
      success: false,
      error: "Email transporter could not be created. Check your environment variables.",
      missingVariables: {
        EMAIL_HOST: !process.env.EMAIL_HOST,
        EMAIL_PORT: !process.env.EMAIL_PORT,
        EMAIL_USER: !process.env.EMAIL_USER,
        EMAIL_PASSWORD: !process.env.EMAIL_PASSWORD,
        EMAIL_FROM: !process.env.EMAIL_FROM,
      },
    }
  }

  try {
    // Verify SMTP connection
    console.log("Verifying SMTP connection...")
    const verification = await transporter.verify()
    console.log("SMTP connection verified:", verification)
    return {
      success: true,
      message: "Email configuration is valid",
      config: {
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: process.env.EMAIL_PORT === "465",
        user: process.env.EMAIL_USER,
        from: process.env.EMAIL_FROM,
      },
    }
  } catch (error) {
    console.error("ERROR: Failed to verify SMTP connection:", error)

    const errorDetails = {
      message: error.message,
      code: error.code,
      command: error.command,
      responseCode: error.responseCode,
      response: error.response,
    }

    // Provide specific guidance based on error codes
    let guidance = "Please check your email server settings."

    if (error.code === "EAUTH") {
      guidance = "Authentication failed. Please check your email username and password."
    } else if (error.code === "ESOCKET") {
      guidance = "Connection error. Please check your email host and port settings."
    } else if (error.code === "ECONNECTION" || error.code === "ENOTFOUND") {
      guidance = "Network connection error. Please check your internet connection and email server hostname."
    } else if (error.code === "ETIMEDOUT") {
      guidance = "Connection timed out. The email server is not responding or may be blocked."
    }

    return {
      success: false,
      error: error.message,
      guidance,
      details: errorDetails,
      config: {
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: process.env.EMAIL_PORT === "465",
        user: process.env.EMAIL_USER,
        from: process.env.EMAIL_FROM,
      },
    }
  }
}

// Function to check if email address is valid
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Function to check common email configuration issues
export function checkEmailConfig() {
  const issues = []

  // Check for missing environment variables
  if (!process.env.EMAIL_HOST) issues.push("EMAIL_HOST is missing")
  if (!process.env.EMAIL_PORT) issues.push("EMAIL_PORT is missing")
  if (!process.env.EMAIL_USER) issues.push("EMAIL_USER is missing")
  if (!process.env.EMAIL_PASSWORD) issues.push("EMAIL_PASSWORD is missing")
  if (!process.env.EMAIL_FROM) issues.push("EMAIL_FROM is missing")

  // Check for common configuration issues
  if (process.env.EMAIL_HOST === "smtp.gmail.com" && !process.env.EMAIL_USER?.includes("@gmail.com")) {
    issues.push("Gmail SMTP requires a full Gmail address as the username")
  }

  if (
    process.env.EMAIL_HOST === "smtp.gmail.com" &&
    process.env.EMAIL_PORT !== "465" &&
    process.env.EMAIL_PORT !== "587"
  ) {
    issues.push("Gmail SMTP requires port 465 (SSL) or 587 (TLS)")
  }

  if (process.env.EMAIL_FROM && !isValidEmail(process.env.EMAIL_FROM)) {
    issues.push("EMAIL_FROM is not a valid email address")
  }

  return {
    hasIssues: issues.length > 0,
    issues,
    config: {
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: process.env.EMAIL_PORT === "465",
      user: process.env.EMAIL_USER,
      from: process.env.EMAIL_FROM,
    },
  }
}

