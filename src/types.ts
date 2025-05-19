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
    currencyCode: string;
    accountSnapshotSyncedOn: string;
    dividendsSyncedOn: string;
  };
};

export type DividendItemV2 = {
  id: number;
  accountId: number;
  userId: number;
  companyName: string;
  isin: string;
  ticker: string;
  internalTicker: string;
  internalId: string;
  quantity: number;
  amount: number;
  grossAmountPerShare: number;
  paidOn: string;
  metadata: Record<string, unknown>;
  syncedOn?: string;
};

export type DividendItemPayloadV2 = Omit<DividendItemV2, "id">;

export type DividendItemUIV2 = DividendItemV2 & {
  paidOnDisplay: string;
  amountDisplay: string;
};

export type PositionItemV2 = {
  type: string;
  isin: string;
  companyName: string;
  currencyCode: string;
  internalTicker: string;
  ticker: string;
  quantity: number;
  averagePrice: number;
  currentPrice: number;
  ppl: number;
  fxPpl: number;
};

export type PositionItemUIV2 = PositionItemV2 & {
  finvizLink: string;
  yahooLink: string;
  countryOfOrigin: string;
  averagePriceDisplay: string;
  currentPriceDisplay: string;
  invested: number;
  quantityDisplay: string;
  investedDisplay: string;
  investedPercentage: number;
  investedPercentageDisplay: string;
  result: number;
  resultDisplay: string;
};

export type AccountSnapshotV2 = {
  id: string;
  accountId: number;
  syncedOn: string;
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
    exchangeRates?: Record<string, number>;
  };
  positions: PositionItemV2[];
};

export type AccountSnapshotUIV2 = Omit<AccountSnapshotV2, "positions"> & {
  positions: PositionItemUIV2[];
};
