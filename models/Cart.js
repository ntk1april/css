const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema(
  {
    member_id: {
      type: String,
      required: true,
      index: true,
    },
    member_name: {
      type: String,
      required: true,
    },
    items: [
      {
        _id: String,
        product_id: String,
        product_name: String,
        price: Number,
        quantity: Number,
      },
    ],
    total_amount: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["pending", "completed", "cancelled"],
      default: "pending",
    },
    last_updated: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

// Index for faster queries
cartSchema.index({ member_id: 1, status: 1 });

const Cart = mongoose.models.Cart || mongoose.model("Cart", cartSchema);

module.exports = Cart;
