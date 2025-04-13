import { createAction, createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  AccountBalance,
  Account,
  AccountPositions,
  Instrument,
  InstrumentDividends,
  AccountMetadata,
  ExchangeRate,
  InstrumentTransactions,
  EarningsReport,
  InstrumentEarningReport,
  InstrumentDividendItem,
} from "../types";
import { toCurrency } from "../utils";

export type AppState = {
  auth: AuthState;
  accounts: AccountsState;
  exchangeRate: ExchangeRateState;
  earningsReport: EarningsReportState;
  accountMetadata: AccountMetadataState;
  accountBalance: AccountBalanceState;
  accountPositions: AccountPositionsState;
};

export type LoginActionPayload = {
  username: string;
  password: string;
};

export type AuthState = {
  isLoggedIn: boolean;
  loading: boolean;
  error: boolean;
};

const initialAuthState: AuthState = {
  isLoggedIn:
    typeof localStorage === "undefined"
      ? false
      : Boolean(localStorage.getItem("token")),
  loading: false,
  error: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState: initialAuthState,
  reducers: {
    LOGIN_FETCH(state, _: PayloadAction<LoginActionPayload>) {
      state.isLoggedIn = false;
      state.loading = true;
      state.error = false;
    },
    LOGIN_SUCCESS(state) {
      state.isLoggedIn = true;
      state.loading = false;
      state.error = false;
    },
    LOGIN_FAILURE(state) {
      state.isLoggedIn = false;
      state.loading = false;
      state.error = true;
    },
  },
});

export type AccountActionPayload = Account[];
export type AccountSetSelectedActionPayload = Account;

export type AccountsState = {
  accounts: Account[];
  selectedAccount: Account | null;
  allDividendsReady: boolean;
  allDividends: InstrumentDividendItem[];
  exportReady: boolean;
  loading: boolean;
  error: boolean;
};

const initialAccountsState: AccountsState = {
  accounts: [],
  selectedAccount: null,
  allDividendsReady: false,
  allDividends: [],
  exportReady: false,
  loading: false,
  error: false,
};

const accountsSlice = createSlice({
  name: "accounts",
  initialState: initialAccountsState,
  reducers: {
    ACCOUNTS_FETCH(state) {
      state.loading = true;
      state.error = false;
    },
    ACCOUNTS_SUCCESS(state, action: PayloadAction<AccountActionPayload>) {
      state.accounts = action.payload;
      state.loading = false;
      state.error = false;
    },
    ACCOUNTS_FAILURE(state) {
      state.loading = false;
      state.error = true;
    },
    ACCOUNTS_SELECTED_ACCOUNT_SET(
      state,
      action: PayloadAction<AccountSetSelectedActionPayload>
    ) {
      state.selectedAccount = action.payload;
    },
    ACCOUNTS_EXPORT_READY_SET(state, action: PayloadAction<boolean>) {
      state.exportReady = action.payload;
    },
    ACCOUNTS_EXPORT_TO_CSV() {},
    ACCOUNTS_ALL_DIVIDENDS_READY_SET(
      state,
      action: PayloadAction<InstrumentDividendItem[]>
    ) {
      state.allDividends = action.payload;
      state.allDividendsReady = true;
    },
  },
});

export type TradingApiRequestActionPayload = {
  token: string;
};

export type AccountMetadataState = {
  accountMetadata: AccountMetadata | null;
  loading: boolean;
  error: boolean;
};

export type AccountMetadataActionPayload = AccountMetadata;

const initialAccountMetadataState: AccountMetadataState = {
  accountMetadata: null,
  loading: true,
  error: false,
};

