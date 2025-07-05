"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle } from "lucide-react"

interface SpendingInsightsProps {
  transactions: any[]
  budgets: any[]
}

export function SpendingInsights({ transactions, budgets }: SpendingInsightsProps) {
  const currentMonth = new Date().toISOString().slice(0, 7)
  const lastMonth = new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().slice(0, 7)

  const currentMonthTransactions = transactions.filter((t) => t.date.startsWith(currentMonth))
  const lastMonthTransactions = transactions.filter((t) => t.date.startsWith(lastMonth))

  const currentMonthTotal = currentMonthTransactions.reduce((sum, t) => sum + t.amount, 0)
  const lastMonthTotal = lastMonthTransactions.reduce((sum, t) => sum + t.amount, 0)

  const monthlyChange = currentMonthTotal - lastMonthTotal
  const monthlyChangePercent = lastMonthTotal > 0 ? (monthlyChange / lastMonthTotal) * 100 : 0

  // Category analysis
  const categorySpending = currentMonthTransactions.reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + t.amount
    return acc
  }, {})

  const topCategories = Object.entries(categorySpending)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)

  // Budget analysis
  const budgetAnalysis = budgets.map((budget) => {
    const spent = categorySpending[budget.category] || 0
    const remaining = budget.amount - spent
    const percentUsed = (spent / budget.amount) * 100

    return {
      category: budget.category,
      budget: budget.amount,
      spent,
      remaining,
      percentUsed,
      status: percentUsed > 100 ? "over" : percentUsed > 80 ? "warning" : "good",
    }
  })

  const overBudgetCategories = budgetAnalysis.filter((b) => b.status === "over")
  const warningCategories = budgetAnalysis.filter((b) => b.status === "warning")

  // Spending patterns
  const avgDailySpending = currentMonthTotal / new Date().getDate()
  const projectedMonthlySpending =
    avgDailySpending * new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate()

  const insights = []

  // Monthly comparison insight
  if (monthlyChange !== 0) {
    insights.push({
      type: monthlyChange > 0 ? "warning" : "positive",
      icon: monthlyChange > 0 ? TrendingUp : TrendingDown,
      title: `${monthlyChange > 0 ? "Increased" : "Decreased"} spending`,
      description: `You've spent ${Math.abs(monthlyChangePercent).toFixed(1)}% ${monthlyChange > 0 ? "more" : "less"} this month compared to last month ($${Math.abs(monthlyChange).toFixed(2)}).`,
    })
  }

  // Budget warnings
  if (overBudgetCategories.length > 0) {
    insights.push({
      type: "danger",
      icon: AlertTriangle,
      title: "Over budget",
      description: `You're over budget in ${overBudgetCategories.length} ${overBudgetCategories.length === 1 ? "category" : "categories"}: ${overBudgetCategories.map((c) => c.category).join(", ")}.`,
    })
  }

  if (warningCategories.length > 0) {
    insights.push({
      type: "warning",
      icon: AlertTriangle,
      title: "Budget warning",
      description: `You've used over 80% of your budget in: ${warningCategories.map((c) => c.category).join(", ")}.`,
    })
  }

  // Top spending categories
  if (topCategories.length > 0) {
    insights.push({
      type: "info",
      icon: TrendingUp,
      title: "Top spending categories",
      description: `Your highest expenses this month: ${topCategories.map(([cat, amount]) => `${cat} ($${amount.toFixed(2)})`).join(", ")}.`,
    })
  }

  // Projected spending
  if (projectedMonthlySpending > currentMonthTotal * 1.2) {
    insights.push({
      type: "warning",
      icon: TrendingUp,
      title: "Projected overspending",
      description: `Based on your current spending pattern, you're projected to spend $${projectedMonthlySpending.toFixed(2)} this month.`,
    })
  }

  // Positive insights
  const goodBudgetCategories = budgetAnalysis.filter((b) => b.status === "good" && b.spent > 0)
  if (goodBudgetCategories.length > 0) {
    insights.push({
      type: "positive",
      icon: CheckCircle,
      title: "Good budget management",
      description: `You're staying within budget in ${goodBudgetCategories.length} ${goodBudgetCategories.length === 1 ? "category" : "categories"}. Keep it up!`,
    })
  }

  const getInsightColor = (type: string) => {
    switch (type) {
      case "positive":
        return "bg-green-100 text-green-800 border-green-200"
      case "warning":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "danger":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-blue-100 text-blue-800 border-blue-200"
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Spending Insights</CardTitle>
          <CardDescription>AI-powered analysis of your financial patterns</CardDescription>
        </CardHeader>
        <CardContent>
          {insights.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Not enough data for insights. Add more transactions to see personalized recommendations.
            </div>
          ) : (
            <div className="space-y-4">
              {insights.map((insight, index) => (
                <div key={index} className={`p-4 rounded-lg border ${getInsightColor(insight.type)}`}>
                  <div className="flex items-start gap-3">
                    <insight.icon className="h-5 w-5 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-medium">{insight.title}</h3>
                      <p className="text-sm mt-1">{insight.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Budget Status</CardTitle>
            <CardDescription>How you're doing against your budgets</CardDescription>
          </CardHeader>
          <CardContent>
            {budgetAnalysis.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">No budgets set up yet</div>
            ) : (
              <div className="space-y-3">
                {budgetAnalysis.map((budget) => (
                  <div key={budget.category} className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{budget.category}</span>
                        <Badge
                          variant={
                            budget.status === "over"
                              ? "destructive"
                              : budget.status === "warning"
                                ? "secondary"
                                : "default"
                          }
                        >
                          {budget.percentUsed.toFixed(0)}%
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        ${budget.spent.toFixed(2)} of ${budget.budget.toFixed(2)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Monthly Summary</CardTitle>
            <CardDescription>Your spending this month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span>Total Spent</span>
                <span className="font-semibold">${currentMonthTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Transactions</span>
                <span className="font-semibold">{currentMonthTransactions.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Avg per Transaction</span>
                <span className="font-semibold">
                  $
                  {currentMonthTransactions.length > 0
                    ? (currentMonthTotal / currentMonthTransactions.length).toFixed(2)
                    : "0.00"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>Daily Average</span>
                <span className="font-semibold">${avgDailySpending.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
