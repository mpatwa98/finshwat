"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from "recharts"

interface Transaction {
  category: string
  amount: number
}

interface Budget {
  _id?: string
  category: string
  amount: number
}

interface BudgetComparisonProps {
  transactions: Transaction[]
  budgets: Budget[]
}

export function BudgetComparison({ transactions, budgets }: BudgetComparisonProps) {
  // Group transactions by category
  const spendingByCategory = transactions.reduce((acc: Record<string, number>, transaction: Transaction) => {
    if (!acc[transaction.category]) {
      acc[transaction.category] = 0
    }
    acc[transaction.category] += transaction.amount
    return acc
  }, {})

  // Create comparison data
  const comparisonData = budgets.map((budget: Budget) => ({
    category: budget.category,
    budgeted: budget.amount,
    spent: spendingByCategory[budget.category] || 0,
    remaining: Math.max(0, budget.amount - (spendingByCategory[budget.category] || 0)),
  }))

  const chartConfig = {
    budgeted: {
      label: "Budgeted",
      color: "hsl(var(--chart-1))",
    },
    spent: {
      label: "Spent",
      color: "hsl(var(--chart-2))",
    },
  }

  if (comparisonData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Budget vs Actual</CardTitle>
          <CardDescription>Compare your budgeted amounts with actual spending</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[300px] text-muted-foreground">
            No budget data available
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Budget vs Actual</CardTitle>
        <CardDescription>Compare your budgeted amounts with actual spending</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={comparisonData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <XAxis
                dataKey="category"
                tick={{ fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
              <ChartTooltip
                content={<ChartTooltipContent />}
                formatter={(value: number | string, name: string) => [`$${Number(value).toFixed(2)}`, name === "budgeted" ? "Budgeted" : "Spent"]}
              />
              <Bar dataKey="budgeted" fill="var(--color-budgeted)" name="budgeted" />
              <Bar dataKey="spent" fill="var(--color-spent)" name="spent" />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
