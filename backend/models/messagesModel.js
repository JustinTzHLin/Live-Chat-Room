import mongoose from "mongoose";
const { Schema } = mongoose;

const messageSchema = new Schema({
  conversationId: { type: Schema.Types.ObjectId, required: true },
  senderId: { type: Schema.Types.ObjectId, required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  readBy: { type: [Schema.Types.ObjectId], default: [] },
  status: { type: String, default: "sent" }, // sent, delivered, read
});

export default mongoose.model("message", messageSchema);
