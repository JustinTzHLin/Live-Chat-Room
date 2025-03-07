import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Bolt,
  EllipsisVertical,
  Search,
  UserPlus,
  Users,
  Inbox,
  LogOut,
} from "lucide-react";
import AddFriendDialog from "./navBar/addFriendDiallog";
import NewGroupDialog from "./navBar/newGroupDialog";
import FriendRequestsDialog from "./navBar/friendRequestsDialog";
import LogoutDialog from "./navBar/logoutDialog";
import { useUserStore } from "@/stores/userStore";

const NavBar = ({
  setCurrentSection,
}: {
  setCurrentSection: (section: string) => void;
}) => {
  const {
    userInformation,
    setSearchInput,
    setSearchResult,
    setMainPageSectionFlow,
  } = useUserStore((state) => state);
  const [addFriendDialogOpen, setAddFriendDialogOpen] = useState(false);
  const [newGroupDialogOpen, setNewGroupDialogOpen] = useState(false);
  const [friendRequestsDialogOpen, setFriendRequestsDialogOpen] =
    useState(false);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

  return (
    <div className="flex w-full justify-between">
      <div
        className="p-4 hover:cursor-pointer"
        onClick={() => {
          setCurrentSection("tabs");
          setMainPageSectionFlow(["tabs"]);
        }}
      >
        <div className="text-sm text-muted-foreground">Welcome,</div>
        <div className="text-xl font-semibold">{userInformation.username}</div>
      </div>
      <div className="flex items-center justify-end pr-4 gap-1">
        <Button
          variant="ghost"
          size="icon"
          type="button"
          className="text-muted-foreground w-10 h-10 hover:bg-transparent"
          onClick={() => {
            setCurrentSection("search");
            setMainPageSectionFlow((prev) => {
              if (prev.at(-1) === "search") {
                return prev;
              }
              setSearchInput("");
              setSearchResult({ friends: [], messages: [], rooms: [] });
              return [...prev, "search"];
            });
          }}
        >
          <Search style={{ width: "28px", height: "28px" }} />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              type="button"
              className="text-muted-foreground w-10 h-10 hover:bg-transparent"
            >
              <EllipsisVertical style={{ width: "28px", height: "28px" }} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>Social</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="hover:cursor-pointer"
              onClick={() => setAddFriendDialogOpen(true)}
            >
              <UserPlus style={{ width: "18px", height: "18px" }} />
              Add Friend
            </DropdownMenuItem>
            <DropdownMenuItem
              className="hover:cursor-pointer"
              onClick={() => setNewGroupDialogOpen(true)}
            >
              <Users style={{ width: "18px", height: "18px" }} />
              New Group
            </DropdownMenuItem>
            <DropdownMenuItem
              className="hover:cursor-pointer"
              onClick={() => setFriendRequestsDialogOpen(true)}
            >
              <Inbox style={{ width: "18px", height: "18px" }} />
              Feiend Requests
            </DropdownMenuItem>
            <DropdownMenuItem
              className="hover:cursor-pointer"
              onClick={() => setLogoutDialogOpen(true)}
            >
              <LogOut style={{ width: "18px", height: "18px" }} />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button
          variant="ghost"
          size="icon"
          type="button"
          className="text-muted-foreground w-10 h-10 hover:bg-transparent"
          onClick={() => {
            setCurrentSection("settings");
            setMainPageSectionFlow((prev) => {
              if (prev.at(-1) === "settings") return prev;
              return [...prev, "settings"];
            });
          }}
        >
          <Bolt style={{ width: "28px", height: "28px" }} />
        </Button>
      </div>
      <AddFriendDialog
        addFriendDialogOpen={addFriendDialogOpen}
        setAddFriendDialogOpen={setAddFriendDialogOpen}
      />
      <NewGroupDialog
        newGroupDialogOpen={newGroupDialogOpen}
        setNewGroupDialogOpen={setNewGroupDialogOpen}
      />
      <FriendRequestsDialog
        friendRequestsDialogOpen={friendRequestsDialogOpen}
        setFriendRequestsDialogOpen={setFriendRequestsDialogOpen}
      />
      <LogoutDialog
        logoutDialogOpen={logoutDialogOpen}
        setLogoutDialogOpen={setLogoutDialogOpen}
      />
    </div>
  );
};

export default NavBar;
