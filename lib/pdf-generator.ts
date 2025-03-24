import { jsPDF } from "jspdf"
import type { Resident } from "@/types/resident"
import type { SentBill } from "@/types/bill"
import { numberToWords } from "@/lib/utils"

export function generateBillPDF(
  resident: Resident | { name: string; flatNumber: string; email: string },
  bill: SentBill | { month: string; year: string; amount: string; sentDate?: string },
) {
  // Create a new PDF document
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  })

  // Set font
  doc.setFont("helvetica")

  // Add logo/header
  doc.setFontSize(18)
  doc.setTextColor(0, 0, 0)
  doc.text("Annapurna Badavane Association", 105, 20, { align: "center" })

  doc.setFontSize(12)
  doc.text("Monthly Maintenance Bill", 105, 30, { align: "center" })

  // Add horizontal line
  doc.setDrawColor(200, 200, 200)
  doc.line(20, 35, 190, 35)

  // Format the month name properly
  const monthName = bill.month.charAt(0).toUpperCase() + bill.month.slice(1)

  // Bill details
  doc.setFontSize(11)
  doc.setTextColor(80, 80, 80)

  // Bill To section
  doc.setFontSize(12)
  doc.setTextColor(0, 0, 0)
  doc.text("Bill To:", 20, 50)

  doc.setFontSize(11)
  doc.setTextColor(80, 80, 80)
  doc.text(resident.name, 20, 58)
  doc.text(`Flat No: ${resident.flatNumber}`, 20, 65)

  // Bill Details section
  doc.setFontSize(12)
  doc.setTextColor(0, 0, 0)
  doc.text("Bill Details:", 120, 50)

  doc.setFontSize(11)
  doc.setTextColor(80, 80, 80)

  // Format the current date
  const currentDate = new Date().toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })

  // Use sentDate if available, otherwise use current date
  const billDate = bill.sentDate || currentDate

  doc.text(`Bill Date: ${billDate}`, 120, 58)
  doc.text(`Bill Period: ${monthName} ${bill.year}`, 120, 65)

  // Generate a random bill number if not provided
  const billNumber = `ABM-${Math.floor(10000 + Math.random() * 90000)}`
  doc.text(`Bill No: ${billNumber}`, 120, 72)

  // Add table for bill items
  doc.setDrawColor(200, 200, 200)
  doc.setFillColor(245, 245, 245)
  doc.rect(20, 85, 170, 10, "F")

  doc.setFontSize(11)
  doc.setTextColor(0, 0, 0)
  doc.text("Description", 25, 91)
  doc.text("Amount (₹)", 160, 91, { align: "right" })

  // Table content
  doc.setDrawColor(200, 200, 200)
  doc.line(20, 95, 190, 95)

  doc.setTextColor(80, 80, 80)
  doc.text(`Monthly Maintenance Fee (${monthName} ${bill.year})`, 25, 105)
  doc.text(bill.amount, 160, 105, { align: "right" })

  doc.setDrawColor(200, 200, 200)
  doc.line(20, 110, 190, 110)

  // Total
  doc.setFontSize(12)
  doc.setTextColor(0, 0, 0)
  doc.text("Total", 25, 120)
  doc.text(`₹${bill.amount}`, 160, 120, { align: "right" })

  // Amount in words
  const amountNumber = Number.parseFloat(bill.amount)
  const amountInWords = numberToWords(amountNumber)

  doc.setFontSize(11)
  doc.text("Amount in words:", 20, 135)
  doc.setTextColor(80, 80, 80)
  doc.text(`Rupees ${amountInWords} Only`, 20, 142)

  // Signature
  doc.setTextColor(0, 0, 0)
  doc.text("Treasurer", 160, 180, { align: "right" })
  doc.text("GY Niranjan", 160, 188, { align: "right" })

  // Footer
  doc.setFontSize(9)
  doc.setTextColor(150, 150, 150)
  doc.text("This is a computer-generated document and does not require a signature.", 105, 270, { align: "center" })
  doc.text("© 2025 Annapurna Badavane Association. All rights reserved.", 105, 275, { align: "center" })

  // Generate filename
  const filename = `Annapurna_Bill_${resident.flatNumber}_${monthName}_${bill.year}.pdf`

  // Return the PDF document and filename
  return {
    doc,
    filename,
  }
}

