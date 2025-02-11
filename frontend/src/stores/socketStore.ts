import { create } from "zustand";
import { io } from "socket.io-client";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

interface socketState {
  socket: any;
  connect: (onMaxRetries: () => void) => void;
  disconnect: () => void;
}

export const useSocketStore = create<socketState>((set) => ({
  socket: null,
  connect: (onMaxRetries: () => void) => {
    const socketInstance = io(BACKEND_URL);
    let retryCount = 0;
    socketInstance.on("connect", () => {
      retryCount = 0;
      console.log("Connected to the socket!");
    });
    socketInstance.on("connect_error", (err) => {
      retryCount++;
      console.error(`Connection attempt ${retryCount} failed:`, err);
      if (retryCount >= 5) {
        onMaxRetries();
        useSocketStore.getState().disconnect();
      }
    });
    set({ socket: socketInstance });
  },
  disconnect: () => {
    set((state) => {
      state.socket?.disconnect();
      console.log("Disconnected from the socket!");
      return { socket: null };
    });
  },
}));

export default useSocketStore;
