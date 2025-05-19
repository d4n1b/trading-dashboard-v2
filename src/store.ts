import { create } from "zustand";
import { persist } from "zustand/middleware";

import { UserAccountV2 } from "./types";

export interface PrivacyState {
  privacy: boolean;
}

export interface PrivacyActions {
  togglePrivacy: () => void;
}

export type PrivacyStore = PrivacyState & PrivacyActions;

export const usePrivacyStore = create<PrivacyStore>()(
  persist(
    (set) => ({
      privacy: false,
      togglePrivacy: () => set((state) => ({ privacy: !state.privacy })),
    }),
    {
      name: "capybaraPrivacyStore_v1",
    }
  )
);

export interface AccountState {
  accountSelected?: UserAccountV2;
}

export interface AccountActions {
  setAccount: (account: UserAccountV2) => void;
}

export type AccountStore = AccountState & AccountActions;

export const useAccountStore = create<AccountStore>()((set) => ({
  accountSelected: undefined,
  setAccount: (account) => set({ accountSelected: account }),
}));
