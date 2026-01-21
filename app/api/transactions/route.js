import connectDB from "@/libs/mongodb";
import Transaction from "@/models/transactions";
import { NextResponse } from "next/server";

export async function GET(req) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const filter = searchParams.get("filter"); // 'day', 'month', 'all'
  const date = searchParams.get("date"); // optional specific date

  let query = {};

  if (filter === "day") {
    const today = date ? new Date(date) : new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));
    query.transaction_date = { $gte: startOfDay, $lte: endOfDay };
  } else if (filter === "month") {
    const targetDate = date ? new Date(date) : new Date();
    const startOfMonth = new Date(
      targetDate.getFullYear(),
      targetDate.getMonth(),
      1,
    );
    const endOfMonth = new Date(
      targetDate.getFullYear(),
      targetDate.getMonth() + 1,
      0,
      23,
      59,
      59,
      999,
    );
    query.transaction_date = { $gte: startOfMonth, $lte: endOfMonth };
  }
  // if filter === 'all', query remains empty and returns all transactions

  const transactions = await Transaction.find(query).sort({
    transaction_date: -1,
  });
  return NextResponse.json(transactions);
}

export async function POST(req) {
  await connectDB();
  const {
    transaction_id,
    member_id,
    member_name,
    products,
    total_amount,
    paid_amount,
    change_amount,
  } = await req.json();

  const existingTransaction = await Transaction.findOne({ transaction_id });
  if (existingTransaction) {
    return NextResponse.json(
      { error: "Transaction ID already exists" },
      { status: 400 },
    );
  }

  await Transaction.create({
    transaction_id,
    member_id,
    member_name,
    products,
    total_amount,
    paid_amount,
    change_amount,
  });

  return NextResponse.json({ message: "Transaction added" }, { status: 201 });
}
