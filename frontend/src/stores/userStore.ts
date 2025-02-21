import { create } from "zustand";

interface ProfilePic {
  name: string;
  size: number;
  type: string;
  buffer: {
    type: string;
    data: Buffer;
  };
}

interface UserInformation {
  userId: string;
  username: string;
  email: string;
  jicId: string | null;
  twoFactor: string;
  theme: string;
  timeZone: string | null;
  profilePic: ProfilePic | null;
  createdAt: Date;
  lastActive: Date;
}

export interface Message {
  conversationId: string;
  senderId: string;
  senderName: string;
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

export interface Friend {
  id: string;
  username: string;
  email: string;
  profilePic: ProfilePic | null;
}

interface UserChatData {
  conversations: {
    [conversationId: string]: Conversation;
  };
  friends: Friend[];
}

interface SearchResult {
  messages: (Message & { messageIndex: number })[];
  friends: Friend[];
  rooms: string[];
}

interface userState {
  // user information
  userInformation: UserInformation;
  setUsername: (username: string) => void;
  setJicId: (jicId: string) => void;
  setTwoFactor: (twoFactor: string) => void;
  setUserInformation: (
    userInformation:
      | UserInformation
      | ((userInformation: UserInformation) => UserInformation)
  ) => void;

  // user chat data
  userChatData: UserChatData;
  setUserChatData: (
    userChatData: UserChatData | ((userChatData: UserChatData) => UserChatData)
  ) => void;

  // current chat info
  currentChatInfo: Conversation;
  setCurrentChatInfo: (
    currentChatInfo:
      | Conversation
      | ((currentChatInfo: Conversation) => Conversation)
  ) => void;

  // search result
  searchInput: string;
  setSearchInput: (
    searchInput: string | ((searchInput: string) => string)
  ) => void;
  searchResult: SearchResult;
  setSearchResult: (
    searchResult: SearchResult | ((searchResult: SearchResult) => SearchResult)
  ) => void;
  debounceSearchTimeout: NodeJS.Timeout | null;
  setDebounceSearchTimeout: (timeout: NodeJS.Timeout | null) => void;

  // main page section flow
  mainPageSectionFlow: string[];
  setMainPageSectionFlow: (
    mainPageSectionFlow:
      | string[]
      | ((mainPageSectionFlow: string[]) => string[])
  ) => void;
}

export const useUserStore = create<userState>((set) => ({
  // user information
  userInformation: {
    userId: "",
    username: "",
    email: "",
    jicId: null,
    twoFactor: "none",
    theme: "system",
    timeZone: null,
    profilePic: null,
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

  // user chat data
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

  // current chat info
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

  // search result
  searchInput: "",
  setSearchInput: (update) =>
    set((state) => ({
      searchInput:
        typeof update === "function"
          ? (update as (searchInput: string) => string)(state.searchInput)
          : update,
    })),
  searchResult: {
    messages: [],
    friends: [],
    rooms: [],
  },
  setSearchResult: (update) =>
    set((state) => ({
      searchResult:
        typeof update === "function"
          ? (update as (searchResult: SearchResult) => SearchResult)(
              state.searchResult
            )
          : update,
    })),
  debounceSearchTimeout: null,
  setDebounceSearchTimeout: (timeout: NodeJS.Timeout | null) =>
    set({ debounceSearchTimeout: timeout }),

  // main page section flow
  mainPageSectionFlow: [],
  setMainPageSectionFlow: (update) =>
    set((state) => ({
      mainPageSectionFlow:
        typeof update === "function"
          ? (update as (mainPageSectionFlow: string[]) => string[])(
              state.mainPageSectionFlow
            )
          : update,
    })),
}));
