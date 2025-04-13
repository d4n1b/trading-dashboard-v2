// Api
export type AuthResponse = {
  token: string;
};

export type AccountApiResponseData = {
  id: number;
  name: string;
  key: string;
  token: string;
};

export type ExchangeRateApiResponseData = {
  base_code: "USD";
  conversion_rates: {
    [currencyCode: string]: number;
  };
};

export type EarningsCalendarApiResponseData = {
  date_from: string;
  date_to: string;
  earnings: {
    [date: string]: {
      stocks: {
        importance: number;
        symbol: string;
        date: string;
        time: string;
        title: string;
      }[];
    };
  };
};

export type AccountBalanceApiResponseData = {
  free: number;
  total: number;
  ppl: number;
  result: number;
  invested: number;
  pieCash: number;
  blocked: number;
};

export type AccountMetadataApiResponseData = {
  id: number;
  currencyCode: string;
};

export type InstrumentListItem = {
  ticker: string; // "UBKd_EQ";
  type: string; // "STOCK";
  workingScheduleId: number; // 54;
  isin: string; // "DE0005570808";
  currencyCode: string; // "EUR";
  name: string; // "UmweltBank";
  shortName: string; // "UBK";
  minTradeQuantity: number; // 0.1;
  maxOpenQuantity: number; // 180.0;
  addedOn: string; // "2021-06-16T11:06:39.000+03:00";
};

export type InstrumentApiResponseData = {
  ticker: string;
  quantity: number;
  averagePrice: number;
  currentPrice: number;
  ppl: number;
  fxPpl: number;
  initialFillDate: string;
  maxBuy: number;
  maxSell: number;
  pieQuantity: number;
  image: string;
  type: string;
  currency: string;
  fullName: string;
  shortName: string;
  countryOfOrigin: string;
};

export type InstrumentMetadataApiResponseData = {
  type: string;
  currency: string;
  ticker: string;
  tickerGlobal: string;
  fullName: string;
  shortName: string;
  countryOfOrigin: string;
};

export type PaginatedApiResponseData<T> = {
  items: T[];
  nextPagePath: string;
};

export type InstrumentDividendApiItem = {
  ticker: string;
  reference: string;
  quantity: number;
  amount: number;
  grossAmountPerShare: number;
  amountInEuro: number;
  paidOn: string;
  type: string;
};

export type InstrumentDividendItem = InstrumentDividendApiItem & {
  paidOnDisplay: string;
  companyImage: string;
  companyName: string;
  amountDisplay: string;
  amountInEuroDisplay: string;
};

export type InstrumentTransactionApiItem = {
  type: "LIMIT" | "STOP" | "MARKET" | "STOP_LIMIT";
  id: number;
  fillId: number;
  parentOrder: number;
  ticker: string;
  orderedQuantity: number;
  filledQuantity: number;
  limitPrice: number;
  stopPrice: number;
  timeValidity: "GTC" | "DAY";
  orderedValue: number;
  filledValue: number;
  executor: "WEB" | "ANDROID" | string;
  dateModified: string;
  dateExecuted: string;
  dateCreated: string;
  fillResult: unknown;
  fillPrice: number;
  fillCost: unknown;
  taxes: {
    fillId: string;
    name: string;
    quantity: number;
    timeCharged: string;
  }[];
  fillType: "OTC" | "TOTV" | string;
  status:
    | "LOCAL"
    | "UNCONFIRMED"
    | "CONFIRMED"
    | "NEW"
    | "CANCELLING"
    | "CANCELLED"
    | "PARTIALLY_FILLED"
    | "FILLED"
    | "REJECTED"
    | "REPLACING"
    | "REPLACED";
};

// App
export type LoginFormState = {
  username: string;
  password: string;
};

export type SortBy = "asc" | "desc" | null;

export type Account = AccountApiResponseData;

export type ExchangeRate = ExchangeRateApiResponseData["conversion_rates"];

export type EarningsCalendar = EarningsCalendarApiResponseData["earnings"];

export type DatePeriod = "FUTURE" | "PAST" | "TODAY" | "TOMORROW";
export type InstrumentEarningReport = {
  date: string;
  dateShort: string;
  datePeriod: DatePeriod;
};

export type Instrument = InstrumentApiResponseData & {
  returnTrend: 1 | -1 | 0;
  quantityDisplay: string;
  averagePriceDisplay: string;
  tickerGlobal: string;
  currentPriceDisplay: string;
  pplDisplay: string;
  pplPercentage: number;
  pplPercentageDisplay: string;
  fxPplDisplay: string;
  totalCurrentPrice: number;
  totalCurrentPriceDisplay: string;
  totalInvested?: number;
  totalInvestedDisplay?: string;
  totalInvestedPercentage?: number;
  totalInvestedPercentageDisplay?: string;
  dividendTotal?: number;
  dividendTotalDisplay?: string;
  dividendQuantityDisplay?: string;
  dividendAmountDisplay?: string;
  dividendGrossAmountPerShareDisplay?: string;
  dividendAmountInEuroDisplay?: string;
  dividendItems?: InstrumentDividendItem[];
  transactionItems?: InstrumentTransactionItem[];
  earningsReports?: InstrumentEarningReport[];
  pplAndDividends?: number;
  pplAndDividendsDisplay?: string;
  finvizLink: string;
  yahooLink: string;
};

export type AccountMetadata = AccountMetadataApiResponseData;

export type AccountBalance = AccountBalanceApiResponseData & {
  freeFundsDisplay: string;
  totalDisplay: string;
  pplDisplay: string;
  pplPercentageDisplay: string;
  investedDisplay: string;
};

export type AccountPositions = Instrument[];

export type InstrumentMetadata = InstrumentMetadataApiResponseData;

export type InstrumentDividends = {
  total: number;
  totalDisplay: string;
  quantityDisplay: string;
  amountDisplay: string;
  grossAmountPerShareDisplay: string;
  amountInEuroDisplay: string;
  items: InstrumentDividendItem[];
};

export type InstrumentTransactionItem = InstrumentTransactionApiItem & {
  dateCreatedDisplay: string;
  orderedQuantityDisplay: string;
  quantity: number;
  quantityDisplay: string;
  limitPriceDisplay: string;
  stopPriceDisplay: string;
  statusDisplay: string;
  isPie: boolean;
  isPieDisplay: "Yes" | "No";
  estimatedSharePrice: number;
  estimatedSharePriceDisplay: string;
  estimatedTotal: number;
  estimatedTotalDisplay: string;
};

export type InstrumentTransactions = {
  items: InstrumentTransactionItem[];
};

export type InstrumentSortableKeys =
  | "fullName"
  | "shortName"
  | "countryOfOrigin"
  | "quantity"
  | "averagePrice"
  | "currentPrice"
  | "dividendTotal"
  | "ppl"
  | "pplPercentage"
  | "pplAndDividends"
  | "totalInvested"
  | "totalInvestedPercentage"
  | "totalCurrentPrice";

export type EarningsReport = {
  nextWeeksEarnings: {
    date: string;
    dateShort: string;
    stocks: any[];
    stocksDisplay: string;
  }[];
  companyMap: {
    [ticker: string]: InstrumentEarningReport[];
  };
};
