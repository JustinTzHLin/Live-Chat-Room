import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import ContactInfoDialog from "./tabsSection/contactInfoDialog";
import { useUserStore, Friend } from "@/stores/userStore";
import getNameInitials from "@/utils/getNameInitials";

const TabsSection = ({
  currentTab,
  setCurrentTab,
  setCurrentSection,
}: {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  setCurrentSection: (section: string) => void;
}) => {
  const { userChatData, setCurrentChatInfo, setMainPageSectionFlow } =
    useUserStore((state) => state);
  const [contactInfoDialogOpen, setContactInfoDialogOpen] = useState(false);
  const [contactInfo, setContactInfo] = useState<Friend>({
    username: "",
    email: "",
    id: "",
    profilePic: null,
  });

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
        <TabsTrigger value="friend">Friends</TabsTrigger>
      </TabsList>
      <TabsContent value="chatroom" className="h-[calc(100%-44px)]">
        <div className="flex flex-col justify-center gap-2">
          {Object.values(userChatData.conversations).map((chatInfo, index) => (
            <div
              key={`chat_${index}`}
              className="flex items-center justify-between gap-2 p-2 hover:cursor-pointer rounded-lg dark:hover:bg-slate-800 hover:bg-slate-100"
              onClick={() => {
                setCurrentSection("chat");
                setCurrentChatInfo(chatInfo);
                setMainPageSectionFlow((prev) => [...prev, "chat"]);
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
                key={`group_${index}`}
                className="flex items-center justify-between gap-2 p-2 hover:cursor-pointer rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                onClick={() => {
                  setCurrentSection("chat");
                  setCurrentChatInfo(groupInfo);
                  setMainPageSectionFlow((prev) => [...prev, "chat"]);
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
      <TabsContent value="friend" className="h-[calc(100%-44px)]">
        <div className="flex flex-col justify-center gap-1">
          {userChatData.friends.map((friendInfo, index) => (
            <div
              key={`friend_${index}`}
              className="flex items-center justify-between gap-2 p-1 hover:cursor-pointer rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              onClick={() => {
                setContactInfoDialogOpen(true);
                setContactInfo(friendInfo);
              }}
            >
              <Avatar>
                <AvatarFallback className="font-semibold text-lg bg-slate-200 dark:bg-slate-700">
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
        setCurrentSection={setCurrentSection}
      />
    </Tabs>
  );
};

export default TabsSection;
