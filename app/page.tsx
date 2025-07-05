"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Plus, TrendingUp, TrendingDown, DollarSign, Target } from "lucide-react"
import { TransactionForm } from "@/components/transaction-form"
import { TransactionList } from "@/components/transaction-list"
import { MonthlyExpensesChart } from "@/components/monthly-expenses-chart"
import { CategoryPieChart } from "@/components/category-pie-chart"
import { BudgetComparison } from "@/components/budget-comparison"
import { BudgetManager } from "@/components/budget-manager"
import { SpendingInsights } from "@/components/spending-insights"
import { useTransactions } from "@/hooks/use-transactions"
import { useBudgets } from "@/hooks/use-budgets"

export default function HomePage() {
  const [showTransactionForm, setShowTransactionForm] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState(null)
  const {
    transactions,
    loading: transactionsLoading,
    error: transactionsError,
    refetch: refetchTransactions,
  } = useTransactions()
  const { budgets, loading: budgetsLoading, error: budgetsError, refetch: refetchBudgets } = useBudgets()

  const currentMonth = new Date().toISOString().slice(0, 7)
  const currentMonthTransactions = transactions.filter((t) => t.date.startsWith(currentMonth))

  const totalExpenses = currentMonthTransactions.reduce((sum, t) => sum + t.amount, 0)
  const totalBudget = budgets.reduce((sum, b) => sum + b.amount, 0)
  const budgetRemaining = totalBudget - totalExpenses

  const handleEditTransaction = (transaction) => {
    setEditingTransaction(transaction)
    setShowTransactionForm(true)
  }

  const handleFormClose = () => {
    setShowTransactionForm(false)
    setEditingTransaction(null)
    refetchTransactions()
  }

  if (transactionsLoading || budgetsLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading...</div>
        </div>
      </div>
    )
  }

  if (transactionsError || budgetsError) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-red-600">Error loading data. Please try again.</div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Personal Finance Dashboard</h1>
          <p className="text-muted-foreground">Track your expenses, manage budgets, and gain insights</p>
        </div>
        <Button onClick={() => setShowTransactionForm(true)} className="w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          Add Transaction
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalExpenses.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalBudget.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Monthly budget</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Remaining Budget</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${budgetRemaining >= 0 ? "text-green-600" : "text-red-600"}`}>
              ${budgetRemaining.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">{budgetRemaining >= 0 ? "Under budget" : "Over budget"}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transactions</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentMonthTransactions.length}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="dashboard" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="budgets">Budgets</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <MonthlyExpensesChart transactions={transactions} />
            <CategoryPieChart transactions={currentMonthTransactions} />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <BudgetComparison transactions={currentMonthTransactions} budgets={budgets} />
            <Card>
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
                <CardDescription>Your latest financial activity</CardDescription>
              </CardHeader>
              <CardContent>
                <TransactionList
                  transactions={transactions.slice(0, 5)}
                  onEdit={handleEditTransaction}
                  onDelete={refetchTransactions}
                  showActions={false}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="transactions">
          <TransactionList transactions={transactions} onEdit={handleEditTransaction} onDelete={refetchTransactions} />
        </TabsContent>

        <TabsContent value="budgets">
          <BudgetManager budgets={budgets} onUpdate={refetchBudgets} />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <MonthlyExpensesChart transactions={transactions} />
            <CategoryPieChart transactions={currentMonthTransactions} />
          </div>
          <BudgetComparison transactions={currentMonthTransactions} budgets={budgets} />
        </TabsContent>

        <TabsContent value="insights">
          <SpendingInsights transactions={transactions} budgets={budgets} />
        </TabsContent>
      </Tabs>

      {showTransactionForm && <TransactionForm transaction={editingTransaction} onClose={handleFormClose} />}
    </div>
  )
}
