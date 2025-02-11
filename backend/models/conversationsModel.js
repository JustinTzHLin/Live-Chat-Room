import mongoose from "mongoose";
const { Schema } = mongoose;

const conversationSchema = new Schema({
  type: { type: String, required: true }, // private, group
  participantIDs: [Schema.Types.ObjectId],
  roomName: { type: String, required: true },
  mode: { type: String, default: "persistent" }, // persistent, temporary
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.model("conversation", conversationSchema);
