"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, EllipsisVertical, Settings, Bolt } from "lucide-react";
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
  const [currentTab, setCurrentTab] = useState("chatroom");
  useEffect(() => {
    const verifyLoggedInToken = async () => {
      try {
        const tokenVerified = await axios(
          BACKEND_URL + "/token/verifyLoggedInToken",
          { withCredentials: true }
        );
        if (tokenVerified.data.tokenVerified) {
          if (previousURL === "/home")
            toast({
              title: "Successfully logged in",
              description: "Welcome back!",
              duration: 3000,
            });
          else
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

  useEffect(() => {}, [userInformation]);
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
        <TabsContent value="chatroom">
          <div className="flex flex-col flex-grow items-center justify-center gap-4">
            haha
          </div>
        </TabsContent>
        <TabsContent value="group">
          <div className="flex flex-col flex-grow items-center justify-center gap-4">
            haha
          </div>
        </TabsContent>
        <TabsContent value="contact">
          <div className="flex flex-col flex-grow items-center justify-center gap-4">
            haha
          </div>
        </TabsContent>
      </Tabs>
      <Toaster />
    </div>
  );
};

export default Page;
