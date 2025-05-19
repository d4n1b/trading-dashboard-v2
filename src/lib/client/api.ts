import type { AxiosInstance, AxiosRequestConfig } from "axios";
import { formatDate } from "date-fns";

import { config, tickerFinvizTickerMap } from "@/config";
import {
  AccountSnapshotUIV2,
  AccountSnapshotV2,
  DividendItemPayloadV2,
  DividendItemUIV2,
  DividendItemV2,
  PositionItemUIV2,
  PositionItemV2,
  UserAccountV2,
} from "@/types";
import { parseCurrencyCode, toCurrency } from "@/lib/currency";

export class ClientApiService {
  private api: AxiosInstance;

  static uiMappers = {
    dividend: (
      dividend: DividendItemV2,
      account: UserAccountV2
    ): DividendItemUIV2 => ({
      ...dividend,
      paidOnDisplay: formatDate(
        dividend.paidOn,
        config.DATE_FORMAT_ISO_DATETIME
      ),
      amountDisplay: toCurrency(
        dividend.amount,
        parseCurrencyCode(account.metadata.currencyCode)
      ),
    }),
    position: (
      position: PositionItemV2,
      account: UserAccountV2
    ): PositionItemUIV2 => {
      const invested = position.quantity * position.averagePrice;
      const result =
        position.quantity * (position.currentPrice - position.averagePrice);
      const currencyCode = parseCurrencyCode(
        position.currencyCode ?? account.metadata.currencyCode
      );

      return {
        ...position,
        finvizLink: `https://finviz.com/quote.ashx?t=${
          tickerFinvizTickerMap[position.ticker] ?? position.ticker
        }`,
        yahooLink: `https://es.finance.yahoo.com/quote/${position.ticker}`,
        countryOfOrigin: position.isin.slice(0, 2),
        averagePriceDisplay: toCurrency(position.averagePrice, currencyCode),
        currentPriceDisplay: toCurrency(position.currentPrice, currencyCode),
        quantityDisplay: position.quantity.toFixed(2),
        invested,
        investedDisplay: toCurrency(invested, currencyCode),
        investedPercentage: 0, // This will be calculated after we have all positions
        investedPercentageDisplay: "0%", // This will be calculated after we have all positions
        result,
        resultDisplay: toCurrency(result, currencyCode),
      };
    },
  };

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
    return data.map((dividend) =>
      ClientApiService.uiMappers.dividend(dividend, account)
    );
  }

  async getAccountSnapshot(
    account: UserAccountV2,
    params?: AxiosRequestConfig["params"]
  ): Promise<AccountSnapshotUIV2 | null> {
    const { data } = await this.api.get<AccountSnapshotV2[]>(
      `/users/${account.userId}/accounts/${account.id}/snapshots`,
      { params }
    );

    if (!data[0]) return null;

    // Calculate total invested amount
    const totalInvested = data[0].positions.reduce(
      (sum, position) => sum + position.quantity * position.averagePrice,
      0
    );

    // Map positions with UI properties and calculate percentages
    const positions = data[0].positions.map((position) => {
      const uiPosition = ClientApiService.uiMappers.position(position, account);
      const invested = uiPosition.invested;
      const percentage = (invested / totalInvested) * 100;

      return {
        ...uiPosition,
        investedPercentage: percentage,
        investedPercentageDisplay: `${percentage.toFixed(2)}%`,
      };
    });

    return {
      ...data[0],
      positions,
    };
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
