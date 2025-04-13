import { PayloadAction } from "@reduxjs/toolkit";
import axios, { AxiosResponse } from "axios";
import { AxiosCacheInstance, StorageValue } from "axios-cache-interceptor";
import {
  call,
  delay,
  put,
  select,
  takeLatest,
  takeLeading,
} from "redux-saga/effects";
import {
  TradingApi,
  authenticatedFetch,
  createCachedFetch,
  downloadCsv,
  flushAccountCache,
  flushAllCache,
  flushDividendsCache,
  flushPositionsCache,
  getEarningsReport,
  jsonToCsv,
  setAccountSyncedAtIfNeeded,
} from "../utils";
import {
  Account,
  AccountBalance,
  AccountMetadata,
  AccountPositions,
  AuthResponse,
  EarningsCalendarApiResponseData,
  ExchangeRateApiResponseData,
  InstrumentDividendItem,
  InstrumentDividends,
  InstrumentTransactions,
} from "../types";
import { debug } from "../debug";
import { __DEV__, config } from "../config";
import {
  LoginActionPayload,
  TradingApiRequestActionPayload,
  AccountMetadataState,
  AccountsState,
  LOGIN_FAILURE,
  LOGIN_FETCH,
  LOGIN_SUCCESS,
  LOGOUT,
  ACCOUNTS_FETCH,
  ACCOUNTS_SUCCESS,
  ACCOUNTS_FAILURE,
  ACCOUNTS_SELECTED_ACCOUNT_SET,
  SELECTED_ACCOUNT_FETCH,
  SELECTED_ACCOUNT_REFETCH_ALL,
  ACCOUNT_METADATA_SUCCESS,
  ACCOUNT_BALANCE_FETCH,
  ACCOUNT_BALANCE_SUCCESS,
  ACCOUNT_BALANCE_FAILURE,
  ACCOUNT_BALANCE_LOADING_SET,
  ACCOUNT_POSITIONS_FETCH,
  ACCOUNT_POSITIONS_SUCCESS,
  ACCOUNT_POSITIONS_FAILURE,
  ACCOUNT_POSITIONS_LOADING_SET,
  EXCHANGE_RATE_SUCCESS,
  EXCHANGE_RATE_FAILURE,
  ACCOUNT_METADATA_FAILURE,
  ExchangeRateState,
  SELECTED_ACCOUNT_REFETCH_POSITIONS,
  SELECTED_ACCOUNT_REFETCH_DIVIDENDS,
  ACCOUNT_POSITION_TRANSACTIONS_SET,
  ACCOUNT_POSITION_DIVIDENDS_SET,
  EARNINGS_REPORT_FAILURE,
  EARNINGS_REPORT_SUCCESS,
  EarningsReportState,
  ACCOUNT_POSITION_EARNINGS_REPORT_SET,
  AccountBalanceState,
  ACCOUNTS_EXPORT_READY_SET,
  ACCOUNTS_EXPORT_TO_CSV,
  AccountPositionsState,
  SELECTED_ACCOUNT_BALANCE_REFETCH,
  EARNINGS_REPORT_FETCH,
  ACCOUNTS_ALL_DIVIDENDS_READY_SET,
} from "./slices";
import {
  accountBalanceStateSelector,
  accountMetadataStateSelector,
  accountPositionsStateSelector,
  accountsStateSelector,
  earningsReportStateSelector,
  exchangeRateStateSelector,
} from "./selectors";
import { flatMap, map, orderBy } from "lodash";

export function* rootSaga() {
  yield takeLatest(LOGIN_FETCH, loginSaga);
  yield takeLeading(LOGOUT, logoutSaga);
  yield takeLatest(ACCOUNTS_FETCH, loadAccounts);

  // Trading212
  yield takeLatest(SELECTED_ACCOUNT_FETCH, loadSelectedAccountInfo);
  yield takeLatest(SELECTED_ACCOUNT_REFETCH_ALL, loadSelectedAccountInfo);
  yield takeLatest(SELECTED_ACCOUNT_BALANCE_REFETCH, loadSelectedAccountInfo);
  yield takeLatest(SELECTED_ACCOUNT_REFETCH_POSITIONS, loadSelectedAccountInfo);
  yield takeLatest(SELECTED_ACCOUNT_REFETCH_DIVIDENDS, loadSelectedAccountInfo);

  yield takeLatest(ACCOUNT_BALANCE_FETCH, loadAccountBalance);
  yield takeLatest(ACCOUNT_POSITIONS_FETCH, loadAccountPositions);
  yield takeLatest(ACCOUNTS_EXPORT_TO_CSV, exportToCSV);
}

