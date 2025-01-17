import { create } from "zustand";
import { io } from "socket.io-client";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

interface socketState {
  socket: any;
  connect: () => void;
  disconnect: () => void;
}

export const useSocketStore = create<socketState>((set) => ({
  socket: null,
  connect: () => {
    const socketInstance = io(BACKEND_URL);
    set({ socket: socketInstance });
  },
  disconnect: () => {
    set((state) => {
      state.socket?.disconnect();
      return { socket: null };
    });
  },
}));

export default useSocketStore;
