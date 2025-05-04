import invariant from "tiny-invariant";
import axios from "axios";
import { getSession } from "next-auth/react";

import { useAppStore } from "@/store";
import { DividendItemV2, UserAccountV2, AccountHistoryV2 } from "@/types.v2";
import { ClientApiService } from "@/lib/client/api";
import { useAuthorizedQuery } from "./useAuthorizedQuery";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

api.interceptors.request.use(
  async (config) => {
    const session = await getSession();

    if (session?.token) {
      config.headers["Authorization"] = `Bearer ${session.token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

const apiService = new ClientApiService(api);

export const useGetUserAccounts = () => {
  return useAuthorizedQuery<UserAccountV2[]>(["accounts"], async ({ userId }) =>
    apiService.getUserAccounts(userId)
  );
};

export const useGetAccountDividends = () => {
  const { accountIdSelected } = useAppStore();

  invariant(accountIdSelected, "Missing accountIdSelected");

  return useAuthorizedQuery<DividendItemV2[]>(
    ["dividends", accountIdSelected],
    async ({ userId }) =>
      apiService.getAccountDividends(userId, accountIdSelected)
  );
};

export const useGetAccountHistory = () => {
  const { accountIdSelected } = useAppStore();

  invariant(accountIdSelected, "Missing accountIdSelected");

  return useAuthorizedQuery<AccountHistoryV2[]>(
    ["accountHistory", accountIdSelected],
    async ({ userId }) =>
      apiService.getAccountHistory(userId, accountIdSelected)
  );
};
