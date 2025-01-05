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
} from "lucide-react";

const NavBar = ({ username }: { username: string }) => {
  return (
    <div className="flex w-full">
      <div className="w-1/2 p-4">
        <div className="text-sm text-muted-foreground">Welcome,</div>
        <div className="text-xl font-semibold">{username}</div>
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
            <DropdownMenuItem>
              <UserPlus style={{ width: "18px", height: "18px" }} />
              Add Friend
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Users style={{ width: "18px", height: "18px" }} />
              Add Group
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Inbox style={{ width: "18px", height: "18px" }} />
              Invites
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
    </div>
  );
};

export default NavBar;
