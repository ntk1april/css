import connectDB from "@/libs/mongodb";
import Product from "@/models/products";
import { NextResponse } from "next/server";

export async function GET({ params }) {
  await connectDB();
  const { id } = params;
  const product = await Product.findById(id);
  return NextResponse.json(product, { status: 200 });
}

export async function PUT(req, { params }) {
  await connectDB();
  const { id } = params;
  const body = await req.json();

  try {
    // Check if this is a simple stock update (only amount field)
    if (body.amount !== undefined && Object.keys(body).length === 1) {
      // Simple stock update
      const product = await Product.findByIdAndUpdate(
        id,
        { amount: body.amount },
        { new: true, runValidators: true },
      );

      if (!product) {
        return NextResponse.json(
          { error: "Product not found" },
          { status: 404 },
        );
      }

      return NextResponse.json(product, { status: 200 });
    }

    // Full product update (old format)
    const {
      newProductId: product_id,
      newProductName: product_name,
      newPrice: price,
      newAmount: amount,
    } = body;

    // Check if new product_id already exists (if changing ID)
    if (product_id) {
      const existing = await Product.findOne({ product_id, _id: { $ne: id } });
      if (existing) {
        return NextResponse.json(
          { error: "Product ID already exists" },
          { status: 400 },
        );
      }
    }

    const product = await Product.findByIdAndUpdate(
      id,
      {
        product_id,
        product_name,
        price,
        amount,
      },
      { new: true, runValidators: true },
    );

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Product updated" }, { status: 200 });
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 },
    );
  }
}
