import mongoose, { Schema } from "mongoose";

const memberSchema = new Schema({
  member_id: {
    type: Number,
    required: true,
    unique: true,
  },
  member_name: {
    type: String,
    required: true,
  },
  level: {
    type: String,
    required: true,
    default: "7",
  },
  avatar: {
    type: String,
  },
});

export default mongoose.models.Member || mongoose.model("Member", memberSchema);
