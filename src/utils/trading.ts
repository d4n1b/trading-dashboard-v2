import orderBy from "lodash/orderBy";
import type { AxiosCacheInstance } from "axios-cache-interceptor";
import {
  addDays,
  addWeeks,
  formatDate,
  isFuture,
  isToday,
  isTomorrow,
  isWithinInterval,
  parse as parseDate,
} from "date-fns";
import axios from "axios";

import type {
  AccountBalance,
  AccountBalanceApiResponseData,
  AccountMetadataApiResponseData,
  AccountPositions,
  Instrument,
  InstrumentApiResponseData,
  InstrumentDividends,
  SortBy,
  AccountMetadata,
  ExchangeRate,
  InstrumentListItem,
  InstrumentMetadataApiResponseData,
  PaginatedApiResponseData,
  InstrumentDividendApiItem,
  InstrumentTransactions,
  InstrumentTransactionApiItem,
  EarningsCalendar,
  EarningsReport,
  InstrumentDividendItem,
} from "../types";
import {
  instrumentCustomType,
  shortNameTickerMap,
  __DEV__,
  config,
  tickerGlobalFinvizMap,
} from "../config";
import { debug } from "../debug";
import { delay } from "./utils";

export const TradingApi = {
  fetchAccountDetails,
  fetchAllPositions,
  fetchPositionDividends,
  fetchPositionTransactions,
  fetchAccountMetadata,
};

export type TradingApiOptions = {
  fetch: AxiosCacheInstance;
  accountMetadata: AccountMetadata;
};

async function fetchAccountMetadata(
  token: string,
  { fetch }: { fetch: AxiosCacheInstance }
): Promise<AccountMetadata> {
  const { data: accountMetadata } =
    await fetch.get<AccountMetadataApiResponseData>(
      config.trading.ACCOUNT_METADATA_URL,
      {
        id: config.cacheKey.ACCOUNT_METADATA,
        headers: { Authorization: token },
      }
    );

  return accountMetadata;
}

async function fetchAccountDetails(
  token: string,
  { fetch, accountMetadata }: TradingApiOptions
): Promise<AccountBalance> {
  const { data: accountBalanceRaw } =
    await fetch.get<AccountBalanceApiResponseData>(
      config.trading.ACCOUNT_BALANCE_URL,
      { id: config.cacheKey.ACCOUNT_BALANCE, headers: { Authorization: token } }
    );

  await delay(2000);

  const accountBalance: AccountBalance = {
    ...accountBalanceRaw,
    totalDisplay: toCurrency(
      accountBalanceRaw.total,
      accountMetadata.currencyCode
    ),
    pplDisplay: toCurrency(accountBalanceRaw.ppl, accountMetadata.currencyCode),
    pplPercentageDisplay:
      (
        Math.abs(accountBalanceRaw.ppl / accountBalanceRaw.invested) * 100
      ).toFixed(2) + "%",
    investedDisplay: toCurrency(
      accountBalanceRaw.invested,
      accountMetadata.currencyCode
    ),
    freeFundsDisplay: toCurrency(
      accountBalanceRaw.free,
      accountMetadata.currencyCode
    ),
  };

  return accountBalance;
}

