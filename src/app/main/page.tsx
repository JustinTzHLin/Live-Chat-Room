"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import NavBar from "./components/navBar";
import TabsSection from "./components/tabsSection";
import ChatSection from "./components/chatSection";
import SettingsSection from "./components/settingsSection";
import { useAuthStore } from "@/stores/authStore";
import { useUserStore } from "@/stores/userStore";
import { useSocketStore } from "@/stores/socketStore";
import axios from "axios";

const Page = () => {
  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
  const { previousURL } = useAuthStore((state) => state);
  const {
    userInformation,
    setUserInformation,
    userChatData,
    setUserChatData,
    setCurrentChatInfo,
  } = useUserStore((state) => state);
  const { socket, connect } = useSocketStore((state) => state);
  const [currentTab, setCurrentTab] = useState("chatroom"); // chatroom, group, friend
  const [currentSection, setCurrentSection] = useState("tabs"); // tabs, chat, settings
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (socket) {
      socket.emit("join_room", userInformation.userId);
      for (const conversationId in userChatData.conversations) {
        socket.emit("join_room", conversationId);
      }
    }
  }, [socket, userChatData.conversations, userInformation.userId]);

  useEffect(() => {
    const fetchChatData = async (userId: string) => {
      try {
        const chatData = await axios.post(
          `${BACKEND_URL}/user/getChatData`,
          { userId },
          { withCredentials: true }
        );
        setUserChatData(chatData.data);
        connect();
      } catch (err) {
        console.log(err);
      }
    };
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
    verifyLoggedInToken();
    return () => {
      useSocketStore.getState().disconnect();
    };
  }, [
    BACKEND_URL,
    connect,
    previousURL,
    router,
    setUserChatData,
    setUserInformation,
    toast,
  ]);

  useEffect(() => {
    const handleSocketSentMessage = (message: any) => {
      setUserChatData((prev) => {
        return {
          ...prev,
          conversations: {
            ...prev.conversations,
            [message.conversationId]: {
              ...prev.conversations[message.conversationId],
              messages: [
                ...prev.conversations[message.conversationId].messages,
                message,
              ],
            },
          },
        };
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
      setUserChatData((prev) => ({
        ...prev,
        friends: [
          ...prev.friends,
          request.senderId === userInformation.userId
            ? request.receiver
            : request.sender,
        ],
      }));
    };
    const handleSocketCreatedGroup = (group: any) => {
      setUserChatData((prev) => ({
        ...prev,
        conversations: {
          ...prev.conversations,
          [group._id]: {
            conversationId: group._id,
            participantIDs: group.participantIDs,
            messages: [],
            roomName: group.roomName,
            type: "group",
          },
        },
      }));
    };
    // send data and save it on server
    if (socket) {
      socket.on("receive_message", handleSocketSentMessage);
      socket.on("accepted_friend_request", handleSocketAcceptedFriendRequest);
      socket.on("group_created", handleSocketCreatedGroup);
      return () => {
        socket.off("receive_message", handleSocketSentMessage);
        socket.off(
          "accepted_friend_request",
          handleSocketAcceptedFriendRequest
        );
        socket.off("group_created", handleSocketCreatedGroup);
      };
    }
  }, [setCurrentChatInfo, setUserChatData, socket, userInformation.userId]);

  return (
    <div className="flex flex-col h-screen items-center min-h-[500px] min-w-[320px]">
      <NavBar setCurrentSection={setCurrentSection} />
      {currentSection === "tabs" ? (
        <TabsSection
          currentTab={currentTab}
          setCurrentTab={setCurrentTab}
          setCurrentSection={setCurrentSection}
        />
      ) : currentSection === "chat" ? (
        <ChatSection setCurrentSection={setCurrentSection} />
      ) : currentSection === "settings" ? (
        <SettingsSection setCurrentSection={setCurrentSection} />
      ) : null}
    </div>
  );
};

export default Page;
