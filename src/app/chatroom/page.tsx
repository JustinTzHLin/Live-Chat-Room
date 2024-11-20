"use client";
import ChatRoom from "@/components/chatroom";
import { io } from "socket.io-client";

const Page = () => {
  const BACKEND_URL =
    process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
  const socket = io(BACKEND_URL);

  return <ChatRoom socket={socket} />;
};

export default Page;
