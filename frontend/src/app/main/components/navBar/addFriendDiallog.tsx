import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import {
  UserSearch,
  UserRoundPlus,
  QrCode,
  ArrowLeft,
  RotateCw,
} from "lucide-react";
import { useUserStore, Friend } from "@/stores/userStore";
import { useSocketStore } from "@/stores/socketStore";
import getNameInitials from "@/utils/getNameInitials";
import useUnexpectedErrorHandler from "@/utils/useUnexpectedErrorHandler";
import { QRCodeSVG } from "qrcode.react";
import axios from "axios";
import { z } from "zod";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
const emailSchema = z.string().email();
const jicIdSchema = z.string().min(8).max(16);

const AddFriendDialog = ({
  addFriendDialogOpen,
  setAddFriendDialogOpen,
}: {
  addFriendDialogOpen: boolean;
  setAddFriendDialogOpen: (open: boolean) => void;
}) => {
  const COUNTDOWN_TIME = 300;
  const userInformation = useUserStore((state) => state.userInformation);
  const friendsList = useUserStore((state) => state.userChatData.friends);
  const socket = useSocketStore((state) => state.socket);
  const [radioValue, setRadioValue] = useState<string>("email");
  const [searchInput, setSearchInput] = useState<string>("");
  const [searchedUser, setSearchedUser] = useState<Friend | null>({
    id: "",
    username: "",
    email: "",
  });
  const [showQrCode, setShowQrCode] = useState<boolean>(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searching, setSearching] = useState<boolean>(false);
  const { toast } = useToast();
  const { handleUnexpectedError } = useUnexpectedErrorHandler();

  useEffect(() => {
    if (addFriendDialogOpen) {
      setShowQrCode(false);
      setQrCodeUrl("");
      setRadioValue("email");
      setError(null);
      setSearchInput("");
      setSearchedUser(null);
    }
  }, [addFriendDialogOpen]);

  useEffect(() => {
    setError(null);
    setSearchInput("");
    setSearchedUser(null);
  }, [radioValue]);

  const regenerateQrCode = useCallback(async () => {
    if (intervalId) clearInterval(intervalId);
    const generateQrCodeResponse = await axios.post(
      `${BACKEND_URL}/token/issueOtherToken`,
      { userId: userInformation.userId },
      { withCredentials: true }
    );
    if (generateQrCodeResponse.data.generatedToken) {
      setQrCodeUrl(`${generateQrCodeResponse.data.otherToken}`);
      setTimeLeft(COUNTDOWN_TIME);
    }
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          console.log("Time's up");
          clearInterval(interval);
          regenerateQrCode();
          return COUNTDOWN_TIME;
        } else return prev - 1;
      });
    }, 1000);
    setIntervalId(interval);
    return () => clearInterval(interval);
  }, [userInformation.userId, intervalId]);

  useEffect(() => {
    if (showQrCode) regenerateQrCode();
    else if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
      setQrCodeUrl("");
    }
  }, [showQrCode]);

  const searchUser = useCallback(
    async (e: React.SyntheticEvent) => {
      e.preventDefault();
      if (searchInput) {
        setSearchedUser(null);
        setSearching(true);
        try {
          const schema =
            radioValue === "email"
              ? emailSchema
              : radioValue === "jicId"
              ? jicIdSchema
              : null;
          if (schema) schema.parse(searchInput);
          else throw new Error("Invalid radio input");
          const searchUserResponse = await axios.post(
            `${BACKEND_URL}/user/searchUser`,
            { [radioValue]: searchInput },
            { withCredentials: true }
          );
          if (searchUserResponse.data.userExists) {
            setSearchedUser(searchUserResponse.data.searchedUser);
          }
        } catch (err) {
          if (err instanceof z.ZodError) setError(err.issues[0].message);
          else handleUnexpectedError(err);
        } finally {
          setSearching(false);
        }
      }
    },
    [radioValue, searchInput]
  );

  const sendFriendRequest = useCallback(async () => {
    if (userInformation.userId === searchedUser?.id) {
      toast({
        title: "Cannot add yourself",
        description: "You cannot add yourself as a friend.",
        duration: 3000,
      });
      return;
    } else if (friendsList.some((friend) => friend.id === searchedUser?.id)) {
      toast({
        title: "Already a friend",
        description: "You are already friends with this user.",
        duration: 3000,
      });
      return;
    } else {
      try {
        const sendFriendRequest = await axios.post(
          `${BACKEND_URL}/user/sendFriendRequest`,
          { senderId: userInformation.userId, receiverId: searchedUser?.id },
          { withCredentials: true }
        );
        if (sendFriendRequest.data.friendRequestSent) {
          toast({
            title: "Friend request sent",
            description: "Friend request sent successfully.",
            duration: 3000,
          });
          if (
            sendFriendRequest.data.newFriendRequest.receiverId ===
            searchedUser?.id
          ) {
            socket.emit("send_friend_request", {
              id: sendFriendRequest.data.newFriendRequest._id,
              sender: {
                senderId: userInformation.userId,
                username: userInformation.username,
                email: userInformation.email,
              },
              receiver: {
                receiverId: searchedUser?.id,
                username: searchedUser?.username,
                email: searchedUser?.email,
              },
              createdAt: sendFriendRequest.data.newFriendRequest.createdAt,
            });
          }
        } else if (
          sendFriendRequest.data.errorMessage === "request already sent"
        ) {
          toast({
            title: "Request already sent",
            description: "You have already sent a friend request to this user.",
            duration: 3000,
          });
        }
      } catch (err) {
        handleUnexpectedError(err);
      }
    }
  }, [userInformation, searchedUser, friendsList]);

  return (
    <Dialog open={addFriendDialogOpen} onOpenChange={setAddFriendDialogOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-xl">
            {showQrCode ? "Your QR Code" : "Add Friend"}
          </DialogTitle>
          <VisuallyHidden.Root asChild>
            <DialogDescription>
              Enter the email or JIC ID of the user you would like to add as a
              friend.
            </DialogDescription>
          </VisuallyHidden.Root>
        </DialogHeader>
        {showQrCode ? (
          <div className="flex h-[132px] items-start justify-between">
            <div className="w-16">
              <Button
                variant="ghost"
                size="icon"
                type="button"
                className="w-7 h-7 text-muted-foreground rounded-full hover:bg-transparent"
                onClick={() => {
                  setShowQrCode(false);
                }}
              >
                <ArrowLeft style={{ width: "26px", height: "26px" }} />
              </Button>
            </div>
            {qrCodeUrl && (
              <QRCodeSVG
                value={qrCodeUrl}
                title="Just In Chat QR Code"
                size={128}
                imageSettings={{
                  src: "/icon.png",
                  height: 24,
                  width: 24,
                  opacity: 1,
                  excavate: true,
                }}
              />
            )}
            <div className="w-16 flex items-center justify-end gap-1">
              <RotateCw
                size={16}
                className="cursor-pointer"
                onClick={regenerateQrCode}
              />
              <div className="w-9">{`${Math.floor(timeLeft / 60)}: ${(
                timeLeft % 60
              )
                .toString()
                .padStart(2, "0")}`}</div>
            </div>
          </div>
        ) : (
          <>
            <RadioGroup
              value={radioValue}
              onValueChange={setRadioValue}
              className="flex justify-between"
            >
              <div className="flex gap-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="email" id="option-email" />
                  <Label htmlFor="option-email">Email</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="jicId" id="option-jicId" />
                  <Label htmlFor="option-jicId">JIC ID</Label>
                </div>
              </div>
              <QrCode
                size={20}
                className="cursor-pointer hover:scale-110"
                onClick={() => {
                  setShowQrCode(true);
                }}
              />
            </RadioGroup>
            <div className="relative w-full">
              <form onSubmit={searchUser}>
                <Input
                  type="text"
                  placeholder={
                    radioValue === "email"
                      ? "JustInChat@example.com"
                      : "Just In Chat ID"
                  }
                  className="h-10 pr-9 !text-base"
                  value={searchInput}
                  onChange={(e) => {
                    setSearchInput(e.target.value);
                    setError(null);
                  }}
                />
                <Button
                  variant="ghost"
                  type="submit"
                  size="icon"
                  className="text-muted-foreground hover:bg-transparent w-10 h-10 absolute right-0 top-5 transform -translate-y-1/2 rounded-full"
                >
                  <UserSearch style={{ width: "22px", height: "22px" }} />
                </Button>
                {error && (
                  <p className="text-sm font-medium text-destructive mt-2 ml-2">
                    {error}
                  </p>
                )}
              </form>
            </div>
            {searchedUser ? (
              <div className="flex items-center justify-between gap-2 rounded-lg bg-slate-100 dark:bg-slate-800">
                <p className="ml-3 text-lg font-semibold">
                  {getNameInitials(searchedUser.username)}
                </p>
                <p className="text-lg">{searchedUser.username}</p>
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-10 h-10 text-muted-foreground"
                  onClick={sendFriendRequest}
                >
                  <UserRoundPlus style={{ width: "22px", height: "22px" }} />
                </Button>
              </div>
            ) : (
              <div className="h-10 flex justify-center items-center text-slate-600 dark:text-slate-400">
                {searching ? "Loading..." : "No User Found"}
              </div>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AddFriendDialog;
