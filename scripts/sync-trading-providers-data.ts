import axios from "axios";
import PQueue from "p-queue";
import ms from "ms";

import { ClientApiService } from "@/lib/client/api";
import { ProviderFactory } from "@/lib/providers";
import { logger } from "./logger";

// NEXT:
// - Be able to call this function from NextJS cron
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

const main = async function () {
  const apiService = createApiService(env.baseUrl, env.token);
  const accounts = await apiService.getAccounts();

  const queue = new PQueue({ concurrency: 5 });

  for (const account of accounts) {
    const logContext = {
      accountId: account.id,
      accountName: account.name,
      provider: account.provider,
    };

    const startTime = performance.now();
    logger.info(logContext, "Initialising provider sync");
    const provider = ProviderFactory.getProvider(account);

    logger.info(logContext, "Fetching dividends from provider");
    const dividends = await provider.getDividends();
    logger.info(
      { ...logContext, count: dividends.length },
      "Provider dividends retrieved"
    );

    for (const dividend of dividends) {
      queue.add(async () => {
        const dividendContext = {
          ...logContext,
          ticker: dividend.ticker,
          amount: dividend.amount,
          externalId: dividend.externalId,
        };

        try {
          logger.info(dividendContext, "Processing new dividend");
          const existingDividend = await apiService.getDividend({
            externalId: dividend.externalId,
          });

          if (!existingDividend) {
            const newDividend = await apiService.createDividend({
              ...dividend,
              syncedOn: new Date().toISOString(),
            });
            logger.info(
              { ...dividendContext, id: newDividend.id },
              "Dividend successfully stored"
            );
          }
        } catch (error) {
          logger.error(
            {
              ...dividendContext,
              error: error instanceof Error ? error.message : String(error),
            },
            "Dividend failed to be processed"
          );
        }
      });
    }

    await queue.onIdle();

    logger.info(
      logContext,
      `Account processing completed. Took ${ms(performance.now() - startTime)}`
    );
  }

  process.exit(0);
};

main();

function createApiService(baseUrl: string, token: string): ClientApiService {
  const api = axios.create({
    baseURL: baseUrl,
    headers: { "x-api-token": `Bearer ${token}` },
  });

  return new ClientApiService(api);
}
