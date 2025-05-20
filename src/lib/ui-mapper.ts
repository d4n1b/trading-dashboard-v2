import { formatDate } from "date-fns";

import { config, tickerFinvizTickerMap } from "@/config";
import {
  AccountSnapshotUIV2,
  AccountSnapshotV2,
  DividendItemUIV2,
  DividendItemV2,
  PositionItemUIV2,
  PositionItemV2,
  UserAccountV2,
} from "@/types";
import { toCurrency } from "@/lib/currency";
import { orderBy, sortBy } from "lodash";

export class UIMapper {
  static dividend = (
    account: UserAccountV2,
    dividend: DividendItemV2
  ): DividendItemUIV2 => {
    const { currencyCode } = account.metadata;

    return {
      ...dividend,
      paidOnDisplay: formatDate(
        dividend.paidOn,
        config.DATE_FORMAT_ISO_DATETIME
      ),
      amountDisplay: toCurrency(dividend.amount, currencyCode),
    };
  };

  static position = (
    account: UserAccountV2,
    position: PositionItemV2
  ): PositionItemUIV2 => {
    const invested = position.quantity * position.averagePrice;
    const { currencyCode } = account.metadata;
    const averagePriceDisplay = toCurrency(
      position.averagePrice,
      position.currencyCode
    );
    const currentPriceDisplay = toCurrency(
      position.currentPrice,
      position.currencyCode
    );

    return {
      ...position,
      finvizLink: `https://finviz.com/quote.ashx?t=${
        tickerFinvizTickerMap[position.ticker] ?? position.ticker
      }`,
      yahooLink: `https://es.finance.yahoo.com/quote/${position.ticker}`,
      countryOfOrigin: position.isin.slice(0, 2),
      averagePriceDisplay,
      currentPriceDisplay,
      averageWithCurrentPriceDisplay: [
        averagePriceDisplay,
        currentPriceDisplay,
      ].join("/"),
      quantityDisplay: position.quantity.toFixed(2),
      invested,
      investedDisplay: toCurrency(invested, position.currencyCode),
      investedPercentage: 0, // This will be calculated after we have all positions
      investedPercentageDisplay: "0%", // This will be calculated after we have all positions
      result: position.ppl,
      resultDisplay: toCurrency(position.ppl, currencyCode),
    };
  };

  static accountSnapshot = (
    account: UserAccountV2,
    snapshot: AccountSnapshotV2,
    dividends: DividendItemV2[]
  ): AccountSnapshotUIV2 => {
    const dividendsByTicker = (() => {
      const map = new Map<string, number>();
      dividends.forEach((dividend) => {
        const current = map.get(dividend.ticker) || 0;
        map.set(dividend.ticker, current + dividend.amount);
      });
      return map;
    })();
    const totalInvested = snapshot.positions.reduce(
      (sum, position) => sum + position.quantity * position.averagePrice,
      0
    );

    // Map positions with UI properties and calculate percentages
    const positions = snapshot.positions.map((position) => {
      const uiPosition = UIMapper.position(account, position);
      const invested = uiPosition.invested;
      const investedPercentage = (invested / totalInvested) * 100;
      const dividends = dividendsByTicker.get(position.ticker) || 0;
      const roi = uiPosition.ppl + dividends;
      const { currencyCode } = account.metadata;

      return {
        ...uiPosition,
        dividends,
        dividendsDisplay: toCurrency(dividends, currencyCode),
        investedPercentage,
        investedPercentageDisplay: `${investedPercentage.toFixed(2)}%`,
        roi,
        roiDisplay: toCurrency(roi, currencyCode),
      };
    });

    return {
      ...snapshot,
      positions: orderBy(positions, ["companyName"], ["asc"]),
    };
  };
}
