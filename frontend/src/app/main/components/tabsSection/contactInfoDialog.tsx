import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MessageSquareMore, Phone } from "lucide-react";
import { useUserStore } from "@/stores/userStore";
import getNameInitials from "@/utils/getNameInitials";
import useUnexpectedErrorHandler from "@/utils/useUnexpectedErrorHandler";
import axiosInstance from "@/lib/axios";

const ContactInfoDialog = ({
  contactInfoDialogOpen,
  setContactInfoDialogOpen,
  contactInfo,
  setCurrentSection,
}: {
  contactInfoDialogOpen: boolean;
  setContactInfoDialogOpen: (open: boolean) => void;
  contactInfo: {
    username: string;
    email: string;
    id: string;
  };
  setCurrentSection: (section: string) => void;
}) => {
  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
  const conversations = useUserStore(
    (state) => state.userChatData.conversations
  );
  const userConversationsData = useMemo(
    () => Object.values(conversations),
    [conversations]
  );
  const { setCurrentChatInfo, setMainPageSectionFlow, userInformation } =
    useUserStore((state) => state);
  const { handleUnexpectedError } = useUnexpectedErrorHandler();

  const handleCalltoFriend = async () => {
    const callersInfo = {
      caller: {
        id: userInformation.userId,
        username: userInformation.username,
        email: userInformation.email,
      },
      callee: contactInfo,
    };
    const callTab = window.open("", "_blank", "width=400,height=1000");
    try {
      const issueCallersInfoResponse = await axiosInstance.post(
        `${BACKEND_URL}/token/issueOtherToken`,
        callersInfo,
        { withCredentials: true }
      );
      if (issueCallersInfoResponse.data.generatedToken && callTab)
        callTab.location.href = `/stream?callersInfoToken=${issueCallersInfoResponse.data.otherToken}`;
    } catch (err) {
      callTab?.close();
      handleUnexpectedError(err);
    } finally {
      setContactInfoDialogOpen(false);
    }
  };

  return (
    <Dialog
      open={contactInfoDialogOpen}
      onOpenChange={setContactInfoDialogOpen}
    >
      <DialogContent>
        <DialogHeader>
          <VisuallyHidden.Root asChild>
            <DialogTitle>Contact Info</DialogTitle>
          </VisuallyHidden.Root>
          <div className="flex flex-col justify-center items-center w-full gap-2">
            <Avatar className="w-20 h-20">
              <AvatarFallback className="text-3xl font-semibold">
                {getNameInitials(contactInfo.username)}
              </AvatarFallback>
            </Avatar>
            <div className="text-xl font-medium">{contactInfo.username}</div>
            <DialogDescription>{contactInfo.email}</DialogDescription>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                type="button"
                className="text-muted-foreground w-10 h-10"
                onClick={() => {
                  setContactInfoDialogOpen(false);
                  setCurrentChatInfo(
                    (prev: any) =>
                      userConversationsData.find(
                        (conversation) =>
                          conversation.type === "private" &&
                          conversation.participantIDs.includes(contactInfo.id)
                      ) || prev
                  );
                  setCurrentSection("chat");
                  setMainPageSectionFlow((prev) => [...prev, "chat"]);
                }}
              >
                <MessageSquareMore style={{ width: "26px", height: "26px" }} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                type="button"
                className="text-muted-foreground w-10 h-10"
                onClick={handleCalltoFriend}
              >
                <Phone style={{ width: "24px", height: "24px" }} />
              </Button>
            </div>
          </div>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export default ContactInfoDialog;