function* loginSaga(action: PayloadAction<LoginActionPayload>) {
  try {
    const {
      data: { token },
    }: AxiosResponse<AuthResponse> = yield call(
      [authenticatedFetch, "post"],
      `${config.API_URL}/auth`,
      action.payload
    );

    yield call([localStorage, "setItem"], "token", token);
    yield put(LOGIN_SUCCESS());
  } catch (error) {
    console.error(error);
    yield put(LOGIN_FAILURE());
  }
}

function* logoutSaga() {
  const accountsState: AccountsState = yield select(accountsStateSelector);

  for (const account of accountsState.accounts) {
    yield call(flushAllCache, account?.key!);
  }

  yield call([localStorage, "removeItem"], "token");
  yield call([window.location, "reload"]);
}

function* createCachedFetchSaga() {
  const accountsState: AccountsState = yield select(accountsStateSelector);
  const cachedFetch: AxiosCacheInstance = yield call(
    createCachedFetch,
    accountsState.selectedAccount?.key!
  );

  return cachedFetch;
}

function* loadAccounts() {
  try {
    const { data: accounts }: AxiosResponse<Account[]> = yield call(
      [authenticatedFetch, "get"],
      `${config.API_URL}/accounts`
    );

    yield put(ACCOUNTS_SUCCESS(accounts));
    yield put(ACCOUNTS_SELECTED_ACCOUNT_SET(accounts[0]));
  } catch (error) {
    console.error(error);
    yield put(ACCOUNTS_FAILURE());
  }
}

function* loadSelectedAccountInfo(
  action: PayloadAction<TradingApiRequestActionPayload>
) {
  yield put(ACCOUNT_BALANCE_LOADING_SET(true));
  yield put(ACCOUNT_POSITIONS_LOADING_SET(true));

  const token = action.payload.token;
  const accountsState: AccountsState = yield select(accountsStateSelector);

  switch (action.type) {
    case SELECTED_ACCOUNT_REFETCH_ALL.type:
      yield call(flushAccountCache, accountsState.selectedAccount?.key!);
      yield call(flushPositionsCache, accountsState.selectedAccount?.key!);
      yield call(flushDividendsCache, accountsState.selectedAccount?.key!);
      break;
    case SELECTED_ACCOUNT_BALANCE_REFETCH.type:
      yield call(flushAccountCache, accountsState.selectedAccount?.key!);
      break;
    case SELECTED_ACCOUNT_REFETCH_POSITIONS.type:
      yield call(flushPositionsCache, accountsState.selectedAccount?.key!);
      break;
    case SELECTED_ACCOUNT_REFETCH_DIVIDENDS.type:
      yield call(flushDividendsCache, accountsState.selectedAccount?.key!);
      break;
  }

  yield call(loadAccountMetadata, action);
  yield call(loadConversionRate);

  yield delay(1000);
  yield put(ACCOUNT_BALANCE_FETCH({ token }));
  yield delay(2000);
  yield put(ACCOUNT_POSITIONS_FETCH({ token }));
}

function* loadConversionRate() {
  try {
    const cachedFetch: AxiosCacheInstance = yield call(createCachedFetchSaga);

    const { data }: AxiosResponse<ExchangeRateApiResponseData> = yield call(
      [cachedFetch, "get"],
      config.EXCHANGE_RATE_API_URL,
      { id: config.cacheKey.EXCHANGE_RATE }
    );

    yield put(EXCHANGE_RATE_SUCCESS(data.conversion_rates));
  } catch (error) {
    console.error(error);
    yield put(EXCHANGE_RATE_FAILURE());
  }
}

function* loadEarningsReport(positions: AccountPositions) {
  try {
    yield put(EARNINGS_REPORT_FETCH());
    const tickers = positions.map((op) => op.tickerGlobal).filter(Boolean);
    const { data }: AxiosResponse<EarningsCalendarApiResponseData> = yield call(
      [axios, "get"],
      config.EARNINGS_CALENDAR_API_URL
    );

    const earningsReport = getEarningsReport(data.earnings, tickers);
    yield put(EARNINGS_REPORT_SUCCESS(earningsReport));
  } catch (error) {
    console.error(error);
    yield put(EARNINGS_REPORT_FAILURE());
  }
}

