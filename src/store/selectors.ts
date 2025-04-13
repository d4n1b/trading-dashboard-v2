import { createSelector } from "@reduxjs/toolkit";
import { AppState } from "./slices";

const stateSelector = (state: AppState) => state;

export const authStateSelector = createSelector(
  stateSelector,
  (state: AppState) => state.auth
);

export const exchangeRateStateSelector = createSelector(
  stateSelector,
  (state: AppState) => state.exchangeRate
);

export const earningsReportStateSelector = createSelector(
  stateSelector,
  (state: AppState) => state.earningsReport
);

export const accountsStateSelector = createSelector(
  stateSelector,
  (state: AppState) => state.accounts
);

export const accountBalanceStateSelector = createSelector(
  stateSelector,
  (state: AppState) => state.accountBalance
);

export const accountMetadataStateSelector = createSelector(
  stateSelector,
  (state: AppState) => state.accountMetadata
);

export const accountPositionsStateSelector = createSelector(
  stateSelector,
  (state: AppState) => state.accountPositions
);
