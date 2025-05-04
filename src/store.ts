import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface AppState {
  accountIdSelected?: number;
  privacy: boolean;
}

export interface AppActions {
  togglePrivacy: () => void;
  setPrivacy: (value: boolean) => void;
  setAccountId: (accountId?: number) => void;
}

export type AppStore = AppState & AppActions;

export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      accountIdSelected: 1,
      privacy: false,
      setAccountId: (accountId) => set({ accountIdSelected: accountId }),
      togglePrivacy: () => set((state) => ({ privacy: !state.privacy })),
      setPrivacy: (value) => set({ privacy: value }),
    }),
    {
      name: "appState_v5xKa",
    }
  )
);
