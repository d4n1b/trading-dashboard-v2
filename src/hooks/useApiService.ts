import invariant from "tiny-invariant";
import axios from "axios";
import { getSession } from "next-auth/react";

import { useAccountStore } from "@/store";
import { ClientApiService } from "@/lib/client/api";
import { useAuthorizedQuery } from "./useAuthorizedQuery";

const api = axios.create({
  baseURL: process.env.NEXT_API_URL || process.env.NEXT_PUBLIC_API_URL,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== "undefined" && window.location.href !== "/login") {
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
  return useAuthorizedQuery(["accounts"], async ({ userId }) =>
    apiService.getUserAccounts(userId)
  );
};

export const useGetAccountDividends = () => {
  const { accountSelected } = useAccountStore();
  invariant(accountSelected, "Missing accountSelected");

  return useAuthorizedQuery(["dividends", accountSelected.id], async () =>
    apiService.getAccountDividends(accountSelected)
  );
};

export const useGetAccountSnapshot = () => {
  const { accountSelected } = useAccountStore();
  invariant(accountSelected, "Missing accountSelected");

  return useAuthorizedQuery(["accountSnapshot", accountSelected.id], async () =>
    apiService.getAccountSnapshot(accountSelected)
  );
};
