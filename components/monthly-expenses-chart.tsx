"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from "recharts"

interface Transaction {
  _id?: string
  amount: number
  date: string
  description: string
  category: string
}

interface MonthlyExpensesChartProps {
  transactions: Transaction[]
}

// Helper type for monthly data
interface MonthlyData {
  [month: string]: { month: string; amount: number }
}

export function MonthlyExpensesChart({ transactions }: MonthlyExpensesChartProps) {
  // Group transactions by month
  const monthlyData: MonthlyData = transactions.reduce((acc, transaction) => {
    const month = transaction.date.slice(0, 7) // YYYY-MM format
    const monthName = new Date(transaction.date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
    })

    if (!acc[month]) {
      acc[month] = {
        month: monthName,
        amount: 0,
      }
    }

    acc[month].amount += transaction.amount
    return acc
  }, {} as MonthlyData)

  const chartData = Object.values(monthlyData)
    .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime())
    .slice(-6) // Show last 6 months

  const chartConfig = {
    amount: {
      label: "Amount",
      color: "hsl(var(--chart-1))",
    },
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Expenses</CardTitle>
        <CardDescription>Your spending over the last 6 months</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <XAxis dataKey="month" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
              <ChartTooltip
                content={<ChartTooltipContent />}
                formatter={(value: number | string) => [`$${Number(value).toFixed(2)}`, "Amount"]}
              />
              <Bar dataKey="amount" fill="var(--color-amount)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
