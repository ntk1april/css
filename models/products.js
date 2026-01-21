import mongoose, { Schema } from "mongoose";

const productSchema = new Schema({
    product_id: {
        type: Number,
        required: true,
        unique: true,
    },
    product_name: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    });

    productSchema.index({ unique: true });

export default mongoose.models.Product || mongoose.model("Product", productSchema);