function* loadAccountMetadata(
  action: PayloadAction<TradingApiRequestActionPayload>
) {
  try {
    const cachedFetch: AxiosCacheInstance = yield call(createCachedFetchSaga);
    const accountsState: AccountsState = yield select(accountsStateSelector);
    const cachePrefix = accountsState.selectedAccount?.key!;

    const accountMetadata: AccountMetadata = yield call(
      [TradingApi, "fetchAccountMetadata"],
      action.payload.token,
      { fetch: cachedFetch }
    );

    setAccountSyncedAtIfNeeded(cachePrefix);

    yield put(ACCOUNT_METADATA_SUCCESS(accountMetadata));
  } catch (error) {
    console.error(error);
    yield put(ACCOUNT_METADATA_FAILURE());
  }
}

function* loadAccountBalance(
  action: PayloadAction<TradingApiRequestActionPayload>
) {
  try {
    const cachedFetch: AxiosCacheInstance = yield call(createCachedFetchSaga);

    const accountMetadataState: AccountMetadataState = yield select(
      accountMetadataStateSelector
    );

    const accountBalance: AccountBalance = yield call(
      [TradingApi, "fetchAccountDetails"],
      action.payload.token,
      {
        fetch: cachedFetch,
        accountMetadata: accountMetadataState.accountMetadata!,
      }
    );

    yield put(ACCOUNT_BALANCE_SUCCESS(accountBalance));
  } catch (error) {
    console.error(error);
    yield put(ACCOUNT_BALANCE_FAILURE());
  }
}

function* loadAccountPositions(
  action: PayloadAction<TradingApiRequestActionPayload>
) {
  try {
    // Hack: Force account balance to be available in store
    yield call(loadAccountBalance, action);

    const cachedFetch: AxiosCacheInstance = yield call(createCachedFetchSaga);

    const token = action.payload.token;
    const accountMetadataState: AccountMetadataState = yield select(
      accountMetadataStateSelector
    );
    const accountMetadata = accountMetadataState.accountMetadata!;
    const accountBalanceState: AccountBalanceState = yield select(
      accountBalanceStateSelector
    );
    const accountBalance = accountBalanceState.accountBalance!;
    const exchangeRateState: ExchangeRateState = yield select(
      exchangeRateStateSelector
    );

    const accountPositions: AccountPositions = yield call(
      [TradingApi, "fetchAllPositions"],
      token,
      {
        fetch: cachedFetch,
        accountMetadata,
        exchangeRate: exchangeRateState.exchangeRate!,
        accountBalance,
      }
    );

    yield put(ACCOUNT_POSITIONS_SUCCESS(accountPositions));

    // Set earnings reports
    yield call(loadEarningsReport, accountPositions);
    const earningsReport: EarningsReportState = yield select(
      earningsReportStateSelector
    );
    for (const instrument of accountPositions) {
      const earningsReports =
        earningsReport.report?.companyMap[instrument.tickerGlobal];

      if (!earningsReports) continue;

      yield put(
        ACCOUNT_POSITION_EARNINGS_REPORT_SET({
          instrument,
          earningsReports,
          accountMetadata,
        })
      );
    }

    // Fetch transactions & dividends
    for (const instrument of accountPositions) {
      // Fetch position's dividends
      const dividendsCache: StorageValue = yield call(
        [cachedFetch.storage, "get"],
        `${config.cacheKey.DIVIDENDS}_${instrument.ticker}_0`
      );

      if (__DEV__) {
        debug(
          `checking dividends cache (${instrument.ticker})`,
          `${config.cacheKey.DIVIDENDS}_${instrument.ticker}_0`
        );
      }
      if (dividendsCache.state === "empty") {
        if (__DEV__) {
          debug(
            `missed dividends cache (${instrument.ticker})`,
            `${config.cacheKey.DIVIDENDS}_${instrument.ticker}_0`
          );
        }
        yield delay(config.trading.DIVIDENDS_ENDPOINT_RATE_LIMIT_MS);
      } else {
        if (__DEV__) {
          debug(
            `serving dividends (${instrument.ticker}) from cache`,
            `${config.cacheKey.DIVIDENDS}_${instrument.ticker}_0`
          );
        }
      }

      const positionDividends: InstrumentDividends = yield call(
        [TradingApi, "fetchPositionDividends"],
        token,
        instrument,
        {
          fetch: cachedFetch,
          accountMetadata,
        }
      );

      yield put(
        ACCOUNT_POSITION_DIVIDENDS_SET({
          instrument,
          dividends: positionDividends,
          accountMetadata,
        })
      );

      // Fetch position's transactions
      const transactionsCache: StorageValue = yield call(
        [cachedFetch.storage, "get"],
        `${config.cacheKey.TRANSACTIONS}_${instrument.ticker}_0`
      );

      if (__DEV__) {
        debug(
          `checking transactions cache (${instrument.ticker})`,
          `${config.cacheKey.TRANSACTIONS}_${instrument.ticker}_0`
        );
      }
      if (transactionsCache.state === "empty") {
        if (__DEV__) {
          debug(
            `missed transactions cache (${instrument.ticker})`,
            `${config.cacheKey.TRANSACTIONS}_${instrument.ticker}_0`
          );
        }
        yield delay(config.trading.TRANSACTIONS_ENDPOINT_RATE_LIMIT_MS);
      } else {
        debug(
          `serving transactions (${instrument.ticker}) from cache`,
          `${config.cacheKey.DIVIDENDS}_${instrument.ticker}_0`
        );
      }

      const positionTransactions: InstrumentTransactions = yield call(
        [TradingApi, "fetchPositionTransactions"],
        token,
        instrument,
        {
          fetch: cachedFetch,
          accountMetadata,
          exchangeRate: exchangeRateState.exchangeRate!,
        }
      );

      yield put(
        ACCOUNT_POSITION_TRANSACTIONS_SET({
          instrument,
          transactions: positionTransactions,
          accountMetadata,
        })
      );
    }

    yield put(ACCOUNTS_EXPORT_READY_SET(true));

    const accountPositionsState: AccountPositionsState = yield select(
      accountPositionsStateSelector
    );
    const allDividends: InstrumentDividendItem[] = orderBy(
      accountPositionsState.accountPositions?.flatMap(
        (position) => position.dividendItems || []
      ),
      "paidOn",
      "desc"
    );

    yield put(ACCOUNTS_ALL_DIVIDENDS_READY_SET(allDividends));
  } catch (error) {
    console.error(error);
    yield put(ACCOUNT_POSITIONS_FAILURE());
  }
}