async function fetchAllPositions(
  token: string,
  {
    fetch,
    accountMetadata,
    exchangeRate,
    accountBalance,
  }: TradingApiOptions & {
    exchangeRate: ExchangeRate;
    accountBalance: AccountBalance;
  }
): Promise<AccountPositions> {
  const [{ data: instrumentsRaw }, { data: openPositionsRaw }] =
    await Promise.all([
      // Uncomment to get fresh instruments every now & then
      // fetch.get<InstrumentListItem[]>(config.trading.INSTRUMENTS_URL, {
      //   id: config.cacheKey.INSTRUMENTS,
      //   headers: { Authorization: token },
      // }),
      axios.get<InstrumentListItem[]>(config.trading.INSTRUMENTS_URL),
      fetch.get<InstrumentApiResponseData[]>(config.trading.POSITION_URL, {
        id: config.cacheKey.POSITIONS,
        headers: { Authorization: token },
      }),
    ]);

  const instrumentsMap = instrumentsToMap(instrumentsRaw);
  const rate = exchangeRate[accountMetadata.currencyCode];

  let instruments = openPositionsRaw.map((i): Instrument => {
    const instrumentMetadata = instrumentsMap[i.ticker] || {
      currency: "USD",
      fullName: i.ticker,
      type: instrumentCustomType.Delisted,
    };
    const instrument = { ...i, ...instrumentMetadata };

    const estimatedTotalROI =
      instrument.quantity * instrument.averagePrice * rate;
    const estimatedTotalCurrentPrice =
      instrument.quantity * instrument.currentPrice * rate;

    const getTotalPplPercentage = () => {
      if (estimatedTotalROI <= 0) return 0;

      return (
        ((estimatedTotalCurrentPrice + instrument.fxPpl - estimatedTotalROI) /
          estimatedTotalROI) *
        100
      );
    };

    const pplPercentage = getTotalPplPercentage();
    const totalInvested = parseCurrencyValue(
      instrument.quantity * instrument.averagePrice,
      instrument.currency
    );
    const totalInvestedPercentage =
      ((totalInvested * rate) / accountBalance.invested) * 100;

    return {
      ...instrument,
      image: `https://trading212equities.s3.eu-central-1.amazonaws.com/${instrument.ticker}.png`,
      quantityDisplay: instrument.quantity.toFixed(2),
      returnTrend: getReturnTrend(instrument),
      pplDisplay: toCurrency(instrument.ppl, accountMetadata.currencyCode),
      pplPercentage,
      pplPercentageDisplay: pplPercentage.toFixed(2) + "%",
      fxPplDisplay: toCurrency(instrument.fxPpl, accountMetadata.currencyCode),
      finvizLink: `https://finviz.com/quote.ashx?t=${
        tickerGlobalFinvizMap[instrument.tickerGlobal] ??
        instrument.tickerGlobal
      }`,
      yahooLink: `https://es.finance.yahoo.com/quote/${instrument.tickerGlobal}`,
      averagePrice: parseCurrencyValue(
        instrument.averagePrice,
        instrument.currency
      ),
      averagePriceDisplay: toCurrency(
        parseCurrencyValue(instrument.averagePrice, instrument.currency),
        parseCurrencyCode(instrument.currency)
      ),
      currentPrice: parseCurrencyValue(
        instrument.currentPrice,
        instrument.currency
      ),
      currentPriceDisplay: toCurrency(
        parseCurrencyValue(instrument.currentPrice, instrument.currency),
        parseCurrencyCode(instrument.currency)
      ),
      totalInvestedPercentage,
      totalInvestedPercentageDisplay: totalInvestedPercentage.toFixed(2) + "%",
      totalInvested,
      totalInvestedDisplay: toCurrency(
        totalInvested,
        parseCurrencyCode(instrument.currency)
      ),
      totalCurrentPrice: parseCurrencyValue(
        estimatedTotalCurrentPrice,
        instrument.currency
      ),
      totalCurrentPriceDisplay: toCurrency(
        parseCurrencyValue(estimatedTotalCurrentPrice, instrument.currency),
        parseCurrencyCode(instrument.currency)
      ),
    };
  });
  instruments = orderBy(instruments, "shortName", "asc");
  // instruments = instruments.slice(0, 10); // debug

  return instruments;
}

