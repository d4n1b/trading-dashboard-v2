import React from "react";
import { Eye, Clock, PieChart, Coins } from "lucide-react";

import { toCurrency } from "@/utils/api";
import { useAppStore } from "@/store";
import { useGetAccountHistory } from "@/hooks/useApiService";

export function AccountSummary() {
  const { data: accountHistory, isLoading } = useGetAccountHistory();
  const { privacy, togglePrivacy } = useAppStore();

  const obfuscateValue = React.useCallback(
    (value: number, currency: string) => {
      if (!privacy) return toCurrency(value, currency);
      return "******";
    },
    [privacy]
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-2">
        <div className="text-muted-foreground text-xs">
          Loading account summary...
        </div>
      </div>
    );
  }

  if (!accountHistory?.length) {
    return null;
  }

  const latest = accountHistory[0];
  const { balance, metadata, timestamp } = latest;
  const currency = metadata.currencyCode;
  const pplPercentage = (balance.ppl / balance.invested) * 100;
  const isPositive = balance.ppl >= 0;

  return (
    <section className="w-full">
      <div className="flex items-center gap-2 text-2xl font-semibold">
        <Eye
          className={`h-5 w-5 cursor-pointer ${
            privacy ? "text-primary" : "text-muted-foreground"
          }`}
          onClick={togglePrivacy}
        />
        <span>{obfuscateValue(balance.total, currency)}</span>
      </div>
      <div className="flex flex-wrap gap-x-6 gap-y-1 mt-1 text-[15px]">
        <div className="flex flex-col min-w-[90px]">
          <span className="text-xs text-muted-foreground">Invested</span>
          <span className="font-medium">
            {obfuscateValue(balance.invested, currency)}
          </span>
        </div>
        <div className="flex flex-col min-w-[110px]">
          <span className="text-xs text-muted-foreground">Return</span>
          <span
            className={`font-medium ${
              isPositive ? "text-green-600" : "text-red-500"
            }`}
          >
            {obfuscateValue(balance.ppl, currency)}
            <span className="ml-1 text-xs font-normal">
              ({privacy ? "•••" : pplPercentage.toFixed(2)}%)
            </span>
          </span>
        </div>
        <div className="flex flex-col min-w-[90px]">
          <span className="text-xs text-muted-foreground">Free funds</span>
          <span className="font-medium text-green-600">
            {obfuscateValue(balance.free, currency)}
          </span>
        </div>
        <div className="flex flex-col min-w-[90px]">
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <PieChart className="h-3 w-3" />
            Positions
          </span>
          <span className="font-medium">
            {privacy ? "••" : metadata.totalPositions}
          </span>
        </div>
        <div className="flex flex-col min-w-[90px]">
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Coins className="h-3 w-3" />
            Dividends
          </span>
          <span className="font-medium">
            {obfuscateValue(metadata.totalDividends, currency)}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
        <Clock className="h-3.5 w-3.5" />
        <span>
          Synced at{" "}
          {new Date(timestamp).toLocaleString(undefined, {
            dateStyle: "medium",
            timeStyle: "short",
          })}
        </span>
      </div>
    </section>
  );
}
