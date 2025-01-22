import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { SendHorizontal, ChevronLeft } from "lucide-react";
import { useUserStore } from "@/stores/userStore";
import { useSocketStore } from "@/stores/socketStore";
import timestampToFormattedTime from "@/utils/timestampToFormattedTime";
import useUnexpectedErrorHandler from "@/utils/useUnexpectedErrorHandler";
import axios from "axios";

const ChatSection = ({
  setCurrentSection,
}: {
  setCurrentSection: (section: string) => void;
}) => {
  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
  const {
    userInformation,
    currentChatInfo,
    mainPageSectionFlow,
    setMainPageSectionFlow,
  } = useUserStore((state) => state);
  const socket = useSocketStore((state) => state.socket);
  const [inputMessage, setInputMessage] = useState<string>("");
  const { handleUnexpectedError } = useUnexpectedErrorHandler();

  const sendMessage = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (inputMessage) {
      try {
        await axios.post(
          `${BACKEND_URL}/chat/sendMessage`,
          {
            senderId: userInformation.userId,
            content: inputMessage,
            conversationId: currentChatInfo.conversationId,
          },
          { withCredentials: true }
        );
        socket.emit("send_message", {
          senderId: userInformation.userId,
          content: inputMessage,
          timestamp: new Date().toISOString().replace("Z", "+00:00"),
          readBy: [],
          status: "sent",
          conversationId: currentChatInfo.conversationId,
        });
        setInputMessage("");
      } catch (err) {
        handleUnexpectedError(err);
      }
    }
  };

  return (
    <div className="w-full h-[calc(100%-80px)] flex flex-col items-center">
      <div className="w-full flex items-center justify-center h-10">
        <Button
          variant="ghost"
          size="icon"
          type="button"
          className="text-muted-foreground rounded-full w-10 h-10 absolute left-2"
          onClick={() => {
            setCurrentSection(mainPageSectionFlow.at(-2) || "tabs");
            setMainPageSectionFlow(mainPageSectionFlow.slice(0, -1));
          }}
        >
          <ChevronLeft style={{ width: "26px", height: "26px" }} />
        </Button>
        <div className="text-xl font-semibold">{currentChatInfo.roomName}</div>
      </div>
      <ScrollArea className="w-full h-[calc(100%-120px)] flex flex-col px-4">
        {currentChatInfo.messages.map((message, index) => {
          return (
            <div
              key={`message_${index}`}
              className={cn(
                "w-full flex mb-2",
                message.senderId === userInformation.userId
                  ? "justify-end"
                  : "justify-start"
              )}
            >
              <div
                className={cn(
                  "flex flex-col p-2 hover:cursor-pointer rounded-xl",
                  message.senderId === userInformation.userId
                    ? "items-end rounded-br-none bg-slate-800 dark:bg-slate-700"
                    : "items-end rounded-bl-none bg-slate-100 dark:bg-slate-800"
                )}
              >
                <div
                  className={cn(
                    "px-2 pt-1 text-lg",
                    message.senderId === userInformation.userId
                      ? "text-white"
                      : ""
                  )}
                >
                  {message.content}
                </div>
                <div
                  className={cn(
                    "text-sm",
                    message.senderId === userInformation.userId
                      ? "text-white"
                      : ""
                  )}
                >
                  {timestampToFormattedTime(
                    message.timestamp,
                    userInformation.timeZone
                  )}
                </div>
                {/* <div className="text-xs text-muted-foreground">
                    {userChatData.friends.find(
                      (friend) => friend.id === message.senderId
                    )?.username ||
                      (userInformation.userId === message.senderId
                        ? "You"
                        : "Unknown")}
                  </div> */}
              </div>
            </div>
          );
        })}
      </ScrollArea>
      <div className="flex w-full h-[80px] px-4 items-center">
        <form onSubmit={sendMessage} className="w-full flex gap-2">
          <Input
            type="text"
            placeholder="Type a message"
            className="w-full h-10 rounded-lg bg-slate-50 dark:bg-slate-800"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            autoFocus
          />
          <Button
            variant="ghost"
            size="icon"
            type="submit"
            className="text-muted-foreground w-10 h-10"
          >
            <SendHorizontal style={{ width: "26px", height: "26px" }} />
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ChatSection;