async function fetchPositionDividends(
  token: string,
  instrument: Instrument,
  { fetch, accountMetadata }: TradingApiOptions
): Promise<InstrumentDividends> {
  const items =
    await fetchPaginatedApiResourcesRecursively<InstrumentDividendApiItem>({
      cachePrefix: `${config.cacheKey.DIVIDENDS}_${instrument.ticker}`,
      baseUrl: config.trading.INSTRUMENT_DIVIDENDS_URL,
      token,
      ticker: instrument.ticker,
      fetch,
    });

  const dividends: InstrumentDividendItem[] = orderBy(
    items,
    "paidOn",
    "desc"
  ).map((item) => ({
    ...item,
    companyImage: instrument.image,
    companyName: instrument.shortName,
    paidOnDisplay: formatDate(item.paidOn, config.DATE_FORMAT_ISO_DATE),
    amountDisplay: toCurrency(
      item.amount,
      parseCurrencyCode(accountMetadata.currencyCode)
    ),
    amountInEuroDisplay: toCurrency(item.amountInEuro, "EUR"),
  }));

  const initialTotals: Omit<InstrumentDividends, "items"> = {
    total: 0,
    totalDisplay: toCurrency(
      0,
      parseCurrencyCode(accountMetadata.currencyCode)
    ),
    quantityDisplay: "",
    amountDisplay: "",
    grossAmountPerShareDisplay: "",
    amountInEuroDisplay: "",
  };

  const totals = items.reduce(
    (map, item) => ({
      ...initialTotals,
      total: map.total + item.amount,
      totalDisplay: toCurrency(
        map.total + item.amount,
        parseCurrencyCode(accountMetadata.currencyCode)
      ),
    }),
    initialTotals
  );

  return {
    items: dividends,
    ...totals,
  };
}
async function fetchPositionTransactions(
  token: string,
  instrument: Instrument,
  { fetch, accountMetadata }: TradingApiOptions & { exchangeRate: ExchangeRate }
): Promise<InstrumentTransactions> {
  let items =
    await fetchPaginatedApiResourcesRecursively<InstrumentTransactionApiItem>({
      cachePrefix: `${config.cacheKey.TRANSACTIONS}_${instrument.ticker}`,
      baseUrl: config.trading.INSTRUMENT_TRANSACTIONS_URL,
      token,
      ticker: instrument.ticker,
      fetch,
    });
  items = orderBy(items, "dateCreated", "desc");

  return {
    items: items.map((transaction) => {
      const isPie = transaction.executor === "AUTOINVEST";

      const getTotals = (): {
        quantity: number;
        estimatedTotal: number;
        estimatedSharePrice: number;
        status: string;
      } => {
        let quantity: number = transaction.orderedQuantity;
        let estimatedTotal: number = quantity * transaction.fillPrice;

        if (transaction.executor === "AUTOINVEST") {
          quantity = transaction.orderedValue / transaction.fillPrice;
          estimatedTotal = transaction.orderedValue;
        }

        let status: string = transaction.status;
        if (transaction.status === "FILLED") {
          status = quantity < 0 ? "SOLD" : "BOUGHT";
        }

        return {
          quantity,
          estimatedTotal,
          estimatedSharePrice: Math.abs(estimatedTotal / quantity),
          status,
        };
      };

      const totals = getTotals();

      return {
        ...transaction,
        isPie,
        isPieDisplay: isPie ? "Yes" : "No",
        quantity: totals.quantity,
        quantityDisplay: totals.quantity.toFixed(
          totals.estimatedSharePrice > 10_000 ? 5 : 3
        ),
        statusDisplay: totals.status.toString(),
        dateCreatedDisplay: formatDate(
          transaction.dateCreated,
          config.DATE_FORMAT_ISO_DATETIME
        ),
        orderedQuantityDisplay: transaction.orderedQuantity
          ? transaction.orderedQuantity.toString()
          : "-",
        limitPriceDisplay: transaction.limitPrice
          ? toCurrency(transaction.limitPrice, instrument.currency)
          : "-",
        stopPriceDisplay: transaction.stopPrice
          ? toCurrency(transaction.stopPrice, instrument.currency)
          : "-",
        estimatedTotal: totals.estimatedTotal,
        // The transactions from pies are shown in account currency
        estimatedTotalDisplay: totals.estimatedTotal
          ? toCurrency(
              totals.estimatedTotal,
              isPie ? accountMetadata.currencyCode : instrument.currency
            )
          : "-",
        estimatedSharePrice: totals.estimatedSharePrice,
        estimatedSharePriceDisplay: totals.estimatedSharePrice
          ? toCurrency(totals.estimatedSharePrice, instrument.currency)
          : "-",
      };
    }),
  };
}

// Utils
export function toCurrency(value: number, currency: string) {
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  // Move the currency symbol to the end to help sorting CSV columns
  const formattedValue = formatter.format(value);
  const parts = formatter.formatToParts(value);
  const currencySymbol =
    parts.find((part) => part.type === "currency")?.value || currency;
  const amountWithoutSymbol = formattedValue.replace(currencySymbol, "").trim();

  return `${amountWithoutSymbol}${currencySymbol}`;
}

async function fetchPaginatedApiResourcesRecursively<PaginatedItem>({
  cachePrefix,
  baseUrl,
  token,
  ticker,
  fetch,
}: {
  cachePrefix: string;
  baseUrl: string;
  token: string;
  ticker: string;
  fetch: AxiosCacheInstance;
}) {
  let cacheIndex = -1;
  const fetchRecursively = async (
    url: string,
    items: PaginatedItem[]
  ): Promise<PaginatedItem[]> => {
    const cacheKey = `${cachePrefix}_${++cacheIndex}`;
    if (__DEV__) {
      debug("storing cache:", cacheKey);
    }
    const response = await fetch.get<PaginatedApiResponseData<PaginatedItem>>(
      url,
      { id: cacheKey, headers: { Authorization: token } }
    );

    items = response.data.items.concat(items);

    if (
      !response.data.nextPagePath ||
      response.data.nextPagePath.includes("null") ||
      !response.data.nextPagePath.includes(ticker)
    ) {
      return items;
    }

    return fetchRecursively(
      `${baseUrl}?${response.data.nextPagePath.split("?")[1]}`,
      items
    );
  };

  const items = await fetchRecursively(
    `${baseUrl}?cursor=0&ticker=${ticker}&limit=50`,
    []
  );

  return items;
}

function instrumentsToMap(instruments: InstrumentListItem[]) {
  const data = instruments.reduce(
    (all: Record<string, InstrumentMetadataApiResponseData>, instrument) => {
      all[instrument.ticker] = {
        type: instrument.type,
        currency: instrument.currencyCode,
        tickerGlobal:
          shortNameTickerMap[instrument.ticker] ||
          instrument.shortName.replace(".", "-"),
        ticker: instrument.ticker,
        fullName: instrument.name,
        shortName: instrument.shortName,
        countryOfOrigin: instrument.isin.slice(0, 2),
      };
      return all;
    },
    {}
  );

  return data;
}

