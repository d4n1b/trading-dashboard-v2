import {
  PortfolioOpenPosition,
  APIClient as Trading212Client,
} from "trading212-api";

import {
  DividendItemPayloadV2,
  UnwrapAsyncGenerator,
  UserAccountV2,
} from "@/types.v2";
import fixtureDividends from "../../../../fixture/trading_212_dividends.json";
import type { TradingProvider } from "../index";

const shortNameTickerMap: Record<string, string> = {
  AEDASe_EQ: "AEDAS.MC",
  AMZd_EQ: "AMZ.DE",
  ASMLa_EQ: "ASML.AS",
  BBOXl_EQ: "BBOX.L",
  IBS_PT_EQ: "IBS.LS",
  ICSUl_EQ: "ICSU.L",
  INRGl_EQ: "INRG.L",
  QDVEd_EQ: "QDVE.DE",
  RIO_US_EQ: "RIO.L",
  SGROl_EQ: "SGRO.L",
};

export const instrumentCustomType = {
  Delisted: "delisted",
};

type Trading212Instrument = Awaited<
  ReturnType<Trading212Client["rest"]["metadata"]["getInstruments"]>
>[0];

type Trading212Position = PortfolioOpenPosition;

type Trading212Dividend = UnwrapAsyncGenerator<
  ReturnType<Trading212Client["rest"]["history"]["getPaidOutDividends"]>
>;

export class Trading212Provider implements TradingProvider {
  private client: Trading212Client;
  private account: UserAccountV2;
  private instrumentsMap: Record<string, Trading212Instrument> = {};

  constructor(account: UserAccountV2) {
    this.account = account;
    this.client = new Trading212Client(
      Trading212Client.URL_LIVE,
      account.token
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
        dividends.push(this.toTradingProviderDividend(position, dividend));
      }
    }

    return dividends;
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
      shortNameTickerMap[position.ticker] ||
      (
        this.instrumentsMap[position.ticker].shortName || position.ticker
      ).replace(".", "-")
    );
  }

  private toTradingProviderDividend(
    position: Trading212Position,
    dividend: Trading212Dividend
  ): DividendItemPayloadV2 {
    return {
      accountId: this.account.id,
      ticker: this.getGlobalTicker(position),
      externalTicker: dividend.ticker,
      externalId: dividend.reference,
      quantity: dividend.quantity,
      amount: dividend.amount,
      grossAmountPerShare: dividend.grossAmountPerShare,
      syncedOn: undefined,
      paidOn: dividend.paidOn,
      metadata: {
        amountInEuro: dividend.amountInEuro,
        type: dividend.type,
      },
    };
  }
}
