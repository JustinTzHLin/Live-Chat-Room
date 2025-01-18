import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronLeft, X } from "lucide-react";
import { useUserStore } from "@/stores/userStore";

const SearchSection = ({
  setCurrentSection,
}: {
  setCurrentSection: (section: string) => void;
}) => {
  const [searchInput, setSearchInput] = useState("");
  const {
    userChatData,
    searchResult,
    setSearchResult,
    debounceSearchTimeout,
    setDebounceSearchTimeout,
  } = useUserStore((state) => state);

  const handleSearch = (searchInput: string) => {
    if (!searchInput)
      return setSearchResult({ friends: [], messages: [], rooms: [] });
    const searchInputLower = searchInput.toLowerCase();
    const newSearchFriends = userChatData.friends.filter(
      (friend) =>
        friend.username.toLowerCase().includes(searchInputLower) ||
        friend.email.toLowerCase().includes(searchInputLower)
    );
    const newSearchMessages = Object.fromEntries(
      Object.entries(userChatData.conversations).filter(([_, conversation]) =>
        conversation.messages.some((message) =>
          message.content.toLowerCase().includes(searchInputLower)
        )
      )
    );
    const newSearchRooms = Object.fromEntries(
      Object.entries(userChatData.conversations).filter(([_, conversation]) =>
        conversation.roomName.toLowerCase().includes(searchInputLower)
      )
    );
    setSearchResult({
      friends: newSearchFriends,
      messages: Object.values(newSearchMessages),
      rooms: Object.values(newSearchRooms),
    });
  };

  return (
    <div className="w-full h-[calc(100%-80px)] flex flex-col items-center">
      <div className="w-full flex items-center justify-center h-10">
        <Button
          variant="ghost"
          size="icon"
          type="button"
          className="text-muted-foreground rounded-full w-10 h-10 absolute left-2"
          onClick={() => {
            setCurrentSection("tabs");
          }}
        >
          <ChevronLeft style={{ width: "26px", height: "26px" }} />
        </Button>
        <div className="text-xl font-semibold">Search</div>
      </div>
      <div className="flex flex-col items-center justify-center w-full px-4">
        <div className="relative w-full">
          <Input
            type="text"
            placeholder="Anything..."
            className="w-full"
            value={searchInput}
            onChange={(e) => {
              setSearchInput(e.target.value);
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
      <ScrollArea className="mt-2 w-full h-[calc(100%-84px)] p-4 bg-gray-100">
        <p>{JSON.stringify(searchResult)}</p>
      </ScrollArea>
    </div>
  );
};

export default SearchSection;
