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
import { MessageSquareMore } from "lucide-react";
import { useUserStore } from "@/stores/userStore";
import getNameInitials from "@/utils/getNameInitials";

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
  const userConversationsData = Object.values(
    useUserStore((state) => state.userChatData.conversations)
  );
  const setCurrentChatInfo = useUserStore((state) => state.setCurrentChatInfo);

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
            <Button
              variant="ghost"
              size="icon"
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
              }}
            >
              <MessageSquareMore style={{ width: "26px", height: "26px" }} />
            </Button>
          </div>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export default ContactInfoDialog;
