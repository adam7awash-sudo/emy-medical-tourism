import { create } from "zustand";

interface AdminStore {
  isAuthenticated: boolean;
  adminName: string;
  login: (name: string) => void;
  logout: () => void;
}

export const useAdminStore = create<AdminStore>((set) => ({
  isAuthenticated: false,
  adminName: "",
  login: (name) => set({ isAuthenticated: true, adminName: name }),
  logout: () => set({ isAuthenticated: false, adminName: "" }),
}));