const accountMetadataSlice = createSlice({
  name: "accountMetadata",
  initialState: initialAccountMetadataState,
  reducers: {
    ACCOUNT_METADATA_FETCH(
      state,
      _: PayloadAction<TradingApiRequestActionPayload>
    ) {
      state.error = false;
      state.loading = true;
    },
    ACCOUNT_METADATA_SUCCESS(
      state,
      action: PayloadAction<AccountMetadataActionPayload>
    ) {
      state.accountMetadata = action.payload;
      state.error = false;
      state.loading = false;
    },
    ACCOUNT_METADATA_FAILURE(state) {
      state.error = true;
      state.loading = false;
    },
  },
});

export type AccountBalanceState = {
  accountBalance: AccountBalance | null;
  loading: boolean;
  error: boolean;
};

export type AccountBalanceActionPayload = AccountBalance;

const initialAccountBalanceState: AccountBalanceState = {
  accountBalance: null,
  loading: true,
  error: false,
};

const accountBalanceSlice = createSlice({
  name: "accountBalance",
  initialState: initialAccountBalanceState,
  reducers: {
    ACCOUNT_BALANCE_FETCH(
      state,
      _: PayloadAction<TradingApiRequestActionPayload>
    ) {
      state.error = false;
      state.loading = true;
    },
    ACCOUNT_BALANCE_SUCCESS(
      state,
      action: PayloadAction<AccountBalanceActionPayload>
    ) {
      state.accountBalance = action.payload;
      state.error = false;
      state.loading = false;
    },
    ACCOUNT_BALANCE_FAILURE(state) {
      state.error = true;
      state.loading = false;
    },
    ACCOUNT_BALANCE_LOADING_SET(
      state,
      action: PayloadAction<AccountBalanceState["loading"]>
    ) {
      state.loading = action.payload;
    },
  },
});

export type AccountPositionsState = {
  accountPositions: AccountPositions;
  loading: boolean;
  error: boolean;
};

export type AccountPositionsActionPayload = AccountPositions;
export type AccountPositionDetailsActionPayload =
  TradingApiRequestActionPayload & {
    instrument: Instrument;
  };

export type AccountPositionTransactionsSetActionPayload = {
  instrument: Instrument;
  transactions: InstrumentTransactions;
  accountMetadata: AccountMetadata;
};
export type AccountPositionDividendsSetActionPayload = {
  instrument: Instrument;
  dividends: InstrumentDividends;
  accountMetadata: AccountMetadata;
};
export type AccountPositionEarningsReportSetActionPayload = {
  instrument: Instrument;
  earningsReports: InstrumentEarningReport[];
  accountMetadata: AccountMetadata;
};
export type AccountPositionDetailsSetActionPayload = {
  instrument: Instrument;
  dividends: InstrumentDividends;
  transactions: InstrumentTransactions;
  accountMetadata: AccountMetadata;
};

const initialAccountPositionsState: AccountPositionsState = {
  accountPositions: [],
  loading: true,
  error: false,
};

