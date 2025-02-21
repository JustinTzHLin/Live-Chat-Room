// Access to Environmental Variables
import dotenv from "dotenv";
dotenv.config({ path: "./.env.local" });

// Import Dependencies
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import { createServer } from "node:http";
import { Server } from "socket.io";

// Import Routes
import userRoute from "./routes/userRoute.js";
import tokenRoute from "./routes/tokenRoute.js";
import chatRoute from "./routes/chatRoute.js";

// Setup Server
const PORT = 8000;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";
const expressServer = express();

// CORS Middleware
const corsOptions = {
  origin: FRONTEND_URL,
  credentials: true,
};
expressServer.use(cors(corsOptions));

// Other Middleware
expressServer.use(express.json({ limit: "16mb" }));
expressServer.use(express.urlencoded({ limit: "16mb", extended: true }));

// Socket.io server
const server = createServer(expressServer);
const io = new Server(server, {
  cors: {
    origin: FRONTEND_URL,
    credentials: true,
    methods: ["GET", "POST"],
  },
});

// Socket.io Events
io.on("connection", (socket) => {
  console.log(`Client connected: ${socket.id}`);

  // Handle user join room
  socket.on("join_room", (roomId) => {
    console.log(`User: ${socket.id} joined room: ${roomId}`);
    socket.join(roomId);
  });

  // Handle messages from the client
  socket.on("send_message", (message) => {
    console.log("Message received:", message);
    socket.to(message.conversationId).emit("send_message", message);
  });

  // Handle sent friend request
  socket.on("send_friend_request", (friendRequest) => {
    console.log("Friend request received:", friendRequest);
    const senderId = friendRequest.sender.senderId;
    const receiverId = friendRequest.receiver.receiverId;
    io.to(senderId).emit("send_friend_request", friendRequest);
    io.to(receiverId).emit("send_friend_request", friendRequest);
  });

  // Handle rejected or canceld friend request
  socket.on("cancel_reject_friend_request", (friendRequest) => {
    console.log("Friend request canceled or rejected:", friendRequest);
    const { senderId, receiverId } = friendRequest;
    io.to(senderId).emit("cancel_reject_friend_request", friendRequest);
    io.to(receiverId).emit("cancel_reject_friend_request", friendRequest);
  });

  // Handle accepted friend request
  socket.on("accept_friend_request", (friendRequest) => {
    console.log("Friend request accepted:", friendRequest);
    const { senderId, receiverId } = friendRequest;
    io.to(senderId).emit("accept_friend_request", friendRequest);
    io.to(receiverId).emit("accept_friend_request", friendRequest);
  });

  // Handle created group
  socket.on("create_group", (group) => {
    console.log("Group created:", group);
    for (const participantId of group.participantIDs) {
      io.to(participantId).emit("create_group", group);
    }
  });

  // Handle webrtc signal
  socket.on("webrtc_call", (data) => {
    console.log("WebRTC signal received:", data);
    socket.to(data.callingId).emit("webrtc_call", data);
  });

  // Handle call setting changes
  socket.on("change_call_setting", (data) => {
    console.log("Call setting changes received:", data);
    socket.to(data.callingId).emit("change_call_setting", data);
  });

  // Handle disconnections
  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI;
mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.log("Error connecting to MongoDB:", err);
  });

// Routes
expressServer.use("/user", userRoute);
expressServer.use("/token", tokenRoute);
expressServer.use("/chat", chatRoute);

expressServer.get("/", (req, res) => res.send("Hello World"));
expressServer.get("*", (req, res, next) =>
  next({
    log: "Express error handler caught unknown endpoint",
    status: 404,
    message: { err: "Endpoint not found" },
  })
);

// Express global error handler
expressServer.use((err, req, res, next) => {
  const defaultObj = {
    log: "Express error handler caught unknown middleware error",
    status: 500,
    message: { err: "An error occurred" },
  };
  const errObj = Object.assign({}, defaultObj, err);
  console.log(errObj.log);
  return res.status(errObj.status).json(errObj.message);
});

// Start Server
server.listen(PORT, (err) => {
  if (err) throw err;
  console.log(
    `🚀 Socket server launching on http://localhost:${PORT} under ${process.env.NODE_ENV} mode.`
  );
});
