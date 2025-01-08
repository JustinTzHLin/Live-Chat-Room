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
import FriendRequestsDialog from "./navBar/friendRequestsDialog";
import LogoutDialog from "./navBar/logoutDialog";

const NavBar = ({
  userInformation,
  friendsList,
  toast,
  socket,
}: {
  userInformation: {
    userId: string;
    username: string;
    email: string;
    createdAt: Date;
    lastActive: Date;
  };
  friendsList: any[];
  toast: any;
  socket: any;
}) => {
  const [addFriendDialogOpen, setAddFriendDialogOpen] = useState(false);
  const [friendRequestsDialogOpen, setFriendRequestsDialogOpen] =
    useState(false);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

  return (
    <div className="flex w-full">
      <div className="w-1/2 p-4">
        <div className="text-sm text-muted-foreground">Welcome,</div>
        <div className="text-xl font-semibold">{userInformation.username}</div>
      </div>
      <div className="flex w-1/2 items-center justify-end pr-4 gap-1">
        <Button
          variant="ghost"
          size="icon"
          type="button"
          className="text-muted-foreground rounded-full w-10 h-10"
          onClick={() => {
            alert("search");
          }}
        >
          <Search style={{ width: "26px", height: "26px" }} />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              type="button"
              className="text-muted-foreground rounded-full w-10 h-10"
            >
              <EllipsisVertical style={{ width: "26px", height: "26px" }} />
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
            <DropdownMenuItem className="hover:cursor-pointer">
              <Users style={{ width: "18px", height: "18px" }} />
              Add Group
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
          className="text-muted-foreground rounded-full w-10 h-10"
          onClick={() => {
            alert("setting");
          }}
        >
          <Bolt style={{ width: "26px", height: "26px" }} />
        </Button>
      </div>
      {addFriendDialogOpen && (
        <AddFriendDialog
          addFriendDialogOpen={addFriendDialogOpen}
          setAddFriendDialogOpen={setAddFriendDialogOpen}
          userInformation={userInformation}
          friendsList={friendsList}
          toast={toast}
          socket={socket}
        />
      )}
      {friendRequestsDialogOpen && (
        <FriendRequestsDialog
          friendRequestsDialogOpen={friendRequestsDialogOpen}
          setFriendRequestsDialogOpen={setFriendRequestsDialogOpen}
          userId={userInformation.userId}
          socket={socket}
        />
      )}
      <LogoutDialog
        logoutDialogOpen={logoutDialogOpen}
        setLogoutDialogOpen={setLogoutDialogOpen}
        toast={toast}
      />
    </div>
  );
};

export default NavBar;
