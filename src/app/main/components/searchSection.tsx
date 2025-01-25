import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronLeft, X, TextSearch } from "lucide-react";
import { useUserStore } from "@/stores/userStore";
import { Message } from "@/stores/userStore";
import ContactInfoDialog from "./tabsSection/contactInfoDialog";
import getNameInitials from "@/utils/getNameInitials";

const SearchSection = ({
  setCurrentSection,
}: {
  setCurrentSection: (section: string) => void;
}) => {
  const [contactInfoDialogOpen, setContactInfoDialogOpen] = useState(false);
  const [searching, setSearching] = useState(false);
  const [contactInfo, setContactInfo] = useState<{
    username: string;
    email: string;
    id: string;
  }>({
    username: "",
    email: "",
    id: "",
  });
  const {
    userChatData,
    setCurrentChatInfo,
    searchInput,
    setSearchInput,
    searchResult,
    setSearchResult,
    debounceSearchTimeout,
    setDebounceSearchTimeout,
    mainPageSectionFlow,
    setMainPageSectionFlow,
  } = useUserStore((state) => state);

  const handleSearch = useCallback(
    (searchInput: string) => {
      if (!searchInput)
        return setSearchResult({ friends: [], messages: [], rooms: [] });
      const searchInputLower = searchInput.toLowerCase();
      const newSearchFriends = userChatData.friends.filter(
        (friend) =>
          friend.username.toLowerCase().includes(searchInputLower) ||
          friend.email.toLowerCase().includes(searchInputLower)
      );
      const newSearchMessages: (Message & { messageIndex: number })[] = [];
      const newSearchRooms: string[] = [];
      for (const conversation of Object.values(userChatData.conversations)) {
        conversation.messages.forEach((message, messageIndex) => {
          if (message.content.toLowerCase().includes(searchInputLower)) {
            newSearchMessages.push({ ...message, messageIndex });
          }
        });
        if (conversation.roomName.toLowerCase().includes(searchInputLower)) {
          newSearchRooms.push(conversation.conversationId);
        }
      }
      setSearchResult({
        friends: newSearchFriends,
        messages: newSearchMessages,
        rooms: newSearchRooms,
      });
      setSearching(false);
    },
    [userChatData]
  );

  return (
    <div className="w-full h-[calc(100%-80px)] flex flex-col items-center">
      <div className="w-full flex items-center justify-center h-10">
        <Button
          variant="ghost"
          size="icon"
          type="button"
          className="text-muted-foreground rounded-full w-10 h-10 absolute left-2"
          onClick={() => {
            setCurrentSection(mainPageSectionFlow.at(-2) || "tabs");
            setMainPageSectionFlow(mainPageSectionFlow.slice(0, -1));
          }}
        >
          <ChevronLeft style={{ width: "26px", height: "26px" }} />
        </Button>
        <div className="text-xl font-semibold">Search</div>
      </div>
      <div className=" mt-2 flex w-full px-4">
        <div className="relative w-full">
          <TextSearch className="absolute left-2 top-2 h-5 w-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Anything..."
            className="w-full pr-8 pl-9"
            value={searchInput}
            onChange={(e) => {
              setSearching(true);
              setSearchInput(e.target.value);
              handleSearch("");
              if (debounceSearchTimeout) clearTimeout(debounceSearchTimeout);
              setDebounceSearchTimeout(
                setTimeout(() => {
                  handleSearch(e.target.value);
                }, 500)
              );
            }}
            autoFocus
          />
          <Button
            variant="ghost"
            size="icon"
            type="button"
            onClick={() => {
              setSearchInput("");
              if (debounceSearchTimeout) clearTimeout(debounceSearchTimeout);
              handleSearch("");
              setDebounceSearchTimeout(null);
            }}
            className="absolute right-1 top-1.5 h-6 w-6 text-muted-foreground hover:bg-transparent rounded-full"
          >
            <X />
          </Button>
        </div>
      </div>
      <ScrollArea className="w-full h-[calc(100%-92px)] p-2 px-4">
        {!searchInput ? (
          <p className="mt-2 text-center text-lg font-medium text-muted-foreground">
            No Search Input
          </p>
        ) : searching ? (
          <p className="mt-2 text-center text-lg font-medium text-muted-foreground">
            Searching...
          </p>
        ) : searchResult.friends.length === 0 &&
          searchResult.messages.length === 0 &&
          searchResult.rooms.length === 0 ? (
          <p className="mt-2 text-center text-lg font-medium text-muted-foreground">
            No Results
          </p>
        ) : null}
        {searchResult.friends.length > 0 && (
          <p className="mt-2 text-left text-lg font-medium">Friends</p>
        )}
        {searchResult.friends.map((friendInfo) => (
          <div
            key={`friend_${friendInfo.id}`}
            className="mt-2 flex h-10 items-center justify-between gap-2 rounded-lg hover:cursor-pointer bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700"
            onClick={() => {
              setContactInfoDialogOpen(true);
              setContactInfo(friendInfo);
            }}
          >
            <p className="w-10 text-lg text-center font-semibold">
              {getNameInitials(friendInfo.username)}
            </p>
            <p className="text-lg">{friendInfo.username}</p>
            <div className="w-10"></div>
          </div>
        ))}
        {searchResult.messages.length > 0 && (
          <p className="mt-2 text-left text-lg font-medium">Messages</p>
        )}
        {searchResult.messages.map((message) => (
          <div
            key={`conversation_${message.conversationId}_message_${message.messageIndex}`}
            className="mt-2 flex flex-col items-start gap-2 p-2 px-4 rounded-lg hover:cursor-pointer bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700"
            onClick={() => {
              setCurrentSection("chat");
              setCurrentChatInfo(
                userChatData.conversations[message.conversationId]
              );
              setMainPageSectionFlow([...mainPageSectionFlow, "chat"]);
            }}
          >
            <p className="text-lg font-medium">{`${
              userChatData.conversations[message.conversationId].roomName
            } :`}</p>
            <p className="ml-2 font-medium">{`${message.senderName} :`}</p>
            <p className="ml-4 text-sm">{message.content}</p>
          </div>
        ))}
        {searchResult.rooms.length > 0 && (
          <p className="mt-2 text-left text-lg font-medium">Rooms</p>
        )}
        {searchResult.rooms.map((room) => (
          <div
            key={`conversation_${room}`}
            className="mt-2 flex h-10 items-center justify-between gap-2 p-4 rounded-lg hover:cursor-pointer bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700"
            onClick={() => {
              setCurrentSection("chat");
              setCurrentChatInfo(userChatData.conversations[room]);
              setMainPageSectionFlow([...mainPageSectionFlow, "chat"]);
            }}
          >
            <p>{userChatData.conversations[room].roomName}</p>
            <div className="text-xs text-muted-foreground">
              {userChatData.conversations[room].participantIDs.length} members
            </div>
          </div>
        ))}
      </ScrollArea>
      <ContactInfoDialog
        contactInfoDialogOpen={contactInfoDialogOpen}
        setContactInfoDialogOpen={setContactInfoDialogOpen}
        contactInfo={contactInfo}
        setCurrentSection={setCurrentSection}
      />
    </div>
  );
};

export default SearchSection;
