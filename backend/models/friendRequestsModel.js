import mongoose from "mongoose";
const { Schema } = mongoose;

const friendRequestSchema = new Schema(
  {
    senderId: { type: Schema.Types.ObjectId, required: true },
    receiverId: { type: Schema.Types.ObjectId, required: true },
    status: { type: String, default: "pending" }, // pending, accepted, rejected, canceled
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { collection: "friendRequests" }
);

export default mongoose.model("friendRequest", friendRequestSchema);