function getReturnTrend(
  instrument: InstrumentApiResponseData
): Instrument["returnTrend"] {
  if (instrument.averagePrice === instrument.currentPrice) {
    return 0;
  }

  return instrument.currentPrice > instrument.averagePrice ? 1 : -1;
}

export function isCurrencyGBX(currency: string): boolean {
  return currency === "GBX";
}

export function parseCurrencyCode(currency: string): string {
  return isCurrencyGBX(currency) ? "GBP" : currency;
}

export function parseCurrencyValue(value: number, currency: string): number {
  if (isCurrencyGBX(currency)) {
    return value / 100;
  }

  return value;
}

export function filterLocaleBy<T>(
  items: T[],
  searchTerm: string,
  properties: (keyof T)[]
) {
  return items.filter((item) => {
    return properties.some((property) => {
      const text = item[property] as string;

      if (typeof text !== "string") return false;

      // Search accent and case insensitive
      // https://javascriptf1.com/snippet/remove-accents-from-a-string-in-javascript
      if (typeof text.normalize === "function") {
        return (
          text
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLocaleLowerCase()
            .indexOf(searchTerm.toLocaleLowerCase()) > -1
        );
      }
      return (
        text.toLocaleLowerCase().indexOf(searchTerm.toLocaleLowerCase()) > -1
      );
    });
  });
}

export function getNextSortBy(sortBy: SortBy): SortBy {
  if (sortBy == null) return "asc";
  if (sortBy === "asc") return "desc";
  if (sortBy === "desc") return null;
  return null;
}

export function getEarningsReport(
  earnings: EarningsCalendar,
  targetCompanies: string[]
): EarningsReport {
  const today = new Date();
  const yesterday = addDays(today, -1);
  const sixWeeksLater = addWeeks(today, 6);
  const companyMap: EarningsReport["companyMap"] = {};
  let nextWeeksEarnings: EarningsReport["nextWeeksEarnings"] = [];

  const getEarningDateDisplay = (date: Date | string) =>
    formatDate(date, config.DATE_FORMAT_ISO_DATE);
  const getEarningDateShortDisplay = (date: Date | string) =>
    formatDate(date, config.DATE_FORMAT_ISO_DATE_SHORT);

  const getNextWeeksEarningsDateStatus = (date: string): string => {
    if (isToday(date)) return "TODAY";
    if (isTomorrow(date)) return "TOMORROW";
    return getEarningDateShortDisplay(date);
  };
  const getCompanyEarningsDayStatus = (
    date: Date | string
  ): EarningsReport["companyMap"]["ticker"][0]["datePeriod"] => {
    if (isToday(date)) return "TODAY";
    if (isTomorrow(date)) return "TOMORROW";
    if (isFuture(date)) return "FUTURE";
    return "PAST";
  };

  // Create a Set for faster lookups
  const companySet = new Set(targetCompanies);

  const entries = Object.entries(earnings);
  for (const [date, dayEarnings] of entries) {
    const earningsDate = parseDate(
      date,
      config.DATE_FORMAT_ISO_DATE,
      new Date()
    );
    const earningDateDisplay = getEarningDateDisplay(earningsDate);
    const earningDateShortDisplay = getEarningDateShortDisplay(earningsDate);

    // Only process companies in the filter list
    for (const stock of dayEarnings.stocks) {
      if (companySet.has(stock.symbol)) {
        if (!companyMap[stock.symbol]) {
          companyMap[stock.symbol] = [];
        }
        companyMap[stock.symbol].push({
          date: earningDateDisplay,
          dateShort: earningDateShortDisplay,
          datePeriod: getCompanyEarningsDayStatus(earningsDate),
        });
      }
    }

    const isInSixWeeks = isWithinInterval(earningsDate, {
      start: yesterday, // ensure today is included
      end: sixWeeksLater,
    });

    if (isInSixWeeks) {
      // Filter stocks for the specific companies
      const filteredStocks = dayEarnings.stocks.filter((stock) =>
        companySet.has(stock.symbol)
      );

      if (filteredStocks.length > 0) {
        nextWeeksEarnings.push({
          date: earningDateDisplay,
          dateShort: getNextWeeksEarningsDateStatus(earningDateDisplay),
          stocks: filteredStocks,
          stocksDisplay: filteredStocks.map((stock) => stock.symbol).join(", "),
        });
      }
    }
  }

  // Order earnings by date
  nextWeeksEarnings = orderBy(nextWeeksEarnings, "date", "asc");
  // Order companies earnings
  Object.keys(companyMap).forEach((company) => {
    companyMap[company] = orderBy(companyMap[company], "date", "asc");
  });

  return {
    nextWeeksEarnings,
    companyMap,
  };
}
