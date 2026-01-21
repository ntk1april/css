import mongoose, { Schema } from "mongoose";

const transactionSchema = new Schema({
  transaction_id: {
    type: String,
    required: true,
    unique: true,
  },
  member_id: {
    type: Number,
    required: true,
  },
  member_name: {
    type: String,
    required: true,
  },
  products: [
    {
      product_id: Number,
      product_name: String,
      price: Number,
      quantity: Number,
      subtotal: Number,
    },
  ],
  total_amount: {
    type: Number,
    required: true,
  },
  paid_amount: {
    type: Number,
    required: true,
  },
  change_amount: {
    type: Number,
    required: true,
  },
  transaction_date: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Transaction ||
  mongoose.model("Transaction", transactionSchema);
