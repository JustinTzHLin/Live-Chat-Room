import mongoose from "mongoose";
const { Schema } = mongoose;

const profilePicSchema = new Schema({
  name: String,
  size: Number,
  type: String,
  buffer: Buffer,
});

const userSchema = new Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: String,
  jicId: { type: String, unique: true, default: null },
  authProvider: { type: String, enum: ["email", "google"], default: "email" },
  contacts: { type: [Schema.Types.ObjectId], default: [] },
  twoFactor: { type: String, enum: ["none", "email"], default: "none" },
  theme: { type: String, enum: ["system", "light", "dark"], default: "system" },
  timeZone: { type: String, default: null },
  profilePic: {
    type: profilePicSchema,
    default: null,
  },
  createdAt: { type: Date, default: Date.now },
  lastActive: { type: Date, default: Date.now },
});

export default mongoose.model("user", userSchema);
