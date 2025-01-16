"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import NavBar from "./components/navBar";
import TabsSection from "./components/tabsSection";
import ChatSection from "./components/chatSection";
import SettingsSection from "./components/settingsSection";
import { useAuthStore } from "@/stores/authStore";
import { useUserStore } from "@/stores/userStore";
import { io } from "socket.io-client";
import axios from "axios";

const Page = () => {
  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
  const { previousURL } = useAuthStore((state) => state);
  const router = useRouter();
  const { toast } = useToast();
  const {
    userInformation,
    setUserInformation,
    setUserChatData,
    setCurrentChatInfo,
  } = useUserStore((state) => state);
  const [currentTab, setCurrentTab] = useState("chatroom"); // chatroom, group, friend
  const [currentSection, setCurrentSection] = useState("tabs"); // tabs, chat, settings
  const [socket, setSocket] = useState<any>(null);

  const verifyLoggedInToken = async () => {
    try {
      const tokenVerified = await axios(
        `${BACKEND_URL}/token/verifyLoggedInToken`,
        { withCredentials: true }
      );
      if (tokenVerified.data.tokenVerified) {
        if (previousURL !== "/home")
          toast({
            title: "Token verified",
            description: "Welcome back!",
            duration: 3000,
          });
        setUserInformation(tokenVerified.data.user);
        fetchChatData(tokenVerified.data.user.userId);
      } else {
        if (tokenVerified.data.errorMessage === "no token found")
          toast({
            title: "No token found",
            description: "Please login instead.",
            duration: 3000,
          });
        else if (tokenVerified.data.errorMessage === "jwt malformed")
          toast({
            variant: "destructive",
            title: "Token malformed",
            description: "The token is malformed. Please login instead.",
            duration: 3000,
          });
        else if (tokenVerified.data.errorMessage === "jwt expired")
          toast({
            variant: "destructive",
            title: "Token expired",
            description: "The token has expired. Please login instead.",
            duration: 3000,
          });
        else throw new Error("Token not verified");
        return router.push("/home");
      }
    } catch (err) {
      console.log(err);
      toast({
        variant: "destructive",
        title: "Error occurred",
        description: "Something went wrong. Please login instead.",
        duration: 3000,
      });
      return router.push("/home");
    }
  };

  const fetchChatData = async (userId: string) => {
    try {
      const chatData = await axios.post(
        `${BACKEND_URL}/user/getChatData`,
        { userId },
        { withCredentials: true }
      );
      setUserChatData(chatData.data);
      setSocket(io(BACKEND_URL));
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    const verifyAndFetchUser = async () => {
      await verifyLoggedInToken();
    };
    verifyAndFetchUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSocketSentMessage = (message: any) => {
    setUserChatData((prev) => {
      if (message.conversationId in prev.conversations) {
        const updatedConversation = {
          ...prev.conversations[message.conversationId],
          messages: [
            ...prev.conversations[message.conversationId].messages,
            message,
          ],
        };
        return {
          ...prev,
          conversations: {
            ...prev.conversations,
            [message.conversationId]: updatedConversation,
          },
        };
      } else return prev;
    });
    setCurrentChatInfo((prev) => {
      if (prev.conversationId === message.conversationId) {
        return {
          ...prev,
          messages: [...prev.messages, message],
        };
      } else return prev;
    });
  };

  const handleSocketAcceptedFriendRequest = (request: any) => {
    setUserChatData((prev) => {
      if (
        request.senderId === userInformation.userId ||
        request.receiverId === userInformation.userId
      ) {
        return {
          ...prev,
          friends: [
            ...prev.friends,
            request.senderId === userInformation.userId
              ? request.receiver
              : request.sender,
          ],
        };
      } else return prev;
    });
  };

  useEffect(() => {
    // send data and save it on server
    if (socket) {
      socket.on("receive_message", handleSocketSentMessage);
      socket.on("accepted_friend_request", handleSocketAcceptedFriendRequest);
      return () => {
        socket.off("receive_message", handleSocketSentMessage);
        socket.off(
          "accepted_friend_request",
          handleSocketAcceptedFriendRequest
        );
      };
    }
  }, [socket]);

  return (
    <div className="flex flex-col h-screen items-center min-h-[500px] min-w-[320px]">
      <NavBar setCurrentSection={setCurrentSection} socket={socket} />
      {currentSection === "tabs" ? (
        <TabsSection
          currentTab={currentTab}
          setCurrentTab={setCurrentTab}
          setCurrentSection={setCurrentSection}
        />
      ) : currentSection === "chat" ? (
        <ChatSection setCurrentSection={setCurrentSection} socket={socket} />
      ) : currentSection === "settings" ? (
        <SettingsSection setCurrentSection={setCurrentSection} />
      ) : null}
    </div>
  );
};

export default Page;
