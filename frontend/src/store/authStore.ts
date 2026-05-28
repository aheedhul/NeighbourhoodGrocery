import { create } from "zustand";

import type { User, UserRole } from "../types";
import { login as loginRequest, register as registerRequest, type LoginPayload, type RegisterPayload } from "../api/auth";
import { getApiError } from "../utils/errors";

export type AuthState = {
  user?: User;
  loading: boolean;
  error?: string;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => void;
  setUser: (user?: User) => void;
};

export const useAuthStore = create<AuthState>((set: (state: Partial<AuthState>) => void) => ({
  user: undefined,
  loading: false,
  error: undefined,
  async login(payload: LoginPayload) {
    set({ loading: true, error: undefined });
    try {
      const { token, user } = await loginRequest(payload);
      localStorage.setItem("ng_token", token);
      localStorage.setItem("ng_user", JSON.stringify(user));
      set({ user, loading: false });
    } catch (error) {
      set({ error: getApiError(error, "Login failed. Check your credentials."), loading: false });
    }
  },
  async register(payload: RegisterPayload) {
    set({ loading: true, error: undefined });
    try {
      const { token, user } = await registerRequest(payload);
      localStorage.setItem("ng_token", token);
      localStorage.setItem("ng_user", JSON.stringify(user));
      set({ user, loading: false });
    } catch (error) {
      set({ error: getApiError(error, "Registration failed. Please try again."), loading: false });
    }
  },
  logout() {
    localStorage.removeItem("ng_token");
    localStorage.removeItem("ng_user");
    set({ user: undefined });
  },
  setUser(user?: User) {
    set({ user });
  }
}));

export function bootstrapAuthState() {
  const stored = localStorage.getItem("ng_user");
  if (stored) {
    const user = JSON.parse(stored) as User;
    useAuthStore.getState().setUser(user);
  }
}

export function hasRole(role: UserRole) {
  const user = useAuthStore.getState().user;
  return user?.role === role;
}
