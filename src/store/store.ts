import { combineReducers, configureStore } from "@reduxjs/toolkit";
import createSagaMiddleware from "@redux-saga/core";
import {
  authReducer,
  accountsReducer,
  accountMetadataReducer,
  accountBalanceReducer,
  accountPositionsReducer,
  exchangeRateReducer,
  earningsReportReducer,
} from "./slices";

export const sagaMiddleware = createSagaMiddleware();

export const store = configureStore({
  reducer: combineReducers({
    auth: authReducer,
    accounts: accountsReducer,
    accountMetadata: accountMetadataReducer,
    accountBalance: accountBalanceReducer,
    accountPositions: accountPositionsReducer,
    exchangeRate: exchangeRateReducer,
    earningsReport: earningsReportReducer,
  }),
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(sagaMiddleware),
});
