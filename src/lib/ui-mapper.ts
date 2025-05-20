import { formatDate } from "date-fns";
import orderBy from "lodash/orderBy";

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
import {
  parseCurrencyCode,
  parseCurrencyValue,
  toCurrency,
} from "@/lib/currency";

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
    const { currencyCode } = account.metadata;

    const averagePriceDisplay = toCurrency(
      position.averagePrice,
      position.currencyCode
    );
    const averagePriceTotal = parseCurrencyValue(
      position.quantity * position.averagePrice,
      position.currencyCode
    );
    const currentPriceDisplay = toCurrency(
      position.currentPrice,
      position.currencyCode
    );
    const currentPriceTotal = parseCurrencyValue(
      position.quantity * position.currentPrice,
      position.currencyCode
    );

    return {
      ...position,
      finvizLink: `https://finviz.com/quote.ashx?t=${
        tickerFinvizTickerMap[position.ticker] ?? position.ticker
      }`,
      yahooLink: `https://es.finance.yahoo.com/quote/${position.ticker}`,
      countryOfOrigin: position.isin.slice(0, 2),
      quantityDisplay: position.quantity.toFixed(2),
      averagePriceTotal,
      averagePriceTotalDisplay: toCurrency(
        averagePriceTotal,
        position.currencyCode
      ),
      averagePriceDisplay,
      averagePriceTotalPercentage: 0, // This will be calculated after
      averagePriceTotalPercentageDisplay: "0%", // This will be calculated after
      currentPriceDisplay,
      currentPriceTotal,
      currentPriceTotalDisplay: toCurrency(
        currentPriceTotal,
        position.currencyCode
      ),
      currentPriceTotalPercentage: 0, // This will be calculated after
      currentPriceTotalPercentageDisplay: "0%", // This will be calculated after
      averageWithCurrentPriceDisplay: [
        averagePriceDisplay,
        currentPriceDisplay,
      ].join("/"),
      gainLoss: position.ppl,
      gainLossDisplay: toCurrency(position.ppl, currencyCode),
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

    // Calculate total invested in account currency
    const totalInvested = snapshot.positions.reduce(
      (sum, position) =>
        sum +
        snapshot.metadata.exchangeRates[
          parseCurrencyCode(position.currencyCode)
        ] *
          parseCurrencyValue(
            position.quantity * position.currentPrice,
            position.currencyCode
          ),
      0
    );

    // Map positions with UI properties and calculate percentages
    const positions = snapshot.positions.map((position) => {
      const { currencyCode } = account.metadata;

      const uiPosition = UIMapper.position(account, position);
      const dividends = dividendsByTicker.get(position.ticker) || 0;

      const portfolioPercentage =
        (uiPosition.currentPriceTotal / totalInvested) * 100 || 0;

      const roi = uiPosition.gainLoss + dividends;
      const roiInPositionCurrency =
        roi / snapshot.metadata.exchangeRates[currencyCode];
      const roiPercentage =
        (roiInPositionCurrency / uiPosition.averagePriceTotal) * 100 || 0;

      const gainLossInPositionCurrency =
        uiPosition.gainLoss / snapshot.metadata.exchangeRates[currencyCode];
      const gainLossPercentage =
        (gainLossInPositionCurrency / uiPosition.averagePriceTotal) * 100 || 0;

      return {
        ...uiPosition,
        dividends,
        dividendsDisplay: toCurrency(dividends, currencyCode),
        portfolioPercentage,
        portfolioPercentageDisplay: `${portfolioPercentage.toFixed(2)}%`,
        gainLossPercentage,
        gainLossPercentageDisplay: `${gainLossPercentage.toFixed(2)}%`,
        roi,
        roiDisplay: toCurrency(roi, currencyCode),
        roiPercentage,
        roiPercentageDisplay: `${roiPercentage.toFixed(2)}%`,
      };
    });

    return {
      ...snapshot,
      positions: orderBy(positions, ["companyName"], ["asc"]),
    };
  };
}
