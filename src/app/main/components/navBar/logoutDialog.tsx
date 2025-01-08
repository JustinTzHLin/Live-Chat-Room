import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import axios from "axios";

const LogoutDialog = ({
  logoutDialogOpen,
  setLogoutDialogOpen,
  toast,
}: {
  logoutDialogOpen: boolean;
  setLogoutDialogOpen: (open: boolean) => void;
  toast: any;
}) => {
  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
  const router = useRouter();
  const handleLogout = async () => {
    try {
      const logoutResponse = await axios(BACKEND_URL + "/token/logout", {
        withCredentials: true,
      });
      if (logoutResponse.data.success) {
        toast({
          title: "Logout successful",
          description: "You have been logged out.",
          duration: 3000,
        });
        return router.push("/");
      }
    } catch (error) {
      console.error(error);
    }
  };

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
              variant="secondary"
              onClick={() => setLogoutDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleLogout}>Logout</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default LogoutDialog;
