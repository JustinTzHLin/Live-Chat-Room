import { create } from "zustand";

interface UserInformation {
  userId: string;
  username: string;
  email: string;
  jicId: string | null;
  twoFactor: string;
  createdAt: Date;
  lastActive: Date;
}

interface userState {
  userInformation: UserInformation;
  setUsername: (username: string) => void;
  setJicId: (jicId: string) => void;
  setTwoFactor: (twoFactor: string) => void;
  setUserInformation: (
    userInformation:
      | UserInformation
      | ((userInformation: UserInformation) => UserInformation)
  ) => void;
}

export const useUserStore = create<userState>((set) => ({
  userInformation: {
    userId: "",
    username: "",
    email: "",
    jicId: null,
    twoFactor: "none",
    createdAt: new Date(),
    lastActive: new Date(),
  },
  setUsername: (username: string) =>
    set((state) => ({
      userInformation: { ...state.userInformation, username },
    })),
  setJicId: (jicId: string) =>
    set((state) => ({
      userInformation: { ...state.userInformation, jicId },
    })),
  setTwoFactor: (twoFactor: string) =>
    set((state) => ({
      userInformation: { ...state.userInformation, twoFactor },
    })),
  setUserInformation: (update) =>
    set((state) => ({
      userInformation:
        typeof update === "function"
          ? (update as (userInformation: UserInformation) => UserInformation)(
              state.userInformation
            )
          : update,
    })),
}));
