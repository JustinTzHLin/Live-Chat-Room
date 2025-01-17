"use client";
import { useEffect } from "react";
import ChatRoom from "@/components/chatroom";
import { useSocketStore } from "@/stores/socketStore";

const Page = () => {
  const connect = useSocketStore((state) => state.connect);

  useEffect(() => {
    connect();
    return () => {
      useSocketStore.getState().disconnect();
    };
  }, [connect]);

  return <ChatRoom />;
};

export default Page;
