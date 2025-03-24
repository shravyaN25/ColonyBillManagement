import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function numberToWords(num: number): string {
  const units = [
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
  ]
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"]

  if (num === 0) return "Zero"

  function convertLessThanOneThousand(num: number): string {
    if (num < 20) {
      return units[num]
    }

    const ten = Math.floor(num / 10) % 10
    const unit = num % 10

    return (ten > 0 ? tens[ten] + " " : "") + (unit > 0 ? units[unit] : "")
  }

  let result = ""

  // Handle lakhs (100,000s)
  if (num >= 100000) {
    result += convertLessThanOneThousand(Math.floor(num / 100000)) + " Lakh "
    num %= 100000
  }

  // Handle thousands
  if (num >= 1000) {
    result += convertLessThanOneThousand(Math.floor(num / 1000)) + " Thousand "
    num %= 1000
  }

  // Handle hundreds
  if (num >= 100) {
    result += units[Math.floor(num / 100)] + " Hundred "
    num %= 100
  }

  // Handle tens and units
  if (num > 0) {
    if (result !== "") {
      result += "and "
    }
    result += convertLessThanOneThousand(num)
  }

  return result.trim()
}

