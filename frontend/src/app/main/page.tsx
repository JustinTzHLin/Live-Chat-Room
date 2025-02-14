"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Phone, PhoneOff } from "lucide-react";
import NavBar from "./components/navBar";
import TabsSection from "./components/tabsSection";
import ChatSection from "./components/chatSection";
import SearchSection from "./components/searchSection";
import SettingsSection from "./components/settingsSection";
import { useAuthStore } from "@/stores/authStore";
import { useUserStore, Message, Friend } from "@/stores/userStore";
import { useSocketStore } from "@/stores/socketStore";
import { useTheme } from "next-themes";
import useUnexpectedErrorHandler from "@/utils/useUnexpectedErrorHandler";
import axiosInstance from "@/lib/axios";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

const Page = () => {
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
  const { toast, dismiss } = useToast();
  const { handleUnexpectedError } = useUnexpectedErrorHandler();
  const { setTheme } = useTheme();
  interface CallersInfo {
    caller: Friend;
    callee: Friend;
  }

  useEffect(() => {
    const verifyServerConnection = async () => {
      try {
        console.log(
          (
            await axiosInstance(`${BACKEND_URL}`, {
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
      socket.on(
        "webrtc_call",
        (
          e: (RTCSessionDescriptionInit | RTCIceCandidateInit) & {
            newCallingId?: string;
            callingId: string;
            type: string;
            callersInfo: CallersInfo;
          }
        ) => {
          if (e.type === "call_request") {
            const { id: toastId } = toast({
              variant: "default",
              title: "Incoming call",
              description: (
                <p>
                  You have a call from <b>{e.callersInfo.caller.username}</b>
                </p>
              ),
              action: (
                <div className="flex gap-1 !mr-1">
                  <Button
                    className="h-10 w-10"
                    variant="outline"
                    onClick={async () => {
                      const callTab = window.open(
                        "",
                        "_blank",
                        "width=400,height=1000"
                      );
                      try {
                        const issueCallersInfoResponse =
                          await axiosInstance.post(
                            `${BACKEND_URL}/token/issueOtherToken`,
                            {
                              callersInfo: e.callersInfo,
                              callingId: e.newCallingId,
                            },
                            { withCredentials: true }
                          );
                        if (
                          issueCallersInfoResponse.data.generatedToken &&
                          callTab
                        ) {
                          callTab.location.href = `/stream?callersInfoToken=${issueCallersInfoResponse.data.otherToken}`;
                          // window.open(
                          //   `/stream?callersInfoToken=${issueCallersInfoResponse.data.otherToken}`,
                          //   "_blank",
                          //   "width=400,height=1000"
                          // );
                          dismiss(toastId);
                        }
                      } catch (err) {
                        callTab?.close();
                        handleUnexpectedError(err);
                      }
                    }}
                  >
                    <Phone style={{ width: "20px", height: "20px" }} />
                  </Button>
                  <Button
                    className="h-10 w-10"
                    variant="destructive"
                    onClick={() => {
                      socket.emit("webrtc_call", {
                        ...e,
                        callingId: e.callersInfo.caller.id,
                        type: "bye",
                      });
                      dismiss(toastId);
                    }}
                  >
                    <PhoneOff style={{ width: "20px", height: "20px" }} />
                  </Button>
                </div>
              ),
              duration: 1000 * 60,
            });
          }
        }
      );
      return () => {
        socket.off("webrtc_call");
      };
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
        const chatData = await axiosInstance.post(
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
        const tokenVerified = await axiosInstance(
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
      socket.on("send_message", handleSocketSentMessage);
      socket.on("accept_friend_request", handleSocketAcceptedFriendRequest);
      socket.on("create_group", handleSocketCreatedGroup);
      return () => {
        socket.off("send_message", handleSocketSentMessage);
        socket.off("accept_friend_request", handleSocketAcceptedFriendRequest);
        socket.off("create_group", handleSocketCreatedGroup);
      };
    }
  }, [socket, userInformation.userId]);

  return (
    <div className="flex flex-col h-dvh items-center min-h-[500px] min-w-[320px]">
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
