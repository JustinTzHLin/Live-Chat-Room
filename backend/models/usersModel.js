import mongoose from "mongoose";
const { Schema } = mongoose;

const userSchema = new Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: String,
  jicId: { type: String, unique: true, default: null },
  authProvider: { type: String, default: "email" }, // email, google
  contacts: { type: [Schema.Types.ObjectId], default: [] },
  twoFactor: { type: String, default: "none" }, // none, email
  theme: { type: String, default: "system" }, // system, light, dark
  timeZone: { type: String, default: null },
  createdAt: { type: Date, default: Date.now },
  lastActive: { type: Date, default: Date.now },
});

export default mongoose.model("user", userSchema);
