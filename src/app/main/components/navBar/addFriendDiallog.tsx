import { useState, useEffect } from "react";
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
import { UserSearch, UserRoundPlus } from "lucide-react";
import getNameInitials from "@/utils/getNameInitials";
import axios from "axios";
import { z } from "zod";

const emailSchema = z.string().email();
const jicIdSchema = z.string().min(8).max(16);

const AddFriendDialog = ({
  addFriendDialogOpen,
  setAddFriendDialogOpen,
  userInformation,
  friendsList,
  toast,
  socket,
}: {
  addFriendDialogOpen: boolean;
  setAddFriendDialogOpen: (open: boolean) => void;
  userInformation: {
    userId: string;
    username: string;
    email: string;
    createdAt: Date;
    lastActive: Date;
  };
  friendsList: any[];
  toast: any;
  socket: any;
}) => {
  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
  const [radioValue, setRadioValue] = useState<string>("email");
  const [searchInput, setSearchInput] = useState<string>("");
  const [searchedUser, setSearchedUser] = useState<{
    id: string;
    username: string;
    email: string;
  } | null>({
    id: "",
    username: "",
    email: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [searching, setSearching] = useState<boolean>(false);

  useEffect(() => {
    if (addFriendDialogOpen) {
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

  const searchUser = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (searchInput) {
      setSearchedUser(null);
      setSearching(true);
      if (radioValue === "email") {
        try {
          emailSchema.parse(searchInput);
          setError(null);
          const searchUserByEmail = await axios.post(
            BACKEND_URL + "/user/searchUser",
            { email: searchInput },
            { withCredentials: true }
          );
          if (searchUserByEmail.data.userExists) {
            setSearchedUser(searchUserByEmail.data.searchedUser);
          }
        } catch (error) {
          setError("Invalid email");
        } finally {
          setSearching(false);
        }
      } else if (radioValue === "jicId") {
        try {
          jicIdSchema.parse(searchInput);
          setError(null);
          const searchUserByJICId = await axios.post(
            BACKEND_URL + "/user/searchUser",
            { jicId: searchInput },
            { withCredentials: true }
          );
          if (searchUserByJICId.data.userExists) {
            setSearchedUser(searchUserByJICId.data.searchedUser);
          }
        } catch (error) {
          setError("Invalid ID");
        } finally {
          setSearching(false);
        }
      }
    }
  };

  const sendFriendRequest = async () => {
    if (userInformation.userId === searchedUser?.id) {
      toast({
        title: "Cannot add yourself",
        description: "You cannot add yourself as a friend.",
        duration: 3000,
      });
      return;
    } else if (
      friendsList.some((friend) => friend.friendId === searchedUser?.id)
    ) {
      toast({
        title: "Already a friend",
        description: "You are already friends with this user.",
        duration: 3000,
      });
      return;
    } else {
      try {
        const sendFriendRequest = await axios.post(
          BACKEND_URL + "/user/sendFriendRequest",
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
        } else if (sendFriendRequest.data.message === "Request already sent.") {
          toast({
            title: "Request already sent",
            description: "You have already sent a friend request to this user.",
            duration: 3000,
          });
        }
      } catch (error) {
        console.log(error);
        toast({
          variant: "destructive",
          title: "Error occurred",
          description: "Something went wrong. Please try again.",
          duration: 3000,
        });
      }
    }
  };

  return (
    <Dialog open={addFriendDialogOpen} onOpenChange={setAddFriendDialogOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-xl">Add Friend</DialogTitle>
          <VisuallyHidden.Root asChild>
            <DialogDescription>
              Enter the email or JIC ID of the user you would like to add as a
              friend.
            </DialogDescription>
          </VisuallyHidden.Root>
        </DialogHeader>
        <RadioGroup
          value={radioValue}
          onValueChange={setRadioValue}
          className="flex gap-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="email" id="option-email" />
            <Label htmlFor="option-email">Email</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="jicId" id="option-jicId" />
            <Label htmlFor="option-jicId">JIC ID</Label>
          </div>
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
          <div className="flex items-center justify-between gap-2 rounded-lg bg-slate-100">
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
          <div className="h-10 flex justify-center items-center text-slate-600">
            {searching ? "Loading..." : "No User Found"}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AddFriendDialog;
