export type UnwrapAsyncGenerator<T> = T extends AsyncGenerator<
  infer U,
  unknown,
  unknown
>
  ? U
  : never;

export type UserAccountV2 = {
  id: number;
  userId: number;
  name: string;
  key: string;
  provider: "trading_212";
  token: string;
  metadata: {
    experimental_dividendsSyncedOn: string;
  };
};

export type DividendItemV2 = {
  id: number;
  accountId: number;
  ticker: string;
  externalTicker: string;
  externalId: string;
  quantity: number;
  amount: number;
  grossAmountPerShare: number;
  paidOn: string;
  metadata: Record<string, unknown>;
  syncedOn?: string;
};

export type DividendItemPayloadV2 = Omit<DividendItemV2, "id">;

export interface AccountHistoryV2 {
  id: string;
  accountId: number;
  timestamp: string;
  balance: {
    free: number;
    total: number;
    ppl: number;
    result: number;
    invested: number;
    pieCash: number;
    blocked: number;
  };
  metadata: {
    exchangeRates: Record<string, number>;
    totalPositions: number;
    totalDividends: number;
    currencyCode: string;
  };
}
