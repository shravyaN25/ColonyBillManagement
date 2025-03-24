import { numberToWords } from "@/lib/utils"

interface BillPreviewProps {
  resident: {
    name: string
    flatNumber: string
    email: string
  }
  month: string
  year: string
  amount: string
}

export function BillPreview({ resident, month, year, amount }: BillPreviewProps) {
  const currentDate = new Date().toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })

  const billNumber = `ABM-${Math.floor(10000 + Math.random() * 90000)}`
  const amountNumber = Number.parseFloat(amount)
  const amountInWords = numberToWords(amountNumber)

  return (
    <div className="bg-white p-4 rounded-md">
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold">Annapurna Badavane Association</h2>
        <p className="text-gray-600">Monthly Maintenance Bill</p>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <h3 className="font-bold mb-2">Bill To:</h3>
          <p>{resident.name}</p>
          <p>Flat No: {resident.flatNumber}</p>
        </div>

        <div>
          <h3 className="font-bold mb-2">Bill Details:</h3>
          <p>Bill Date: {currentDate}</p>
          <p>
            Bill Period: {month} {year}
          </p>
          <p>Bill No: {billNumber}</p>
        </div>
      </div>

      <div className="border rounded-md mb-6">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="text-left p-2 border-b">Description</th>
              <th className="text-right p-2 border-b">Amount (₹)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="p-2 border-b">
                Monthly Maintenance Fee ({month} {year})
              </td>
              <td className="text-right p-2 border-b">{amount}</td>
            </tr>
            <tr className="font-bold">
              <td className="p-2">Total</td>
              <td className="text-right p-2">₹{amount}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="mb-6">
        <h3 className="font-bold mb-2">Amount in words:</h3>
        <p>Rupees {amountInWords} Only</p>
      </div>

      <div className="mt-10 text-right">
        <p className="font-bold">Treasurer</p>
        <p>GY Niranjan</p>
      </div>
    </div>
  )
}

