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
import { parseCurrencyCode, toCurrency } from "@/lib/currency";

export class UIMapper {
  static dividend = (
    account: UserAccountV2,
    dividend: DividendItemV2
  ): DividendItemUIV2 => {
    return {
      ...dividend,
      paidOnDisplay: formatDate(
        dividend.paidOn,
        config.DATE_FORMAT_ISO_DATETIME
      ),
      amountDisplay: toCurrency(
        dividend.amount,
        parseCurrencyCode(account.metadata.currencyCode)
      ),
    };
  };

  static position = (
    account: UserAccountV2,
    position: PositionItemV2
  ): PositionItemUIV2 => {
    const invested = position.quantity * position.averagePrice;
    const result =
      position.quantity * (position.currentPrice - position.averagePrice);
    const currencyCode = parseCurrencyCode(
      position.currencyCode ?? account.metadata.currencyCode
    );
    const averagePriceDisplay = toCurrency(position.averagePrice, currencyCode);
    const currentPriceDisplay = toCurrency(position.currentPrice, currencyCode);

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
      investedDisplay: toCurrency(invested, currencyCode),
      investedPercentage: 0, // This will be calculated after we have all positions
      investedPercentageDisplay: "0%", // This will be calculated after we have all positions
      result,
      resultDisplay: toCurrency(result, currencyCode),
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

      return {
        ...uiPosition,
        dividends,
        dividendsDisplay: toCurrency(dividends, account.metadata.currencyCode),
        investedPercentage,
        investedPercentageDisplay: `${investedPercentage.toFixed(2)}%`,
      };
    });

    return {
      ...snapshot,
      positions,
    };
  };
}
