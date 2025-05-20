import axios from "axios";
import PQueue from "p-queue";
import ms from "ms";
import { addDays, format } from "date-fns";

import { ClientApiService } from "@/lib/client/api";
import { ProviderFactory } from "@/lib/providers/providerFactory";
import { createLogger } from "@/lib/logger";
import { UserAccountV2 } from "@/types";

// NEXT:
// - Be able to call this function from NextJS cron: fetch instruments file & this script
// - [x] Add finviz & yahoo links
// - [x] Add dividends to portfolio table
// - [ ] Check calculations & conversion estimations
// - [ ] Pull positions history
// - [ ] Add snapshot calendar
//
// NICE TO HAVE:
// - Check `syncedOn` property to understand if today's been already fetched

if (!process.env.NEXT_PUBLIC_API_TOKEN) {
  throw new Error("Env variable NEXT_PUBLIC_API_TOKEN is required");
}
if (!process.env.NEXT_PUBLIC_API_URL) {
  throw new Error("Env variable NEXT_PUBLIC_API_URL is required");
}

const env = {
  baseUrl: process.env.NEXT_PUBLIC_API_URL,
  token: process.env.NEXT_PUBLIC_API_TOKEN,
};

const logger = createLogger({
  name: "sync-trading-providers-data",
});

type SyncStats = {
  dividendsProcessed: number;
  dividendsFailed: number;
  positionsProcessed: number;
  positionsFailed: number;
};

const createApiService = (baseUrl: string, token: string): ClientApiService => {
  const api = axios.create({
    baseURL: baseUrl,
    headers: { "x-api-token": `Bearer ${token}` },
  });

  return new ClientApiService(api);
};

async function main() {
  const stats: SyncStats = {
    dividendsProcessed: 0,
    dividendsFailed: 0,
    positionsProcessed: 0,
    positionsFailed: 0,
  };

  try {
    const apiService = createApiService(env.baseUrl, env.token);
    const accounts = await apiService.getAccounts();

    const queue = new PQueue({ concurrency: 5 });

    for (const account of accounts) {
      const context = {
        userId: account.userId,
        accountId: account.id,
        accountName: account.name,
        provider: account.provider,
      };

      const updateAccountMeta = async (metadata: UserAccountV2["metadata"]) => {
        logger.info({ ...context, metadata }, "Updating account metadata");
        await apiService.updateAccount(account.id, {
          ...account,
          metadata,
        });
        logger.info({ ...context, metadata }, "Account metadata updated");
      };

      const startTime = performance.now();
      logger.info(context, "Initialising provider sync");
      const provider = ProviderFactory.getProvider({ account, logger });

      // Check if we need to sync dividends
      const shouldSyncDividends = await provider.shouldSyncDividends();
      if (shouldSyncDividends) {
        logger.info(context, "Fetching dividends from provider");
        const dividends = await provider.getDividends();
        logger.info(
          { ...context, count: dividends.length },
          "Provider dividends retrieved"
        );

        for (const dividend of dividends) {
          queue.add(() =>
            provider.processDividend(dividend, apiService, stats)
          );
        }

        queue.add(() =>
          updateAccountMeta({
            ...account.metadata,
            dividendsSyncedOn: new Date().toISOString(),
          })
        );
      } else {
        const lastSync = account.metadata.dividendsSyncedOn;
        const nextSync = addDays(
          new Date(lastSync),
          provider.getSyncConfig().dividends.frequencyDays
        );
        logger.info(
          context,
          `Skipping dividends sync. Next sync due on ${format(
            nextSync,
            "yyyy-MM-dd"
          )}`
        );
      }

      // Check if we need to sync positions
      const shouldSyncPositions = await provider.shouldSyncPositions();
      if (shouldSyncPositions) {
        logger.info(context, "Fetching account snapshot from provider");
        const snapshot = await provider.createAccountSnapshot();
        logger.info(
          { ...context, positionsCount: snapshot.positions.length },
          "Provider account snapshot retrieved"
        );

        queue.add(() =>
          provider.processAccountSnapshot(snapshot, apiService, stats)
        );

        queue.add(() =>
          updateAccountMeta({
            ...account.metadata,
            accountSnapshotSyncedOn: new Date().toISOString(),
          })
        );
      } else {
        const lastSync = account.metadata.accountSnapshotSyncedOn;
        const nextSync = addDays(
          new Date(lastSync),
          provider.getSyncConfig().positions.frequencyDays
        );
        logger.info(
          context,
          `Skipping positions sync. Next sync due on ${format(
            nextSync,
            "yyyy-MM-dd"
          )}`
        );
      }

      await queue.onIdle();

      logger.info(
        {
          ...context,
          duration: ms(performance.now() - startTime),
          stats: {
            dividendsProcessed: stats.dividendsProcessed,
            dividendsFailed: stats.dividendsFailed,
            positionsProcessed: stats.positionsProcessed,
            positionsFailed: stats.positionsFailed,
          },
        },
        "Account processing completed"
      );
    }

    logger.info({ stats }, "Sync completed successfully");
  } catch (error) {
    logger.error(error, "Sync failed");
    process.exit(1);
  }

  process.exit(0);
}

main();
