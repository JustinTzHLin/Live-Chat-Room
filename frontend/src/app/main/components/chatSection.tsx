import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Send, ChevronLeft, Phone } from "lucide-react";
import { useUserStore } from "@/stores/userStore";
import { useSocketStore } from "@/stores/socketStore";
import timestampToFormattedTime from "@/utils/timestampToFormattedTime";
import useUnexpectedErrorHandler from "@/utils/useUnexpectedErrorHandler";
import axiosInstance from "@/lib/axios";

const ChatSection = ({
  setCurrentSection,
}: {
  setCurrentSection: (section: string) => void;
}) => {
  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
  const {
    userInformation,
    userChatData,
    setUserChatData,
    currentChatInfo,
    setCurrentChatInfo,
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
        const timestampNow = new Date().toISOString().replace("Z", "+00:00");
        const newMessage = {
          senderId: userInformation.userId,
          senderName: userInformation.username,
          content: inputMessage,
          timestamp: timestampNow,
          readBy: [],
          status: "sent",
          conversationId: currentChatInfo.conversationId,
        };
        setCurrentChatInfo({
          ...currentChatInfo,
          messages: [...currentChatInfo.messages, newMessage],
        });
        setUserChatData((prev) => ({
          ...prev,
          conversations: {
            ...prev.conversations,
            [currentChatInfo.conversationId]: {
              ...prev.conversations[currentChatInfo.conversationId],
              messages:
                prev.conversations[
                  currentChatInfo.conversationId
                ].messages.concat(newMessage),
            },
          },
        }));
        const sendMessageResponse = await axiosInstance.post(
          `${BACKEND_URL}/chat/sendMessage`,
          {
            senderId: userInformation.userId,
            content: inputMessage,
            conversationId: currentChatInfo.conversationId,
            timestamp: timestampNow,
          },
          { withCredentials: true }
        );
        if (sendMessageResponse.data.success) {
          socket.emit("send_message", newMessage);
          setInputMessage("");
        } else throw new Error("Message not sent");
      } catch (err) {
        handleUnexpectedError(err);
      }
    }
  };

  const handleCalltoFriend = async () => {
    const callee = userChatData.friends.find(
      (friend) =>
        friend.id ===
        currentChatInfo.participantIDs.find(
          (id) => id !== userInformation.userId
        )
    );
    const callersInfo = {
      caller: {
        id: userInformation.userId,
        username: userInformation.username,
        email: userInformation.email,
      },
      callee,
    };
    const callTab = window.open("", "_blank", "width=400,height=1000");
    try {
      const issueCallersInfoResponse = await axiosInstance.post(
        `${BACKEND_URL}/token/issueOtherToken`,
        callersInfo,
        { withCredentials: true }
      );
      if (issueCallersInfoResponse.data.generatedToken && callTab)
        callTab.location.href = `/stream?callersInfoToken=${issueCallersInfoResponse.data.otherToken}`;
    } catch (err) {
      callTab?.close();
      handleUnexpectedError(err);
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
        <Button
          variant="ghost"
          size="icon"
          type="button"
          className={cn(
            "text-muted-foreground rounded-lg w-10 h-10 absolute right-2",
            currentChatInfo.type === "group" && "hidden"
          )}
          onClick={handleCalltoFriend}
        >
          <Phone style={{ width: "24px", height: "24px" }} />
        </Button>
      </div>
      <ScrollArea className="w-full h-[calc(100%-120px)] flex flex-col px-4 pt-2">
        {currentChatInfo.messages.map((message, index) => {
          return (
            <div
              key={`message_${index}`}
              className={cn(
                "w-full flex flex-col mb-2",
                message.senderId === userInformation.userId
                  ? "items-end"
                  : "items-start"
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
              </div>
              <div className="text-xs text-muted-foreground mx-1 my-0.5">
                {userInformation.userId === message.senderId
                  ? "You"
                  : message.senderName}
              </div>
            </div>
          );
        })}
      </ScrollArea>
      <div className="flex w-full h-[80px] px-4 items-center">
        <form onSubmit={sendMessage} className="w-full flex gap-1.5">
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
            <Send style={{ width: "26px", height: "26px" }} />
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ChatSection;
