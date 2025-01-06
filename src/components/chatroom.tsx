import { useState, useEffect } from "react";
import { Socket } from "socket.io-client";
import axios from "axios";

const ChatRoom = ({ socket }: { socket: Socket }) => {
  const [message, setMessage] = useState<string>("");
  const [messages, setMessages] = useState<
    Array<{ text: string; createdAt: Date }>
  >([]);
  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

  useEffect(() => {
    socket.on(
      "receive_message",
      (message: { text: string; createdAt: Date }) => {
        console.log("Received message:", message);
        setMessages((prevMessages) => [...prevMessages, message]);
      }
    );
  }, [socket]);

  const sendMessage = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (message) {
      socket.emit("send_message", {
        text: message,
        createdAt: new Date(),
      });
      setMessage("");
    }
  };

  return (
    <div>
      <ul>
        {messages.map((msg, index) => (
          <li key={index}>{msg.text}</li>
        ))}
      </ul>
      <form onSubmit={sendMessage}>
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message"
        />
        <button type="submit">Send</button>
      </form>
      <button
        onClick={async () => {
          const result = await axios(BACKEND_URL + "/test", {
            withCredentials: true,
          });
          console.log(result);
        }}
      >
        Disconnect
      </button>
    </div>
  );
};

export default ChatRoom;
