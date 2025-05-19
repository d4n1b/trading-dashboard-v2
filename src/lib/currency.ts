// export function getReturnTrend(
//   instrument: InstrumentApiResponseData
// ): Instrument["returnTrend"] {
//   if (instrument.averagePrice === instrument.currentPrice) {
//     return 0;
//   }

//   return instrument.currentPrice > instrument.averagePrice ? 1 : -1;
// }

export function toCurrency(value: number, currency: string) {
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  // Move the currency symbol to the end to help sorting CSV columns
  const formattedValue = formatter.format(value);
  const parts = formatter.formatToParts(value);
  const currencySymbol =
    parts.find((part) => part.type === "currency")?.value || currency;
  const amount = formattedValue.replace(currencySymbol, "").trim();

  return `${amount}${currencySymbol}`;
}

export function isCurrencyGBX(currency: string): boolean {
  return currency === "GBX";
}

export function parseCurrencyCode(currency: string): string {
  return isCurrencyGBX(currency) ? "GBP" : currency;
}

export function parseCurrencyValue(value: number, currency: string): number {
  if (isCurrencyGBX(currency)) {
    return value / 100;
  }

  return value;
}
