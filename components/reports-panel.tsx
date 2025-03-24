import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, LineChart, PieChart } from "lucide-react"

export function ReportsPanel() {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6">Reports & Analytics</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Total Residents</CardTitle>
            <CardDescription>Current active residents</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">42</div>
            <p className="text-xs text-green-600 mt-1">+2 since last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Collection Rate</CardTitle>
            <CardDescription>Current month payments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">87%</div>
            <p className="text-xs text-green-600 mt-1">+5% since last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Outstanding Amount</CardTitle>
            <CardDescription>Total pending payments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">₹24,500</div>
            <p className="text-xs text-red-600 mt-1">+₹2,500 since last month</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart className="h-5 w-5" />
              Monthly Collections
            </CardTitle>
            <CardDescription>Maintenance fee collection over the past 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] flex items-center justify-center bg-gray-50 rounded-md border">
              <p className="text-gray-500 text-sm">Chart visualization will appear here</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Payment Status
            </CardTitle>
            <CardDescription>Current month payment status breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] flex items-center justify-center bg-gray-50 rounded-md border">
              <p className="text-gray-500 text-sm">Chart visualization will appear here</p>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LineChart className="h-5 w-5" />
              Yearly Expense Trend
            </CardTitle>
            <CardDescription>Association expenses over the past 12 months</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] flex items-center justify-center bg-gray-50 rounded-md border">
              <p className="text-gray-500 text-sm">Chart visualization will appear here</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

