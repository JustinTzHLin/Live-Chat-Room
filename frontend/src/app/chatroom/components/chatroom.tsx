import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import useSocketStore from "@/stores/socketStore";

const ChatRoom = () => {
  const socket = useSocketStore((state) => state.socket);
  const [message, setMessage] = useState<string>("");
  const [messages, setMessages] = useState<
    Array<{ text: string; createdAt: Date }>
  >([]);

  useEffect(() => {
    if (socket) {
      socket.emit("join_conversation", "global");
      socket.on(
        "receive_message",
        (message: {
          text: string;
          createdAt: Date;
          conversationId: string;
        }) => {
          console.log("Received message:", message);
          setMessages((prevMessages) => [...prevMessages, message]);
        }
      );
    }
  }, [socket]);

  const sendMessage = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    console.log("Sending message:", message);
    if (message) {
      setMessages((prevMessages) => [
        ...prevMessages,
        { text: message, createdAt: new Date() },
      ]);
      socket.emit("send_message", {
        conversationId: "global",
        text: message,
        createdAt: new Date(),
      });
      setMessage("");
    }
  };

  return (
    <div className="w-full h-dvh flex flex-col gap-2 p-4">
      <h1 className="text-2xl text-center font-bold">Global Chat Room</h1>
      <div className="flex flex-col flex-1 gap-2 border rounded-md p-2">
        {messages.map((msg, index) => (
          <div key={index} className="flex flex-col justify-between px-2">
            <div className="text-base break-words">{msg.text}</div>
            <div className="text-xs text-muted-foreground">
              {msg.createdAt.toLocaleString("en-US", {
                year: "numeric",
                month: "numeric",
                day: "numeric",
                hour: "numeric",
                minute: "numeric",
                hour12: true,
              })}
            </div>
          </div>
        ))}
      </div>
      <form className="flex gap-2" onSubmit={sendMessage}>
        <Input
          className="break-words"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message"
        />
        <Button type="submit">Send</Button>
      </form>
    </div>
  );
};

export default ChatRoom;
