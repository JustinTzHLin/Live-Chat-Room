import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  X,
  UserRoundPlus,
  UserRoundCheck,
  UserRoundMinus,
  LoaderCircle,
} from "lucide-react";
import { useUserStore } from "@/stores/userStore";
import { useSocketStore } from "@/stores/socketStore";
import getNameInitials from "@/utils/getNameInitials";
import useUnexpectedErrorHandler from "@/utils/useUnexpectedErrorHandler";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import axios from "axios";

const groupNameSchema = z
  .string({ message: "Invalid group name" })
  .min(1, { message: "Group name cannot be empty" })
  .max(32, { message: "Group name must be at most 32 characters" });

const NewGroupDialog = ({
  newGroupDialogOpen,
  setNewGroupDialogOpen,
}: {
  newGroupDialogOpen: boolean;
  setNewGroupDialogOpen: (open: boolean) => void;
}) => {
  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
  const friendsList = useUserStore((state) => state.userChatData.friends);
  const userId = useUserStore((state) => state.userInformation.userId);
  const socket = useSocketStore((state) => state.socket);
  const [groupName, setGroupName] = useState<string>("");
  const [groupMembers, setGroupMembers] = useState<{
    [key: string]: {
      id: string;
      username: string;
      email: string;
    };
  }>({});
  const [groupNameError, setGroupNameError] = useState<string | null>(null);
  const [noGroupMembers, setNoGroupMembers] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { toast } = useToast();
  const { handleUnexpectedError } = useUnexpectedErrorHandler();

  useEffect(() => {
    if (newGroupDialogOpen) {
      setGroupNameError(null);
      setNoGroupMembers(false);
      setGroupName("");
      setGroupMembers({});
    }
  }, [newGroupDialogOpen]);

  const handleNewGroup = async () => {
    setIsLoading(true);
    try {
      groupNameSchema.parse(groupName);
      if (Object.keys(groupMembers).length === 0)
        throw new Error("No members added");
      const newGroup = {
        type: "group",
        roomName: groupName,
        participantIDs: [userId, ...Object.keys(groupMembers)],
      };
      const createGroupResponse = await axios.post(
        `${BACKEND_URL}/user/createGroup`,
        { newGroup },
        { withCredentials: true }
      );
      if (createGroupResponse.data.groupCreated) {
        toast({
          title: "Group created",
          description: "Your group has been created.",
          duration: 3000,
        });
        setNewGroupDialogOpen(false);
        socket.emit("create_group", createGroupResponse.data.createdGroup);
      }
    } catch (err) {
      if (err instanceof z.ZodError) setGroupNameError(err.issues[0].message);
      else if (err instanceof Error && err.message === "No members added")
        setNoGroupMembers(true);
      else handleUnexpectedError(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={newGroupDialogOpen} onOpenChange={setNewGroupDialogOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Group</DialogTitle>
          <DialogDescription></DialogDescription>
          <div className="relative">
            <Input
              type="text"
              placeholder="Group Name"
              className="pr-8"
              value={groupName}
              onChange={(e) => {
                setGroupName(e.target.value);
                setGroupNameError(null);
              }}
              autoFocus
            />
            <Button
              variant="ghost"
              size="icon"
              type="button"
              onClick={() => setGroupName("")}
              className="absolute right-1 top-1.5 h-6 w-6 text-muted-foreground hover:bg-transparent rounded-full"
            >
              <X />
            </Button>
            {groupNameError && (
              <p className="text-left text-sm font-medium text-destructive mt-2 ml-2">
                {groupNameError}
              </p>
            )}
          </div>
          <p className="flex text-lg !mt-4 font-medium">Friends</p>
          <ScrollArea className="max-h-[200px] rounded-md border">
            {friendsList.map((friend) => (
              <div
                className={cn(
                  "flex items-center justify-between gap-2 rounded-lg m-2 bg-slate-100",
                  friend.id in groupMembers && "ring-ring ring-2"
                )}
                key={`new_group_friend_${friend.id}`}
              >
                <p className="ml-3 text-lg font-semibold">
                  {getNameInitials(friend.username)}
                </p>
                <p className="text-lg">{friend.username}</p>
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-10 h-10 text-muted-foreground"
                  onClick={() => {
                    setNoGroupMembers(false);
                    setGroupMembers({
                      ...groupMembers,
                      [friend.id]: friend,
                    });
                  }}
                  disabled={friend.id in groupMembers}
                >
                  {friend.id in groupMembers ? (
                    <UserRoundCheck style={{ width: "22px", height: "22px" }} />
                  ) : (
                    <UserRoundPlus style={{ width: "22px", height: "22px" }} />
                  )}
                </Button>
              </div>
            ))}
          </ScrollArea>
          <p className="flex text-lg !mt-4 font-medium">Added Members</p>
          <ScrollArea className="max-h-[200px] rounded-md border">
            {Object.keys(groupMembers).length > 0 ? (
              Object.values(groupMembers).map((member) => (
                <div
                  className="flex items-center justify-between gap-2 rounded-lg bg-slate-100 m-2"
                  key={`new_group_member_${member.id}`}
                >
                  <p className="ml-3 text-lg font-semibold">
                    {getNameInitials(member.username)}
                  </p>
                  <p className="text-lg">{member.username}</p>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-10 h-10 text-muted-foreground"
                    onClick={() =>
                      setGroupMembers((prev) => {
                        const { [member.id]: _, ...newGroupMembers } = prev;
                        return newGroupMembers;
                      })
                    }
                  >
                    <UserRoundMinus style={{ width: "22px", height: "22px" }} />
                  </Button>
                </div>
              ))
            ) : (
              <div
                className={cn(
                  "h-10 flex justify-center items-center text-slate-600 m-2",
                  noGroupMembers && "text-destructive"
                )}
              >
                No Members Added
              </div>
            )}
          </ScrollArea>
        </DialogHeader>
        <DialogFooter>
          <Button onClick={handleNewGroup} disabled={isLoading}>
            {isLoading && <LoaderCircle className="animate-spin" />}
            {isLoading ? "Creating..." : "Create Group"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NewGroupDialog;
