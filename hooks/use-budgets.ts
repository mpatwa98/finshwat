"use client"

import { useState, useEffect } from "react"

export function useBudgets() {
  const [budgets, setBudgets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchBudgets = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/budgets")
      if (!response.ok) {
        throw new Error("Failed to fetch budgets")
      }
      const data = await response.json()
      setBudgets(data)
      setError(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBudgets()
  }, [])

  return {
    budgets,
    loading,
    error,
    refetch: fetchBudgets,
  }
}
