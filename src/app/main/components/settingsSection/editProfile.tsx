import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUserStore } from "@/stores/userStore";
import { useTheme } from "next-themes";
import getNameInitials from "@/utils/getNameInitials";
import useUnexpectedErrorHandler from "@/utils/useUnexpectedErrorHandler";
import { PencilLine, UserRound, X } from "lucide-react";
import axios from "axios";
import { z } from "zod";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
const usernameSchema = z
  .string({ message: "Invalid username" })
  .min(3, { message: "Username must be at least 3 characters" })
  .max(32, { message: "Username must be at most 32 characters" });
const jicIdSchema = z
  .string({ message: "Invalid JIC ID" })
  .min(8, { message: "JIC ID must be at least 8 characters" })
  .max(32, { message: "JIC ID must be at most 32 characters" });

const EditProfile = () => {
  const { userInformation, setUsername, setJicId } = useUserStore(
    (state) => state
  );
  const [editUsername, setEditUsername] = useState<boolean>(false);
  const [newUsername, setNewUsername] = useState<string>(
    userInformation.username
  );
  const [editJicId, setEditJicId] = useState<boolean>(false);
  const [newJicId, setNewJicId] = useState<string>(userInformation.jicId || "");
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [jicIdError, setJicIdError] = useState<string | null>(null);
  const { handleUnexpectedError } = useUnexpectedErrorHandler();
  const { resolvedTheme } = useTheme();
  const { toast } = useToast();

  useEffect(() => {
    setUsernameError(null);
    setNewUsername(userInformation.username);
  }, [userInformation.username, editUsername]);

  useEffect(() => {
    setJicIdError(null);
    setNewJicId(userInformation.jicId || "");
  }, [userInformation.jicId, editJicId]);

  const updateUsername = useCallback(async () => {
    if (newUsername === userInformation.username) {
      return toast({
        title: "Same username",
        description: "You cannot update to the same username.",
        duration: 3000,
      });
    }
    try {
      usernameSchema.parse(newUsername);
      const updateUsernameResponse = await axios.post(
        `${BACKEND_URL}/user/updateUsername`,
        { newUsername: newUsername },
        { withCredentials: true }
      );
      if (updateUsernameResponse.data.usernameChanged) {
        toast({
          title: "Username updated",
          description: "Your username has been updated.",
          duration: 3000,
        });
        setUsername(newUsername);
      }
      setEditUsername(false);
    } catch (err) {
      if (err instanceof z.ZodError) setUsernameError(err.issues[0].message);
      else handleUnexpectedError(err);
    }
  }, [newUsername, userInformation.username]);

  const updateJicId = useCallback(async () => {
    if (newJicId === userInformation.jicId) {
      return toast({
        title: "Same JIC ID",
        description: "You cannot update to the same JIC ID.",
        duration: 3000,
      });
    }
    try {
      jicIdSchema.parse(newJicId);
      const updateJicIdResponse = await axios.post(
        `${BACKEND_URL}/user/updateJicId`,
        { newJicId: newJicId },
        { withCredentials: true }
      );
      if (updateJicIdResponse.data.jicIdChanged) {
        toast({
          title: "JIC ID updated",
          description: "Your JIC ID has been updated.",
          duration: 3000,
        });
        setJicId(newJicId);
      }
      setEditJicId(false);
    } catch (err) {
      if (err instanceof z.ZodError) setJicIdError(err.issues[0].message);
      else handleUnexpectedError(err);
    }
  }, [newJicId, userInformation.jicId]);

  return (
    <div className="flex flex-col justify-center items-center w-full gap-4 p-4">
      <Avatar className="w-20 h-20">
        <AvatarFallback className="text-3xl font-semibold">
          {getNameInitials(userInformation.username)}
        </AvatarFallback>
      </Avatar>
      <div className="flex justify-center items-center gap-1">
        <div className="text-xl font-medium">{userInformation.username}</div>
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground w-7 h-7"
          disabled={editUsername}
          onClick={() => setEditUsername(true)}
        >
          <PencilLine style={{ width: "18px", height: "18px" }} />
        </Button>
      </div>
      {editUsername && (
        <div className="flex flex-col w-full justify-center items-center">
          <div className="w-full max-w-sm relative">
            <UserRound className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              value={newUsername}
              onChange={(e) => {
                setNewUsername(e.target.value);
                setUsernameError(null);
              }}
              placeholder="New Username"
              className="pl-8 pr-8"
              autoFocus
            />
            <Button
              variant="ghost"
              size="icon"
              type="button"
              onClick={() => setNewUsername("")}
              className="absolute right-1 top-1.5 h-6 w-6 text-muted-foreground hover:bg-transparent rounded-full"
            >
              <X />
            </Button>
          </div>
          {usernameError && (
            <p className="text-sm font-medium text-destructive mt-2">
              {usernameError}
            </p>
          )}
          <div className="w-full flex justify-center gap-2 mt-4">
            <Button
              variant={resolvedTheme === "dark" ? "outline" : "secondary"}
              onClick={() => setEditUsername(false)}
            >
              Cancel
            </Button>
            <Button
              variant={resolvedTheme === "dark" ? "secondary" : "default"}
              onClick={updateUsername}
            >
              Save
            </Button>
          </div>
        </div>
      )}
      <div className="flex justify-center items-center gap-1">
        <div className="text-lg font-medium">
          {userInformation.jicId || "Add JIC ID"}
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground w-7 h-7"
          disabled={editJicId}
          onClick={() => setEditJicId(true)}
        >
          <PencilLine style={{ width: "18px", height: "18px" }} />
        </Button>
      </div>
      {editJicId && (
        <div className="flex flex-col w-full justify-center items-center">
          <div className="w-full max-w-sm relative">
            <UserRound className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              value={newJicId}
              onChange={(e) => {
                setNewJicId(e.target.value);
                setJicIdError(null);
              }}
              placeholder="New JIC ID"
              className="pl-8 pr-8"
              autoFocus
            />
            <Button
              variant="ghost"
              size="icon"
              type="button"
              onClick={() => setNewJicId("")}
              className="absolute right-1 top-1.5 h-6 w-6 text-muted-foreground hover:bg-transparent rounded-full"
            >
              <X />
            </Button>
          </div>
          {jicIdError && (
            <p className="text-sm font-medium text-destructive mt-2">
              {jicIdError}
            </p>
          )}
          <div className="w-full flex justify-center gap-2 mt-4">
            <Button
              variant={resolvedTheme === "dark" ? "outline" : "secondary"}
              onClick={() => setEditJicId(false)}
            >
              Cancel
            </Button>
            <Button
              variant={resolvedTheme === "dark" ? "secondary" : "default"}
              onClick={updateJicId}
            >
              Save
            </Button>
          </div>
        </div>
      )}
      <div className="text-sm text-muted-foreground">
        {userInformation.email}
      </div>
    </div>
  );
};

export default EditProfile;
