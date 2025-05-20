import invariant from "tiny-invariant";
import axios from "axios";
import { getSession, signOut } from "next-auth/react";

import { useAccountStore } from "@/store";
import { ClientApiService } from "@/lib/client/api";
import { UIMapper } from "@/lib/ui-mapper";
import { AccountSnapshotUIV2, DividendItemV2 } from "@/types";
import { useAuthorizedQuery } from "./useAuthorizedQuery";

const api = axios.create({
  baseURL: process.env.NEXT_API_URL || process.env.NEXT_PUBLIC_API_URL,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      return signOut();
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
    apiService
      .getAccountDividends(accountSelected)
      .then((dividends) =>
        dividends.map((dividend) =>
          UIMapper.dividend(accountSelected, dividend)
        )
      )
  );
};

export const useGetAccountSnapshot = ({
  dividends,
  syncedOn,
}: {
  dividends: DividendItemV2[] | undefined;
  syncedOn?: string;
}) => {
  const { accountSelected } = useAccountStore();
  invariant(accountSelected, "Missing accountSelected");

  return useAuthorizedQuery(
    ["accountSnapshot", accountSelected.id, syncedOn],
    async (): Promise<AccountSnapshotUIV2 | null> =>
      apiService
        .getAccountSnapshots(accountSelected, { syncedOn })
        .then((snapshots) => {
          if (!snapshots.length || !dividends) return null;
          return UIMapper.accountSnapshot(
            accountSelected,
            snapshots[0],
            dividends
          );
        }),
    { enabled: !!dividends }
  );
};

export const useGetAccountSnapshots = () => {
  const { accountSelected } = useAccountStore();
  invariant(accountSelected, "Missing accountSelected");

  return useAuthorizedQuery(
    ["accountSnapshots", accountSelected.id],
    async (): Promise<Date[]> =>
      apiService
        .getAccountSnapshots(accountSelected)
        .then((snapshots) =>
          snapshots.map((snapshot) => new Date(snapshot.syncedOn))
        )
  );
};
