import { useState, useEffect } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import getNameInitials from "@/utils/getNameInitials";
import { PencilLine, UserRound, X } from "lucide-react";
import axios from "axios";
import { z } from "zod";

const usernameSchema = z
  .string({ message: "Invalid username" })
  .min(3, { message: "Username must be at least 3 characters" })
  .max(32, { message: "Username must be at most 32 characters" });

const EditProfile = ({
  userInformation,
  setUserInformation,
  toast,
}: {
  userInformation: {
    userId: string;
    username: string;
    email: string;
    createdAt: Date;
    lastActive: Date;
  };
  setUserInformation: React.Dispatch<
    React.SetStateAction<{
      userId: string;
      username: string;
      email: string;
      createdAt: Date;
      lastActive: Date;
    }>
  >;
  toast: any;
}) => {
  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
  const [editUsername, setEditUsername] = useState<boolean>(false);
  const [newUsername, setNewUsername] = useState<string>(
    userInformation.username
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setError(null);
    setNewUsername(userInformation.username);
  }, [userInformation.username, editUsername]);

  const updateUsername = async () => {
    try {
      usernameSchema.parse(newUsername);
      setError(null);
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
        setUserInformation({
          ...userInformation,
          username: newUsername,
        });
      }
      setEditUsername(false);
    } catch (error) {
      if (error instanceof z.ZodError) setError(error.issues[0].message);
      else console.error(error);
    }
  };

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
                setError(null);
              }}
              placeholder="New Username"
              className="focus-visible:ring-slate-400 pl-8 pr-8"
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
          {error && (
            <p className="text-sm font-medium text-destructive mt-2">{error}</p>
          )}
          <div className="w-full flex justify-center gap-2 mt-4">
            <Button variant="secondary" onClick={() => setEditUsername(false)}>
              Cancel
            </Button>
            <Button onClick={updateUsername}>Save</Button>
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
