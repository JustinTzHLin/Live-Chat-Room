import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MessageSquareMore } from "lucide-react";

const ContactInfoDialog = ({
  contactInfoDialogOpen,
  setContactInfoDialogOpen,
  contactInfo,
  getNameInitials,
  userConversationsData,
  setCurrentSection,
  setCurrentChatInfo,
}: {
  contactInfoDialogOpen: boolean;
  setContactInfoDialogOpen: (open: boolean) => void;
  contactInfo: {
    username: string;
    email: string;
    friendId: string;
  };
  getNameInitials: (name: string) => string;
  userConversationsData: any[];
  setCurrentSection: (section: string) => void;
  setCurrentChatInfo: (chatInfo: any) => void;
}) => {
  return (
    <Dialog
      open={contactInfoDialogOpen}
      onOpenChange={setContactInfoDialogOpen}
    >
      <DialogContent>
        <DialogHeader>
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
                setCurrentSection("chat");
                setCurrentChatInfo(
                  userConversationsData.find(
                    (conversation) =>
                      conversation.type === "private" &&
                      conversation.participantIDs.includes(contactInfo.friendId)
                  )
                );
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