const accountPositionsSlice = createSlice({
  name: "accountPositions",
  initialState: initialAccountPositionsState,
  reducers: {
    ACCOUNT_POSITIONS_FETCH(
      state,
      _: PayloadAction<TradingApiRequestActionPayload>
    ) {
      state.error = false;
      state.loading = true;
    },
    ACCOUNT_POSITIONS_SUCCESS(
      state,
      action: PayloadAction<AccountPositionsActionPayload>
    ) {
      state.accountPositions = action.payload;
      state.error = false;
      state.loading = false;
    },
    ACCOUNT_POSITIONS_FAILURE(state) {
      state.error = true;
      state.loading = false;
    },
    ACCOUNT_POSITIONS_LOADING_SET(
      state,
      action: PayloadAction<AccountPositionsState["loading"]>
    ) {
      state.error = false;
      state.loading = action.payload;
    },
    ACCOUNT_POSITION_TRANSACTIONS_SET(
      state,
      action: PayloadAction<AccountPositionTransactionsSetActionPayload>
    ) {
      const openPositionIndex = state.accountPositions.findIndex(
        (op) => op.ticker === action.payload.instrument.ticker
      );

      if (openPositionIndex === -1) return;

      const { transactions } = action.payload;
      const openPosition = state.accountPositions[openPositionIndex];

      // Set transactions
      openPosition.transactionItems = transactions.items;
      const updatedPositions = [...state.accountPositions];
      updatedPositions[openPositionIndex] = openPosition;

      state.accountPositions = updatedPositions;
    },
    ACCOUNT_POSITION_DIVIDENDS_SET(
      state,
      action: PayloadAction<AccountPositionDividendsSetActionPayload>
    ) {
      const openPositionIndex = state.accountPositions.findIndex(
        (op) => op.ticker === action.payload.instrument.ticker
      );

      if (openPositionIndex === -1) return;

      const { dividends } = action.payload;
      const openPosition = state.accountPositions[openPositionIndex];

      // Set dividends
      openPosition.dividendTotal = dividends.total;
      openPosition.dividendTotalDisplay = dividends.totalDisplay;
      openPosition.dividendQuantityDisplay = dividends.quantityDisplay;
      openPosition.dividendAmountDisplay = dividends.amountDisplay;
      openPosition.dividendGrossAmountPerShareDisplay =
        dividends.grossAmountPerShareDisplay;
      openPosition.dividendAmountInEuroDisplay = dividends.amountInEuroDisplay;
      openPosition.dividendItems = dividends.items;
      openPosition.pplAndDividends = openPosition.ppl + dividends.total;
      openPosition.pplAndDividendsDisplay = toCurrency(
        openPosition.ppl + dividends.total,
        action.payload.accountMetadata.currencyCode
      );
      const updatedPositions = [...state.accountPositions];
      updatedPositions[openPositionIndex] = openPosition;

      state.accountPositions = updatedPositions;
    },
    ACCOUNT_POSITION_EARNINGS_REPORT_SET(
      state,
      action: PayloadAction<AccountPositionEarningsReportSetActionPayload>
    ) {
      const openPositionIndex = state.accountPositions.findIndex(
        (op) => op.ticker === action.payload.instrument.ticker
      );

      if (openPositionIndex === -1) return;

      const { earningsReports } = action.payload;
      const openPosition = state.accountPositions[openPositionIndex];

      // Set earnings reports
      openPosition.earningsReports = earningsReports;
      const updatedPositions = [...state.accountPositions];
      updatedPositions[openPositionIndex] = openPosition;

      state.accountPositions = updatedPositions;
    },
  },
});

export type ExchangeRateRequestActionPayload = {
  token: string;
};

export type ExchangeRateState = {
  exchangeRate: ExchangeRate | null;
  loading: boolean;
  error: boolean;
};

export type ExchangeRateActionPayload = ExchangeRate;

const initialExchangeRateState: ExchangeRateState = {
  exchangeRate: null,
  loading: true,
  error: false,
};

const exchangeRateSlice = createSlice({
  name: "exchangeRate",
  initialState: initialExchangeRateState,
  reducers: {
    EXCHANGE_RATE_FETCH(
      state,
      _: PayloadAction<TradingApiRequestActionPayload>
    ) {
      state.error = false;
      state.loading = true;
    },
    EXCHANGE_RATE_SUCCESS(
      state,
      action: PayloadAction<ExchangeRateActionPayload>
    ) {
      state.exchangeRate = action.payload;
      state.error = false;
      state.loading = false;
    },
    EXCHANGE_RATE_FAILURE(state) {
      state.error = true;
      state.loading = false;
    },
  },
});

export type EarningsReportState = {
  report: EarningsReport | null;
  loading: boolean;
  error: boolean;
};

const initialEarningsReportState: EarningsReportState = {
  report: null,
  loading: true,
  error: false,
};

