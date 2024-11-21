"use client";

import { type ReactNode, createContext, useRef, useContext, use } from "react";
import { useStore } from "zustand";

import { type AuthStore, createAuthStore } from "@/stores/auth-store";

export type AuthstoreApi = ReturnType<typeof createAuthStore>;

export const AuthstoreContext = createContext<AuthstoreApi | undefined>(
  undefined
);

export interface AuthStoreProviderProps {
  children: ReactNode;
}

export const AuthStoreProvider = ({ children }: AuthStoreProviderProps) => {
  const storeRef = useRef<AuthstoreApi>();
  if (!storeRef.current) {
    storeRef.current = createAuthStore();
  }

  return (
    <AuthstoreContext.Provider value={storeRef.current}>
      {children}
    </AuthstoreContext.Provider>
  );
};

export const useAuthStore = <T,>(selector: (state: AuthStore) => T): T => {
  const authStoreContext = useContext(AuthstoreContext);

  if (!authStoreContext) {
    throw new Error("useAuthStore must be used within AuthStoreProvider");
  }

  return useStore(authStoreContext, selector);
};
