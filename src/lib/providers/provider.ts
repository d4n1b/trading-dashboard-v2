import { addDays, isAfter, parseISO } from "date-fns";
import type { Logger } from "pino";

import type {
  UserAccountV2,
  DividendItemPayloadV2,
  AccountSnapshotV2,
} from "@/types";
import { ClientApiService } from "@/lib/client/api";

export type TradingProviderOptions = {
  account: UserAccountV2;
  logger: Logger;
};

export abstract class TradingProvider {
  protected account: UserAccountV2;
  protected logger: Logger;
  protected readonly syncConfig = {
    dividends: {
      frequencyDays: 7,
    },
    positions: {
      frequencyDays: 1,
    },
  };

  constructor({ account, logger }: TradingProviderOptions) {
    this.account = account;
    this.logger = logger;
  }

  getSyncConfig() {
    return this.syncConfig;
  }

  async shouldSyncDividends(): Promise<boolean> {
    const lastSync = this.account.metadata.dividendsSyncedOn;
    if (!lastSync) return true;

    const lastSyncDate = parseISO(lastSync);
    const nextSyncDate = addDays(
      lastSyncDate,
      this.syncConfig.dividends.frequencyDays
    );
    return isAfter(new Date(), nextSyncDate);
  }

  async shouldSyncPositions(): Promise<boolean> {
    const lastSync = this.account.metadata.accountSnapshotSyncedOn;
    if (!lastSync) return true;

    const lastSyncDate = parseISO(lastSync);
    const nextSyncDate = addDays(
      lastSyncDate,
      this.syncConfig.positions.frequencyDays
    );
    return isAfter(new Date(), nextSyncDate);
  }

  async processDividend(
    dividend: DividendItemPayloadV2,
    apiService: ClientApiService,
    stats: { dividendsProcessed: number; dividendsFailed: number }
  ) {
    const dividendContext = {
      userId: this.account.userId,
      accountId: this.account.id,
      accountName: this.account.name,
      provider: this.account.provider,
      ticker: dividend.ticker,
      amount: dividend.amount,
      internalId: dividend.internalId,
    };

    try {
      const existingDividend = await apiService.getAccountDividend(
        this.account,
        { internalId: dividend.internalId }
      );

      if (!existingDividend) {
        this.logger.info(dividendContext, "Processing new dividend");
        const newDividend = await apiService.createAccountDividend(
          this.account,
          { ...dividend, syncedOn: new Date().toISOString() }
        );
        this.logger.info(
          { ...dividendContext, id: newDividend.id },
          "Dividend successfully stored"
        );
        stats.dividendsProcessed++;
      }
    } catch (error) {
      this.logger.error(
        {
          ...dividendContext,
          error: error instanceof Error ? error.message : String(error),
        },
        "Dividend failed to be processed"
      );
      stats.dividendsFailed++;
    }
  }

  async processAccountSnapshot(
    snapshot: AccountSnapshotV2,
    apiService: ClientApiService,
    stats: { positionsProcessed: number; positionsFailed: number }
  ) {
    const snapshotContext = {
      userId: this.account.userId,
      accountId: this.account.id,
      accountName: this.account.name,
      provider: this.account.provider,
      syncedOn: snapshot.syncedOn,
      positionsCount: snapshot.positions.length,
    };

    try {
      const existingSnapshot = await apiService.getAccountSnapshot(
        this.account,
        {
          accountId: this.account.id,
          syncedOn: snapshot.syncedOn,
        }
      );

      if (!existingSnapshot) {
        this.logger.info(snapshotContext, "Processing new account snapshot");
        const newSnapshot = await apiService.createAccountSnapshot(
          this.account,
          {
            ...snapshot,
            syncedOn: new Date().toISOString(),
          }
        );
        this.logger.info(
          { ...snapshotContext, id: newSnapshot.id },
          "Account snapshot successfully stored"
        );
        stats.positionsProcessed++;
      }
    } catch (error) {
      this.logger.error(
        {
          ...snapshotContext,
          error: error instanceof Error ? error.message : String(error),
        },
        "Account snapshot failed to be processed"
      );
      stats.positionsFailed++;
    }
  }

  abstract getDividends(): Promise<DividendItemPayloadV2[]>;
  abstract createAccountSnapshot(): Promise<AccountSnapshotV2>;
}
