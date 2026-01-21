import connectDB from "@/libs/mongodb";
import Product from "@/models/products";
import { NextResponse } from "next/server";

export async function GET() {
  await connectDB();
  const products = await Product.find({});
  return NextResponse.json(products);
}

export async function POST(req) {
  await connectDB();
  const { product_id, product_name, price, amount } = await req.json();
  const existingProduct = await Product.findOne({ product_id });
  if (existingProduct) {
    return NextResponse.json(
      { error: "Product ID already exists" },
      { status: 400 }
    );
  }
  await Product.create({ product_id, product_name, price, amount });
  return NextResponse.json({ message: "Product added" }, { status: 201 });
}

export async function DELETE(req) {
  await connectDB();
  const id = req.nextUrl.searchParams.get("id");
  await Product.findByIdAndDelete(id);
  return NextResponse.json({ message: "Product deleted" }, { status: 201 });
}
