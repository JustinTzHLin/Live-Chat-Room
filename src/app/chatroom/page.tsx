"use client";
import ChatRoom from "@/components/chatroom";
import { io } from "socket.io-client";

const Page = () => {
  const socket = io("http://localhost:8000");

  return <ChatRoom socket={socket} />;
};

export default Page;
