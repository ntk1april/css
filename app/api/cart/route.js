import { NextResponse } from "next/server";
import connectDB from "@/libs/mongodb";
const Cart = require("@/models/Cart");

// GET - Fetch cart for a member
export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const member_id = searchParams.get("member_id");

    if (!member_id) {
      return NextResponse.json(
        { success: false, message: "Member ID is required" },
        { status: 400 },
      );
    }

    // Find pending cart for this member
    const cart = await Cart.findOne({
      member_id,
      status: "pending",
    }).sort({ last_updated: -1 });

    return NextResponse.json({
      success: true,
      cart: cart || null,
    });
  } catch (error) {
    console.error("Error fetching cart:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch cart" },
      { status: 500 },
    );
  }
}

// POST - Save/Update cart
export async function POST(request) {
  try {
    await connectDB();

    const { member_id, member_name, items, total_amount } =
      await request.json();

    if (!member_id || !member_name) {
      return NextResponse.json(
        { success: false, message: "Member ID and name are required" },
        { status: 400 },
      );
    }

    // Find existing pending cart or create new one
    let cart = await Cart.findOne({
      member_id,
      status: "pending",
    });

    if (cart) {
      // Update existing cart
      cart.items = items || [];
      cart.total_amount = total_amount || 0;
      cart.last_updated = new Date();
      await cart.save();
    } else {
      // Create new cart
      cart = await Cart.create({
        member_id,
        member_name,
        items: items || [],
        total_amount: total_amount || 0,
        status: "pending",
      });
    }

    return NextResponse.json({
      success: true,
      message: "Cart saved successfully",
      cart,
    });
  } catch (error) {
    console.error("Error saving cart:", error);
    return NextResponse.json(
      { success: false, message: "Failed to save cart" },
      { status: 500 },
    );
  }
}

// DELETE - Clear cart (mark as completed or delete)
export async function DELETE(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const member_id = searchParams.get("member_id");
    const action = searchParams.get("action"); // 'complete' or 'delete'

    if (!member_id) {
      return NextResponse.json(
        { success: false, message: "Member ID is required" },
        { status: 400 },
      );
    }

    if (action === "complete") {
      // Mark as completed (for transaction history)
      await Cart.updateOne(
        { member_id, status: "pending" },
        { status: "completed", last_updated: new Date() },
      );
    } else {
      // Delete the cart
      await Cart.deleteOne({ member_id, status: "pending" });
    }

    return NextResponse.json({
      success: true,
      message: "Cart cleared successfully",
    });
  } catch (error) {
    console.error("Error clearing cart:", error);
    return NextResponse.json(
      { success: false, message: "Failed to clear cart" },
      { status: 500 },
    );
  }
}