const earningsReportSlice = createSlice({
  name: "earningsReport",
  initialState: initialEarningsReportState,
  reducers: {
    EARNINGS_REPORT_FETCH(state) {
      state.error = false;
      state.loading = true;
    },
    EARNINGS_REPORT_SUCCESS(state, action: PayloadAction<EarningsReport>) {
      state.report = action.payload;
      state.error = false;
      state.loading = false;
    },
    EARNINGS_REPORT_FAILURE(state) {
      state.error = true;
      state.loading = false;
    },
  },
});

export const LOGOUT = createAction("LOGOUT");
export const GENERAL_FAILURE = createAction("GENERAL_FAILURE");

export const { LOGIN_FETCH, LOGIN_SUCCESS, LOGIN_FAILURE } = authSlice.actions;
export const authReducer = authSlice.reducer;

export const {
  ACCOUNTS_FETCH,
  ACCOUNTS_SUCCESS,
  ACCOUNTS_FAILURE,
  ACCOUNTS_SELECTED_ACCOUNT_SET,
  ACCOUNTS_EXPORT_READY_SET,
  ACCOUNTS_EXPORT_TO_CSV,
  ACCOUNTS_ALL_DIVIDENDS_READY_SET,
} = accountsSlice.actions;
export const accountsReducer = accountsSlice.reducer;

export const SELECTED_ACCOUNT_FETCH =
  createAction<TradingApiRequestActionPayload>("SELECTED_ACCOUNT_FETCH");

export const SELECTED_ACCOUNT_REFETCH_ALL =
  createAction<TradingApiRequestActionPayload>("SELECTED_ACCOUNT_REFETCH_ALL");
export const SELECTED_ACCOUNT_BALANCE_REFETCH =
  createAction<TradingApiRequestActionPayload>(
    "SELECTED_ACCOUNT_BALANCE_REFETCH"
  );
export const SELECTED_ACCOUNT_REFETCH_POSITIONS =
  createAction<TradingApiRequestActionPayload>(
    "SELECTED_ACCOUNT_REFETCH_POSITIONS"
  );
export const SELECTED_ACCOUNT_REFETCH_DIVIDENDS =
  createAction<TradingApiRequestActionPayload>(
    "SELECTED_ACCOUNT_REFETCH_DIVIDENDS"
  );

export const {
  ACCOUNT_METADATA_FETCH,
  ACCOUNT_METADATA_SUCCESS,
  ACCOUNT_METADATA_FAILURE,
} = accountMetadataSlice.actions;
export const accountMetadataReducer = accountMetadataSlice.reducer;

export const {
  ACCOUNT_BALANCE_FETCH,
  ACCOUNT_BALANCE_SUCCESS,
  ACCOUNT_BALANCE_FAILURE,
  ACCOUNT_BALANCE_LOADING_SET,
} = accountBalanceSlice.actions;
export const accountBalanceReducer = accountBalanceSlice.reducer;

export const {
  ACCOUNT_POSITIONS_FETCH,
  ACCOUNT_POSITIONS_SUCCESS,
  ACCOUNT_POSITIONS_FAILURE,
  ACCOUNT_POSITIONS_LOADING_SET,
  ACCOUNT_POSITION_TRANSACTIONS_SET,
  ACCOUNT_POSITION_DIVIDENDS_SET,
  ACCOUNT_POSITION_EARNINGS_REPORT_SET,
} = accountPositionsSlice.actions;
export const accountPositionsReducer = accountPositionsSlice.reducer;

export const {
  EXCHANGE_RATE_FETCH,
  EXCHANGE_RATE_SUCCESS,
  EXCHANGE_RATE_FAILURE,
} = exchangeRateSlice.actions;
export const exchangeRateReducer = exchangeRateSlice.reducer;

export const {
  EARNINGS_REPORT_FETCH,
  EARNINGS_REPORT_SUCCESS,
  EARNINGS_REPORT_FAILURE,
} = earningsReportSlice.actions;
export const earningsReportReducer = earningsReportSlice.reducer;
