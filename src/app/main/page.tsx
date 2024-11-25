"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Search,
  EllipsisVertical,
  Bolt,
  ArrowBigLeft,
  ArrowLeft,
  ArrowLeftFromLine,
  ArrowLeftToLine,
  ChevronLeft,
  MoveLeft,
  Undo2,
} from "lucide-react";
import { useAuthStore } from "@/providers/auth-store-provider";
import axios from "axios";

const Page = () => {
  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
  const { previousURL, updatePreviousURL } = useAuthStore((state) => state);
  const router = useRouter();
  const { toast } = useToast();
  const [userInformation, setUserInformation] = useState<{
    userId: string;
    username: string;
    email: string;
    createdAt: Date;
    lastActive: Date;
  }>({
    userId: "",
    username: "",
    email: "",
    createdAt: new Date(),
    lastActive: new Date(),
  });
  const [userChatData, setUserChatData] = useState<{
    conversations: any[];
    friends: any[];
  }>({
    conversations: [],
    friends: [],
  });
  const [currentTab, setCurrentTab] = useState("chatroom"); // chatroom, group, contact
  const [currentSection, setCurrentSection] = useState("tabs"); // tabs, chats
  const [currentChatInfo, setCurrentChatInfo] = useState<{
    messages: any[];
    participantsIDs: string[];
    roomName: string;
    type: string;
  }>({
    messages: [],
    participantsIDs: [],
    roomName: "",
    type: "",
  });
  useEffect(() => {
    const verifyLoggedInToken = async () => {
      try {
        const tokenVerified = await axios(
          BACKEND_URL + "/token/verifyLoggedInToken",
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
          return tokenVerified.data.user.userId;
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
          router.push("/home");
          return false;
        }
      } catch (err) {
        console.log(err);
        toast({
          variant: "destructive",
          title: "Error occurred",
          description: "Something went wrong. Please login instead.",
          duration: 3000,
        });
        router.push("/home");
        return false;
      }
    };
    const fetchChatData = async (userId: string) => {
      try {
        const chatData = await axios.post(
          BACKEND_URL + "/user/getChatData",
          { userId },
          { withCredentials: true }
        );
        setUserChatData(chatData.data);
        console.log(chatData);
      } catch (err) {
        console.log(err);
      }
    };
    const verifyAndFetchUser = async () => {
      const userVerifiedId = await verifyLoggedInToken();
      if (userVerifiedId) fetchChatData(userVerifiedId);
    };
    verifyAndFetchUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getNameInitials = (name: string) => {
    const nameWords = name.split(" ");
    let initials = "";
    if (nameWords.length > 3) {
      initials += nameWords[0][0] + nameWords[nameWords.length - 1][0];
    } else if (nameWords.length === 3) {
      initials += nameWords[0][0] + nameWords[1][0] + nameWords[2][0];
    } else {
      nameWords.forEach((word) => {
        initials += word[0];
      });
    }
    return initials.toUpperCase();
  };
  return (
    <div className="flex flex-col h-screen items-center min-h-[500px] min-w-[320px]">
      <div className="flex w-full">
        <div className="w-1/2 p-4">
          <div className="text-sm text-muted-foreground">Welcome,</div>
          <div className="text-xl font-semibold">
            {userInformation?.username}
          </div>
        </div>
        <div className="flex w-1/2 items-center justify-end pr-4 gap-1">
          <Button
            variant="ghost"
            size="icon"
            type="button"
            className="text-muted-foreground rounded-full w-10 h-10"
            onClick={() => {
              alert("search");
            }}
          >
            <Search style={{ width: "26px", height: "26px" }} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            type="button"
            className="text-muted-foreground rounded-full w-10 h-10"
            onClick={() => {
              alert("menu");
            }}
          >
            <EllipsisVertical style={{ width: "26px", height: "26px" }} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            type="button"
            className="text-muted-foreground rounded-full w-10 h-10"
            onClick={() => {
              alert("setting");
            }}
          >
            <Bolt style={{ width: "26px", height: "26px" }} />
          </Button>
        </div>
      </div>
      {currentSection === "tabs" ? (
        <Tabs
          defaultValue="chatroom"
          onValueChange={(value) => setCurrentTab(value)}
          className="w-full px-2 h-[calc(100%-80px)]"
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="chatroom">All Chats</TabsTrigger>
            <TabsTrigger value="group">Groups</TabsTrigger>
            <TabsTrigger value="contact">Contacts</TabsTrigger>
          </TabsList>
          <TabsContent value="chatroom" className="h-[calc(100%-44px)]">
            <div className="flex flex-col justify-center gap-2">
              {userChatData.conversations.map((chatInfo, index) => (
                <div
                  key={"chat_" + index}
                  className="flex items-center justify-between gap-2 p-2 hover:bg-slate-100 hover:cursor-pointer rounded-lg"
                  onClick={() => {
                    setCurrentSection("chat");
                    setCurrentChatInfo(chatInfo);
                  }}
                >
                  <div>{chatInfo.roomName}</div>
                  <div className="text-xs text-muted-foreground">
                    {chatInfo.participantIDs.length} members
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
          <TabsContent value="group" className="h-[calc(100%-44px)]">
            <div className="flex flex-col justify-center gap-2">
              {userChatData.conversations
                .filter((conversation) => conversation.type === "group")
                .map((groupInfo, index) => (
                  <div
                    key={"group_" + index}
                    className="flex items-center justify-between gap-2 p-2 hover:bg-slate-100 hover:cursor-pointer rounded-lg"
                    onClick={() => {
                      setCurrentSection("chat");
                      setCurrentChatInfo(groupInfo);
                    }}
                  >
                    <div>{groupInfo.roomName}</div>
                    <div className="text-xs text-muted-foreground">
                      {groupInfo.participantIDs.length} members
                    </div>
                  </div>
                ))}
            </div>
          </TabsContent>
          <TabsContent value="contact" className="h-[calc(100%-44px)]">
            <div className="flex flex-col justify-center gap-1">
              {userChatData.friends.map((friendInfo, index) => (
                <div
                  key={"friend_" + index}
                  className="flex items-center justify-between gap-2 p-1 hover:bg-slate-100 hover:cursor-pointer rounded-lg"
                >
                  <Avatar>
                    <AvatarFallback className="bg-slate-200 font-semibold text-lg">
                      {getNameInitials(friendInfo.username)}
                    </AvatarFallback>
                  </Avatar>
                  {friendInfo.username} {friendInfo.email}
                  <div></div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      ) : (
        <div className="w-full px-2 h-[calc(100%-80px)] flex flex-col">
          <div className="w-full flex items-center justify-between">
            <Button
              variant="ghost"
              size="icon"
              type="button"
              className="text-muted-foreground rounded-full w-10 h-10"
              onClick={() => {
                setCurrentSection("tabs");
              }}
            >
              <ChevronLeft style={{ width: "26px", height: "26px" }} />
            </Button>
            {/*

  ArrowBigLeft,
  ArrowLeft,
  ArrowLeftToLine,
  ChevronLeft,
            */}

            <div className="">Centered Content</div>
            <div className="w-[40px]"></div>
          </div>
        </div>
      )}
      <Toaster />
    </div>
  );
};

export default Page;