function* exportToCSV() {
  const accountsState: AccountsState = yield select(accountsStateSelector);

  if (!accountsState.exportReady) {
    alert("Wait until data finish loading");
    return;
  }

  const now = new Date().toISOString().split(".")[0];
  const accountName = accountsState.selectedAccount!.name;
  const filePrefix = `${accountName}-${now}`;

  const accountPositions: AccountPositionsState = yield select(
    accountPositionsStateSelector
  );

  const positionsCsv = jsonToCsv(
    accountPositions.accountPositions,
    [
      "fullName",
      "tickerGlobal",
      "countryOfOrigin",
      "averagePriceDisplay",
      "currentPriceDisplay",
      "quantity",
      "totalInvestedDisplay",
      "totalInvestedPercentage",
      "pplDisplay",
      "pplPercentage",
      "dividendTotalDisplay",
      "pplAndDividendsDisplay",
    ],
    {
      fullName: "Company",
      tickerGlobal: "Ticker",
      countryOfOrigin: "Country",
      averagePriceDisplay: "AVG Price",
      currentPriceDisplay: "Current Price",
      quantity: "Quantity",
      totalInvestedDisplay: "Invested $",
      totalInvestedPercentage: "Invested %",
      pplDisplay: "ROI $",
      pplPercentage: "ROI %",
      dividendTotalDisplay: "Dividends",
      pplAndDividendsDisplay: "Result",
    }
  );
  downloadCsv(positionsCsv, `${filePrefix}-positions.csv`);

  const flattenedTransactions = flatMap(
    accountPositions.accountPositions,
    (item) =>
      map(item.transactionItems, (transaction) => ({
        ...transaction,
        fullName: item.fullName,
        tickerGlobal: item.tickerGlobal,
        countryOfOrigin: item.countryOfOrigin,
      }))
  );
  const transactionsCsv = jsonToCsv(
    flattenedTransactions,
    [
      "fullName",
      "tickerGlobal",
      "countryOfOrigin",
      "dateCreatedDisplay",
      "statusDisplay",
      "isPieDisplay",
      "quantity",
      "estimatedSharePriceDisplay",
      "estimatedTotalDisplay",
    ],
    {
      fullName: "Company",
      tickerGlobal: "Ticker",
      countryOfOrigin: "Country",
      dateCreatedDisplay: "Date",
      statusDisplay: "Status",
      quantity: "Quantity",
      isPieDisplay: "From Pie",
      estimatedSharePriceDisplay: "Estimated Share Price",
      estimatedTotalDisplay: "Estimated Total",
    }
  );
  downloadCsv(transactionsCsv, `${filePrefix}-transactions.csv`);
}
