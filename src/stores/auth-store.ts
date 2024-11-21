import { createStore } from "zustand/vanilla";

export type AuthState = {
  authAction: string; // login, signup
  inputStatus: string; // email, password, registration
};

export type AuthActions = {
  updateAuthAction: (authAction: AuthState["authAction"]) => void;
  updateInputStatus: (inputStatus: AuthState["inputStatus"]) => void;
};

export type AuthStore = AuthState & AuthActions;

export const defaultAuthState: AuthState = {
  authAction: "login",
  inputStatus: "email",
};

export const createAuthStore = (initstate: AuthState = defaultAuthState) => {
  return createStore<AuthStore>((set) => ({
    ...initstate,
    updateAuthAction: (authAction: AuthState["authAction"]) =>
      set({ authAction }),
    updateInputStatus: (inputStatus: AuthState["inputStatus"]) =>
      set({ inputStatus }),
  }));
};
