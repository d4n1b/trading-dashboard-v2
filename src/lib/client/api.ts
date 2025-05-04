import {
  AccountHistoryV2,
  DividendItemPayloadV2,
  DividendItemV2,
  UserAccountV2,
} from "@/types.v2";
import type { AxiosInstance, AxiosRequestConfig } from "axios";

export class ClientApiService {
  private api: AxiosInstance;

  constructor(api: AxiosInstance) {
    this.api = api;
  }

  async getAccounts() {
    const { data } = await this.api.get<UserAccountV2[]>(`/accounts`);
    return data;
  }

  async getUserAccounts(userId: string | number) {
    const { data } = await this.api.get<UserAccountV2[]>(
      `/users/${userId}/accounts`
    );
    return data;
  }

  async getAccountHistory(userId: string | number, accountId: string | number) {
    const { data } = await this.api.get<AccountHistoryV2[]>(
      `/users/${userId}/accounts/${accountId}/history`
    );
    return data;
  }

  async getAccountDividends(
    userId: string | number,
    accountId: string | number
  ) {
    const { data } = await this.api.get(
      `/users/${userId}/accounts/${accountId}/dividends`
    );
    return data;
  }

  async getDividend(
    params: AxiosRequestConfig["params"]
  ): Promise<DividendItemV2 | null> {
    const { data } = await this.api.get<DividendItemV2[]>(`/dividends`, {
      params,
    });
    return data[0] ?? null;
  }

  async createDividend(payload: DividendItemPayloadV2) {
    const { data } = await this.api.post<DividendItemV2>(`/dividends`, payload);
    return data;
  }
}
