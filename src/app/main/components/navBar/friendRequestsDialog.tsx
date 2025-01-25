import { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, Check, Trash2 } from "lucide-react";
import { useUserStore } from "@/stores/userStore";
import { useSocketStore } from "@/stores/socketStore";
import getNameInitials from "@/utils/getNameInitials";
import useUnexpectedErrorHandler from "@/utils/useUnexpectedErrorHandler";
import axios from "axios";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

const FriendRequestsDialog = ({
  friendRequestsDialogOpen,
  setFriendRequestsDialogOpen,
}: {
  friendRequestsDialogOpen: boolean;
  setFriendRequestsDialogOpen: (open: boolean) => void;
}) => {
  const userId = useUserStore((state) => state.userInformation.userId);
  const socket = useSocketStore((state) => state.socket);
  const [fetchingFriendRequests, setFetchingFriendRequests] =
    useState<boolean>(false);
  const [friendRequests, setFriendRequests] = useState<{
    sent: any[];
    received: any[];
  }>({
    sent: [],
    received: [],
  });
  const { handleUnexpectedError } = useUnexpectedErrorHandler();

  useEffect(() => {
    const fetchFriendRequests = async () => {
      setFetchingFriendRequests(true);
      try {
        const fetchFriendRequestsResponse = await axios(
          `${BACKEND_URL}/user/fetchFriendRequests`,
          { withCredentials: true }
        );
        if (fetchFriendRequestsResponse.data.friendRequestsFetched)
          setFriendRequests(fetchFriendRequestsResponse.data.friendRequests);
      } catch (err) {
        handleUnexpectedError(err);
      } finally {
        setFetchingFriendRequests(false);
      }
    };
    fetchFriendRequests();
  }, []);

  useEffect(() => {
    const handleSocketSentFriendRequest = (request: any) => {
      if (request.sender.senderId === userId) {
        delete request.sender;
        setFriendRequests((prev) => ({
          ...prev,
          sent: [...prev.sent, request],
        }));
      } else if (request.receiver.receiverId === userId) {
        delete request.receiver;
        setFriendRequests((prev) => ({
          ...prev,
          received: [...prev.received, request],
        }));
      }
    };
    const handleSocketFriendRequestAction = (request: any) => {
      if (request.senderId === userId) {
        setFriendRequests((prev) => ({
          ...prev,
          sent: prev.sent.filter(
            (sentRequest) => sentRequest.id !== request.id
          ),
        }));
      } else if (request.receiverId === userId) {
        setFriendRequests((prev) => ({
          ...prev,
          received: prev.received.filter(
            (receivedRequest) => receivedRequest.id !== request.id
          ),
        }));
      }
    };
    if (socket) {
      socket.on("receive_friend_request", handleSocketSentFriendRequest);
      socket.on(
        "canceled_rejected_friend_request",
        handleSocketFriendRequestAction
      );
      socket.on("accepted_friend_request", handleSocketFriendRequestAction);
      return () => {
        socket.off("receive_friend_request", handleSocketSentFriendRequest);
        socket.off(
          "canceled_rejected_friend_request",
          handleSocketFriendRequestAction
        );
        socket.off("accepted_friend_request", handleSocketFriendRequestAction);
      };
    }
  }, [socket, userId]);

  const handleRequestAction = useCallback(
    async (action: string, requestId: string) => {
      try {
        const requestActionResponse = await axios.post(
          `${BACKEND_URL}/user/friendRequestAction`,
          { action, requestId },
          { withCredentials: true }
        );
        if (action === "cancel" || action === "reject") {
          socket.emit("cancel_reject_friend_request", {
            id: requestActionResponse.data.updatedFriendRequest._id,
            senderId: requestActionResponse.data.updatedFriendRequest.senderId,
            receiverId:
              requestActionResponse.data.updatedFriendRequest.receiverId,
          });
        } else if (action === "accept") {
          socket.emit("accept_friend_request", {
            id: requestActionResponse.data.updatedFriendRequest._id,
            senderId: requestActionResponse.data.updatedFriendRequest.senderId,
            sender: requestActionResponse.data.updatedFriendRequest.sender,
            receiverId:
              requestActionResponse.data.updatedFriendRequest.receiverId,
            receiver: requestActionResponse.data.updatedFriendRequest.receiver,
          });
        }
      } catch (err) {
        handleUnexpectedError(err);
      }
    },
    []
  );

  return (
    <Dialog
      open={friendRequestsDialogOpen}
      onOpenChange={setFriendRequestsDialogOpen}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-xl">Friend Requests</DialogTitle>
          <DialogDescription></DialogDescription>
          <p className="text-left text-lg font-medium">Received</p>
          {fetchingFriendRequests ? (
            <div className="h-10 flex justify-center items-center text-slate-600 dark:text-slate-400">
              Loading...
            </div>
          ) : friendRequests.received.length === 0 ? (
            <div className="h-10 flex justify-center items-center text-slate-600 dark:text-slate-400">
              None Pending
            </div>
          ) : (
            friendRequests.received.map((request) => (
              <div
                key={request.id}
                className="flex items-center justify-between rounded-lg bg-slate-100 dark:bg-slate-800"
              >
                <p className="ml-3 text-lg font-semibold">
                  {getNameInitials(request.sender.username)}
                </p>
                <p className="text-lg">{request.sender.username}</p>
                <div className="flex">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="ml-[-24px] w-6 h-10 text-muted-foreground"
                    onClick={() => handleRequestAction("accept", request.id)}
                  >
                    <Check style={{ width: "24px", height: "24px" }} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-10 h-10 text-muted-foreground"
                    onClick={() => handleRequestAction("reject", request.id)}
                  >
                    <X style={{ width: "24px", height: "24px" }} />
                  </Button>
                </div>
              </div>
            ))
          )}
          <p className="text-left text-lg !mt-4 font-medium">Sent</p>
          {fetchingFriendRequests ? (
            <div className="h-10 flex justify-center items-center text-slate-600 dark:text-slate-400">
              Loading...
            </div>
          ) : friendRequests.sent.length === 0 ? (
            <div className="h-10 flex justify-center items-center text-slate-600 dark:text-slate-400">
              None Pending
            </div>
          ) : (
            friendRequests.sent.map((request) => (
              <div
                key={request.id}
                className="flex items-center justify-between rounded-lg bg-slate-100 dark:bg-slate-800"
              >
                <p className="ml-3 text-lg font-semibold">
                  {getNameInitials(request.receiver.username)}
                </p>
                <p className="text-lg">{request.receiver.username}</p>
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-10 h-10 text-muted-foreground"
                  onClick={() => handleRequestAction("cancel", request.id)}
                >
                  <Trash2 style={{ width: "24px", height: "24px" }} />
                </Button>
              </div>
            ))
          )}
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export default FriendRequestsDialog;
