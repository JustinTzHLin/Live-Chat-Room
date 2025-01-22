"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import NavBar from "./components/navBar";
import TabsSection from "./components/tabsSection";
import ChatSection from "./components/chatSection";
import SearchSection from "./components/searchSection";
import SettingsSection from "./components/settingsSection";
import { useAuthStore } from "@/stores/authStore";
import { useUserStore, Message } from "@/stores/userStore";
import { useSocketStore } from "@/stores/socketStore";
import { useTheme } from "next-themes";
import useUnexpectedErrorHandler from "@/utils/useUnexpectedErrorHandler";
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
    setMainPageSectionFlow,
  } = useUserStore((state) => state);
  const { socket, connect } = useSocketStore((state) => state);
  const [currentTab, setCurrentTab] = useState("chatroom"); // chatroom, group, friend
  const [currentSection, setCurrentSection] = useState("tabs"); // tabs, chat, settings, search
  const router = useRouter();
  const { toast } = useToast();
  const { handleUnexpectedError } = useUnexpectedErrorHandler();
  const { setTheme } = useTheme();

  useEffect(() => {
    const verifyServerConnection = async () => {
      try {
        console.log(
          (
            await axios(`${BACKEND_URL}`, {
              withCredentials: true,
            })
          ).data
        );
      } catch (err) {
        handleUnexpectedError(err);
      }
    };
    verifyServerConnection();
  }, []);

  useEffect(() => {
    if (socket) {
      socket.emit("join_room", userInformation.userId);
      for (const conversationId in userChatData.conversations) {
        socket.emit("join_room", conversationId);
      }
    }
  }, [socket, userChatData.conversations, userInformation.userId]);

  useEffect(() => {
    setTheme(userInformation.theme);
  }, [userInformation.theme]);

  useEffect(() => {
    const onMaxRetries = () => {
      toast({
        variant: "destructive",
        title: "Connection failed",
        description: "Please refresh the page and try again later.",
        duration: 3000,
      });
      router.push("/home");
    };
    const fetchChatData = async (userId: string) => {
      try {
        const chatData = await axios.post(
          `${BACKEND_URL}/user/getChatData`,
          { userId },
          { withCredentials: true }
        );
        setUserChatData(chatData.data);
        setMainPageSectionFlow(["tabs"]);
        connect(onMaxRetries);
      } catch (err) {
        handleUnexpectedError(err);
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
          router.push("/home");
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
        }
      } catch (err) {
        router.push("/home");
        handleUnexpectedError(err, "Please login instead.");
      }
    };
    verifyLoggedInToken();
    return () => {
      useSocketStore.getState().disconnect();
    };
  }, [previousURL]);

  useEffect(() => {
    const handleSocketSentMessage = (message: Message) => {
      setCurrentChatInfo((prev) =>
        prev.conversationId === message.conversationId
          ? {
              ...prev,
              messages: prev.messages.concat(message),
            }
          : prev
      );
      setUserChatData((prev) => ({
        ...prev,
        conversations: {
          ...prev.conversations,
          [message.conversationId]: {
            ...prev.conversations[message.conversationId],
            messages:
              prev.conversations[message.conversationId].messages.concat(
                message
              ),
          },
        },
      }));
    };
    const handleSocketAcceptedFriendRequest = (request: any) => {
      setUserChatData((prev) => ({
        ...prev,
        friends: prev.friends.concat(
          request.senderId === userInformation.userId
            ? request.receiver
            : request.sender
        ),
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
  }, [socket, userInformation.userId]);

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
      ) : currentSection === "search" ? (
        <SearchSection setCurrentSection={setCurrentSection} />
      ) : null}
    </div>
  );
};

export default Page;
