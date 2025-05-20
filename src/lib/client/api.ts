import type { AxiosInstance, AxiosRequestConfig } from "axios";

import {
  AccountSnapshotV2,
  DividendItemPayloadV2,
  DividendItemV2,
  UserAccountV2,
  AccountSnapshotQueryParams,
} from "@/types";

export class ClientApiService {
  private api: AxiosInstance;

  constructor(api: AxiosInstance) {
    this.api = api;
  }

  async getAccounts() {
    const { data } = await this.api.get<UserAccountV2[]>(`/accounts`);
    return data;
  }

  async updateAccount(
    accountId: string | number,
    account: Partial<UserAccountV2>
  ) {
    const { data } = await this.api.put<UserAccountV2>(
      `/accounts/${accountId}`,
      account
    );
    return data;
  }

  async getUserAccounts(userId: string | number) {
    const { data } = await this.api.get<UserAccountV2[]>(
      `/users/${userId}/accounts`
    );
    return data;
  }

  async getAccountDividend(
    account: UserAccountV2,
    params: AxiosRequestConfig["params"]
  ): Promise<DividendItemV2 | null> {
    const { data } = await this.api.get<DividendItemV2[]>(
      `/users/${account.userId}/accounts/${account.id}/dividends`,
      { params }
    );
    return data[0] ?? null;
  }

  async createAccountDividend(
    account: UserAccountV2,
    payload: DividendItemPayloadV2
  ) {
    const { data } = await this.api.post<DividendItemV2>(
      `/users/${account.userId}/accounts/${account.id}/dividends`,
      payload
    );
    return data;
  }

  async getAccountDividends(account: UserAccountV2) {
    const { data } = await this.api.get<DividendItemV2[]>(
      `/users/${account.userId}/accounts/${account.id}/dividends?_sort=paidOn&_order=desc`
    );
    return data;
  }

  async getAccountSnapshots(
    account: UserAccountV2,
    params?: AccountSnapshotQueryParams
  ): Promise<AccountSnapshotV2[]> {
    const { data } = await this.api.get<AccountSnapshotV2[]>(
      `/users/${account.userId}/accounts/${account.id}/snapshots?_sort=syncedOn&_order=desc`,
      { params }
    );
    return data ?? null;
  }

  async createAccountSnapshot(
    account: UserAccountV2,
    snapshot: AccountSnapshotV2
  ) {
    const { data } = await this.api.post<AccountSnapshotV2>(
      `/users/${account.userId}/accounts/${account.id}/snapshots`,
      snapshot
    );
    return data;
  }
}
