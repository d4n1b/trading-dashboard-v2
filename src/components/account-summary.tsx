import React from "react";
import { Eye, Clock, PieChart, Coins } from "lucide-react";

import { usePrivacyStore } from "@/store";
import { cn, getValueTrendClassName } from "@/lib/utils";
import { AccountSnapshotV2, DividendItemUIV2, UserAccountV2 } from "@/types";
import { toCurrency } from "@/lib/currency";

export type AccountSummaryProps = {
  account: UserAccountV2;
  accountSnapshot: AccountSnapshotV2;
  dividends: DividendItemUIV2[];
};

export function AccountSummary({
  account,
  accountSnapshot,
  dividends,
}: AccountSummaryProps) {
  const { privacy, togglePrivacy } = usePrivacyStore();

  const totalDividends = React.useMemo(() => {
    return dividends
      ? dividends.reduce((total, dividend) => total + dividend.amount, 0)
      : 0;
  }, [dividends]);

  const obfuscateValue = React.useCallback(
    (value: number, currency: string) => {
      if (privacy) return "••••••";
      return typeof value === "number" ? toCurrency(value, currency) : "-";
    },
    [privacy]
  );

  const { currencyCode } = account.metadata;
  const { balance, syncedOn, positions } = accountSnapshot;
  const pplPercentage = (balance.ppl / balance.invested) * 100;

  return (
    <section className="w-full">
      <div className="flex items-center gap-2 text-2xl font-semibold">
        <Eye
          className={cn(
            "h-5 w-5 cursor-pointer",
            privacy ? "text-primary" : "text-muted-foreground"
          )}
          onClick={togglePrivacy}
        />
        <p>{obfuscateValue(balance.total, currencyCode)}</p>
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-[15px]">
        <div className="flex flex-col min-w-24">
          <span className="text-xs text-muted-foreground">Invested</span>
          <span className="font-medium">
            {obfuscateValue(balance.invested, currencyCode)}
          </span>
        </div>
        <div className="flex flex-col min-w-[110px]">
          <span className="text-xs text-muted-foreground">Return</span>
          <span
            className={cn("font-medium", getValueTrendClassName(balance.ppl))}
          >
            {obfuscateValue(balance.ppl, currencyCode)}
            <span className="ml-1 text-xs font-normal">
              ({privacy ? "•••" : pplPercentage.toFixed(2)}%)
            </span>
          </span>
        </div>
        <div className="flex flex-col min-w-24">
          <span className="text-xs text-muted-foreground">Free funds</span>
          <span className="font-medium text-green-600">
            {obfuscateValue(balance.free, currencyCode)}
          </span>
        </div>
        <div className="flex flex-col min-w-24">
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Coins className="h-3 w-3" />
            Dividends
          </span>
          <span className="font-medium text-green-600">
            {obfuscateValue(totalDividends, currencyCode)}
          </span>
        </div>
        <div className="flex flex-col min-w-24">
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <PieChart className="h-3 w-3" />
            Positions
          </span>
          <span className="font-medium">
            {privacy ? "••" : positions.length}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
        <Clock className="h-3.5 w-3.5" />
        <span>
          Synced at{" "}
          {new Date(syncedOn).toLocaleString(undefined, {
            dateStyle: "medium",
            timeStyle: "short",
          })}
        </span>
      </div>
    </section>
  );
}
