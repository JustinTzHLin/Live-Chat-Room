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

interface Message {
  conversationId: string;
  senderId: string;
  content: string;
  timestamp: string;
  readBy: string[];
  status: string;
}

interface Conversation {
  conversationId: string;
  participantIDs: string[];
  messages: Message[];
  roomName: string;
  type: string;
}

interface Friend {
  id: string;
  username: string;
  email: string;
}

interface UserChatData {
  conversations: {
    [key: string]: Conversation;
  };
  friends: Friend[];
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

  userChatData: UserChatData;
  setUserChatData: (
    userChatData: UserChatData | ((userChatData: UserChatData) => UserChatData)
  ) => void;

  currentChatInfo: Conversation;
  setCurrentChatInfo: (
    currentChatInfo:
      | Conversation
      | ((currentChatInfo: Conversation) => Conversation)
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

  userChatData: {
    conversations: {},
    friends: [],
  },
  setUserChatData: (update) =>
    set((state) => ({
      userChatData:
        typeof update === "function"
          ? (update as (userChatData: UserChatData) => UserChatData)(
              state.userChatData
            )
          : update,
    })),

  currentChatInfo: {
    messages: [],
    participantIDs: [],
    roomName: "",
    type: "",
    conversationId: "",
  },
  setCurrentChatInfo: (update) =>
    set((state) => ({
      currentChatInfo:
        typeof update === "function"
          ? (update as (currentChatInfo: Conversation) => Conversation)(
              state.currentChatInfo
            )
          : update,
    })),
}));
