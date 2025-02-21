import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Delete, LoaderCircle } from "lucide-react";
import { useUserStore } from "@/stores/userStore";
import useUnexpectedErrorHandler from "@/utils/useUnexpectedErrorHandler";
import { useTheme } from "next-themes";
import getNameInitials from "@/utils/getNameInitials";
import axiosInstance from "@/lib/axios";
import { DialogDescription } from "@radix-ui/react-dialog";

const EditPictureDialog = ({
  editPictureDialogOpen,
  setEditPictureDialogOpen,
}: {
  editPictureDialogOpen: boolean;
  setEditPictureDialogOpen: (open: boolean) => void;
}) => {
  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
  const SIZE_LIMIT = 15 * 1024 * 1024;
  const { userInformation, setUserInformation } = useUserStore(
    (state) => state
  );
  const { handleUnexpectedError } = useUnexpectedErrorHandler();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pictureFile, setPictureFile] = useState<{
    name: string;
    size: number;
    type: string;
    data: string;
    arrayBuffer: string;
  } | null>(null);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [isRemoving, setIsRemoving] = useState<boolean>(false);
  const { resolvedTheme } = useTheme();
  const { toast } = useToast();

  const currentProfilePic = useMemo(
    () =>
      userInformation.profilePic
        ? `data:${userInformation.profilePic.type};base64,${Buffer.from(
            userInformation.profilePic.buffer.data
          ).toString("base64")}`
        : undefined,
    [userInformation.profilePic]
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        const { name, size, type } = file;
        if (size > SIZE_LIMIT) {
          toast({
            variant: "destructive",
            title: "File size too large",
            description: "File size must be less than 15MB",
            duration: 3000,
          });
          return;
        }
        const reader = new FileReader();
        reader.onload = () => {
          const readerResult = reader.result as string;
          setPictureFile({
            name,
            size,
            type,
            data: readerResult,
            arrayBuffer: readerResult.split(",")[1],
          });
        };
        reader.readAsDataURL(file);
      }
    },
    []
  );

  const handleSavePicture = useCallback(
    async (e: React.FormEvent, action = "save") => {
      if (!pictureFile?.arrayBuffer && action === "save") return;
      try {
        if (action === "remove") setIsRemoving(true);
        else setIsUpdating(true);
        const { data, ...profilePic } = pictureFile || {};
        const response = await axiosInstance.post(
          `${BACKEND_URL}/user/changeProfilePicture`,
          action === "save" ? profilePic : { action },
          {
            withCredentials: true,
          }
        );
        setEditPictureDialogOpen(false);
        setUserInformation(response.data.authenticatedUser);
        toast({
          title: `Profile picture ${action === "save" ? "updated" : "removed"}`,
          description: `Your profile picture has been ${
            action === "save" ? "updated" : "removed"
          }.`,
          duration: 3000,
        });
      } catch (err) {
        handleUnexpectedError(err);
      } finally {
        if (action === "remove") setIsRemoving(false);
        else setIsUpdating(false);
      }
    },
    [pictureFile]
  );

  useEffect(() => {
    if (editPictureDialogOpen) {
      if (fileInputRef.current) fileInputRef.current.value = "";
      setPictureFile(null);
    }
  }, [editPictureDialogOpen]);

  return (
    <Dialog
      open={editPictureDialogOpen}
      onOpenChange={setEditPictureDialogOpen}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-xl">Profile Picture</DialogTitle>
          <VisuallyHidden.Root asChild>
            <DialogDescription>Change your profile picture</DialogDescription>
          </VisuallyHidden.Root>
        </DialogHeader>
        <div className="w-full flex flex-col gap-4">
          <div className="w-full relative">
            <Input
              id="pictureInput"
              ref={fileInputRef}
              className="w-full text-sm font-semibold pr-8"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
            />
            <Button
              variant="ghost"
              className="absolute right-0 top-1/2 -translate-y-1/2 text-muted-foreground w-10 h-10 hover:bg-transparent"
              onClick={() => {
                setPictureFile(null);
                if (fileInputRef.current) fileInputRef.current.value = "";
              }}
            >
              <Delete style={{ width: "22px", height: "22px" }} />
            </Button>
          </div>
          <div className="w-full flex flex-col items-center sm:items-start gap-2 ">
            <Avatar className="w-20 h-20">
              <AvatarImage src={pictureFile?.data || currentProfilePic} />
              <AvatarFallback className="text-3xl font-semibold">
                {getNameInitials(userInformation.username)}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
        <DialogFooter>
          <div className="flex justify-center gap-4">
            <Button
              variant={resolvedTheme === "dark" ? "outline" : "secondary"}
              onClick={() => setEditPictureDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={!currentProfilePic || isRemoving}
              onClick={(e) => handleSavePicture(e, "remove")}
            >
              {isRemoving && <LoaderCircle className="animate-spin" />}
              Remove
            </Button>
            <Button
              variant={resolvedTheme === "dark" ? "secondary" : "default"}
              onClick={handleSavePicture}
              disabled={!pictureFile || isUpdating}
            >
              {isUpdating && <LoaderCircle className="animate-spin" />}
              Save
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditPictureDialog;
