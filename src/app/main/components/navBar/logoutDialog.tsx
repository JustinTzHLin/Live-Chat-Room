import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useSocketStore } from "@/stores/socketStore";
import useUnexpectedErrorHandler from "@/utils/useUnexpectedErrorHandler";
import { useTheme } from "next-themes";
import axios from "axios";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

const LogoutDialog = ({
  logoutDialogOpen,
  setLogoutDialogOpen,
}: {
  logoutDialogOpen: boolean;
  setLogoutDialogOpen: (open: boolean) => void;
}) => {
  const disconnect = useSocketStore((state) => state.disconnect);
  const { handleUnexpectedError } = useUnexpectedErrorHandler();
  const { resolvedTheme } = useTheme();
  const router = useRouter();
  const { toast } = useToast();

  const handleLogout = useCallback(async () => {
    try {
      const logoutResponse = await axios(`${BACKEND_URL}/token/logout`, {
        withCredentials: true,
      });
      if (logoutResponse.data.success) {
        router.push("/");
        disconnect();
        toast({
          title: "Logout successful",
          description: "You have been logged out.",
          duration: 3000,
        });
      }
    } catch (err) {
      handleUnexpectedError(err);
    }
  }, []);

  return (
    <Dialog open={logoutDialogOpen} onOpenChange={setLogoutDialogOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-xl">Log Out</DialogTitle>
          <DialogDescription>
            Any unsaved changes may be lost.
            <br />
            Are you sure you want to log out?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <div className="flex justify-center gap-4">
            <Button
              variant={resolvedTheme === "dark" ? "outline" : "secondary"}
              onClick={() => setLogoutDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant={resolvedTheme === "dark" ? "secondary" : "default"}
              onClick={handleLogout}
            >
              Logout
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default LogoutDialog;
