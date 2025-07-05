import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"

export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db("personal-finance")

    const budgets = await db.collection("budgets").find({}).sort({ category: 1 }).toArray()

    return NextResponse.json(budgets)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch budgets" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const client = await clientPromise
    const db = client.db("personal-finance")

    const body = await request.json()
    const { category, amount } = body

    // Validation
    if (!category || !amount) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    if (amount <= 0) {
      return NextResponse.json({ error: "Amount must be greater than 0" }, { status: 400 })
    }

    // Check if budget for this category already exists
    const existingBudget = await db.collection("budgets").findOne({ category })
    if (existingBudget) {
      return NextResponse.json({ error: "Budget for this category already exists" }, { status: 400 })
    }

    const budget = {
      category,
      amount: Number.parseFloat(amount),
      createdAt: new Date(),
    }

    const result = await db.collection("budgets").insertOne(budget)

    return NextResponse.json(
      {
        _id: result.insertedId,
        ...budget,
      },
      { status: 201 },
    )
  } catch (error) {
    return NextResponse.json({ error: "Failed to create budget" }, { status: 500 })
  }
}
