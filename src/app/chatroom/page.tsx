"use client";
import { useEffect } from "react";
import ChatRoom from "@/components/chatroom";
import { useSocketStore } from "@/stores/socketStore";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

const Page = () => {
  const connect = useSocketStore((state) => state.connect);
  const { toast } = useToast();
  const router = useRouter();
  const onMaxRetries = () => {
    toast({
      variant: "destructive",
      title: "Connection failed",
      description: "Please refresh the page and try again later.",
      duration: 3000,
    });
    router.push("/home");
  };
  useEffect(() => {
    connect(onMaxRetries);
    return () => {
      useSocketStore.getState().disconnect();
    };
  }, [connect]);

  return <ChatRoom />;
};

export default Page;
