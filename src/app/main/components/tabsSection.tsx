import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import ContactInfoDialog from "./contactInfoDialog";

const TabsSection = ({
  currentTab,
  setCurrentTab,
  userChatData,
  setCurrentSection,
  setCurrentChatInfo,
}: {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  userChatData: {
    conversations: {
      [key: string]: {
        messages: any[];
        participantIDs: string[];
        roomName: string;
        type: string;
        conversationId: string;
      };
    };
    friends: any[];
  };
  setCurrentSection: (section: string) => void;
  setCurrentChatInfo: (chatInfo: any) => void;
}) => {
  const [contactInfoDialogOpen, setContactInfoDialogOpen] = useState(false);
  const [contactInfo, setContactInfo] = useState<{
    username: string;
    email: string;
    friendId: string;
  }>({
    username: "",
    email: "",
    friendId: "",
  });

  const getNameInitials = (name: string) => {
    const nameWords = name.split(" ");
    let initials = "";
    if (nameWords.length > 3) {
      initials += nameWords[0][0] + nameWords[nameWords.length - 1][0];
    } else if (nameWords.length === 3) {
      initials += nameWords[0][0] + nameWords[1][0] + nameWords[2][0];
    } else {
      nameWords.forEach((word) => {
        initials += word[0];
      });
    }
    return initials.toUpperCase();
  };

  return (
    <Tabs
      defaultValue="chatroom"
      value={currentTab}
      onValueChange={(value) => setCurrentTab(value)}
      className="w-full px-2 h-[calc(100%-80px)]"
    >
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="chatroom">All Chats</TabsTrigger>
        <TabsTrigger value="group">Groups</TabsTrigger>
        <TabsTrigger value="contact">Contacts</TabsTrigger>
      </TabsList>
      <TabsContent value="chatroom" className="h-[calc(100%-44px)]">
        <div className="flex flex-col justify-center gap-2">
          {Object.values(userChatData.conversations).map((chatInfo, index) => (
            <div
              key={"chat_" + index}
              className="flex items-center justify-between gap-2 p-2 hover:bg-slate-100 hover:cursor-pointer rounded-lg"
              onClick={() => {
                setCurrentSection("chat");
                setCurrentChatInfo(chatInfo);
              }}
            >
              <div>{chatInfo.roomName}</div>
              <div className="text-xs text-muted-foreground">
                {chatInfo.participantIDs.length} members
              </div>
            </div>
          ))}
        </div>
      </TabsContent>
      <TabsContent value="group" className="h-[calc(100%-44px)]">
        <div className="flex flex-col justify-center gap-2">
          {Object.values(userChatData.conversations)
            .filter((conversation) => conversation.type === "group")
            .map((groupInfo, index) => (
              <div
                key={"group_" + index}
                className="flex items-center justify-between gap-2 p-2 hover:bg-slate-100 hover:cursor-pointer rounded-lg"
                onClick={() => {
                  setCurrentSection("chat");
                  setCurrentChatInfo(groupInfo);
                }}
              >
                <div>{groupInfo.roomName}</div>
                <div className="text-xs text-muted-foreground">
                  {groupInfo.participantIDs.length} members
                </div>
              </div>
            ))}
        </div>
      </TabsContent>
      <TabsContent value="contact" className="h-[calc(100%-44px)]">
        <div className="flex flex-col justify-center gap-1">
          {userChatData.friends.map((friendInfo, index) => (
            <div
              key={"friend_" + index}
              className="flex items-center justify-between gap-2 p-1 hover:bg-slate-100 hover:cursor-pointer rounded-lg"
              onClick={() => {
                setContactInfoDialogOpen(true);
                setContactInfo(friendInfo);
              }}
            >
              <Avatar>
                <AvatarFallback className="bg-slate-200 font-semibold text-lg">
                  {getNameInitials(friendInfo.username)}
                </AvatarFallback>
              </Avatar>
              {friendInfo.username}
              <div></div>
            </div>
          ))}
        </div>
      </TabsContent>
      <ContactInfoDialog
        contactInfoDialogOpen={contactInfoDialogOpen}
        setContactInfoDialogOpen={setContactInfoDialogOpen}
        contactInfo={contactInfo}
        getNameInitials={getNameInitials}
        userConversationsData={Object.values(userChatData.conversations)}
        setCurrentSection={setCurrentSection}
        setCurrentChatInfo={setCurrentChatInfo}
      />
    </Tabs>
  );
};

export default TabsSection;
