import { createStore } from "zustand/vanilla";

export type AuthState = {
  authAction: string; // login, signup, register, 2fa
  previousURL: string; // NONE, /home
};

export type AuthActions = {
  updateAuthAction: (authAction: AuthState["authAction"]) => void;
  updatePreviousURL: (previousURL: AuthState["previousURL"]) => void;
};

export type AuthStore = AuthState & AuthActions;

export const defaultAuthState: AuthState = {
  authAction: "login",
  previousURL: "NONE",
};

export const createAuthStore = (initstate: AuthState = defaultAuthState) => {
  return createStore<AuthStore>((set) => ({
    ...initstate,
    updateAuthAction: (authAction: AuthState["authAction"]) =>
      set({ authAction }),
    updatePreviousURL: (previousURL: AuthState["previousURL"]) =>
      set({ previousURL }),
  }));
};
