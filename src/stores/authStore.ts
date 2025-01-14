import { create } from "zustand";

interface AuthState {
  authAction: string; // login, signup, register, 2fa
  previousURL: string; // NONE, /home
  updateAuthAction: (authAction: string) => void;
  updatePreviousURL: (previousURL: string) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  authAction: "login",
  previousURL: "NONE",
  updateAuthAction: (authAction: string) => set({ authAction }),
  updatePreviousURL: (previousURL: string) => set({ previousURL }),
}));
