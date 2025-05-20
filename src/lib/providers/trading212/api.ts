import {
  PortfolioOpenPosition,
  APIClient as Trading212Client,
} from "trading212-api";

import { DividendItemPayloadV2, AccountSnapshotV2 } from "@/types";
import { TradingProvider, TradingProviderOptions } from "../provider";
import { Trading212ShortNameTickerMap } from "@/config";

type Trading212Instrument = Awaited<
  ReturnType<Trading212Client["rest"]["metadata"]["getInstruments"]>
>[0];

type Trading212Position = PortfolioOpenPosition;

export class Trading212Provider extends TradingProvider {
  private client: Trading212Client;
  private instrumentsMap: Record<string, Trading212Instrument> = {};

  constructor(options: TradingProviderOptions) {
    super(options);
    this.client = new Trading212Client(
      Trading212Client.URL_LIVE,
      options.account.token
    );

    this.ensureInstrumentsMap();
  }

  async getDividends() {
    await this.ensureInstrumentsMap();

    const dividends: DividendItemPayloadV2[] = [];

    const positions = await this.client.rest.portfolio.getOpenPosition();
    for await (const position of positions) {
      const paidOutDividends = this.client.rest.history.getPaidOutDividends(
        position.ticker
      );
      for await (const dividend of paidOutDividends) {
        dividends.push({
          userId: this.account.userId,
          accountId: this.account.id,
          ticker: this.getGlobalTicker(position),
          companyName:
            this.instrumentsMap[position.ticker]?.name ?? position.ticker,
          isin: this.instrumentsMap[position.ticker]?.isin ?? "",
          internalTicker: dividend.ticker,
          internalId: dividend.reference,
          quantity: dividend.quantity,
          amount: dividend.amount,
          grossAmountPerShare: dividend.grossAmountPerShare,
          syncedOn: undefined,
          paidOn: dividend.paidOn,
          metadata: {
            type: dividend.type,
          },
        });
      }
    }

    return dividends;
  }

  async createAccountSnapshot() {
    await this.ensureInstrumentsMap();

    const positions = await this.client.rest.portfolio.getOpenPosition();
    const account = await this.client.rest.account.getCash();

    const snapshot: AccountSnapshotV2 = {
      id: `${this.account.id}_${new Date().toISOString()}`,
      accountId: this.account.id,
      syncedOn: new Date().toISOString(),
      balance: {
        free: account.free,
        total: account.total,
        ppl: account.ppl,
        result: account.result,
        invested: account.invested,
        pieCash: account.pieCash,
        blocked: account.blocked ?? 0,
      },
      metadata: {},
      positions: [],
    };

    for await (const position of positions) {
      snapshot.positions.push({
        type: this.instrumentsMap[position.ticker]?.type ?? "",
        isin: this.instrumentsMap[position.ticker]?.isin ?? "",
        currencyCode: this.instrumentsMap[position.ticker]?.currencyCode ?? "",
        companyName:
          this.instrumentsMap[position.ticker]?.name ?? position.ticker,
        internalTicker: position.ticker,
        ticker: this.getGlobalTicker(position),
        quantity: position.quantity,
        averagePrice: position.averagePrice,
        currentPrice: position.currentPrice,
        ppl: position.ppl,
        fxPpl: position.fxPpl ?? 0,
      });
    }

    return snapshot;
  }

  private async ensureInstrumentsMap() {
    if (Object.values(this.instrumentsMap).length === 0) {
      const instruments = await this.client.rest.metadata.getInstruments();
      const positions = await this.client.rest.portfolio.getOpenPosition();
      const positionTickers = positions.map((position) => position.ticker);

      for (const instrument of instruments) {
        if (positionTickers.includes(instrument.ticker)) {
          this.instrumentsMap[instrument.ticker] = instrument;
        }
      }
    }
  }

  private getGlobalTicker(position: Trading212Position) {
    return (
      Trading212ShortNameTickerMap[position.ticker] ||
      (
        this.instrumentsMap[position.ticker]?.shortName || position.ticker
      ).replace(".", "-")
    );
  }
}
