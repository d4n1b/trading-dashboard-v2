import React from "react";
import invariant from "tiny-invariant";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { AccountSummary } from "@/components/account-summary";
import { DividendsList } from "@/components/dividends-list";
import { PositionsList } from "@/components/positions-list";
import { useAccountStore } from "@/store";
import {
  useGetAccountDividends,
  useGetAccountSnapshot,
} from "@/hooks/useApiService";

type TabValue = "portfolio" | "dividends";

export function DashboardSection() {
  const { accountSelected } = useAccountStore();
  const { data: dividends, isLoading: isDividendsLoading } =
    useGetAccountDividends();
  const { data: accountSnapshot, isLoading: isSnapshotLoading } =
    useGetAccountSnapshot({ dividends });

  const [tabSelected, setTabSelected] = React.useState<TabValue>("portfolio");

  invariant(accountSelected, "Missing accountSelected");

  if (isDividendsLoading || isSnapshotLoading) {
    return (
      <div className="flex items-center justify-center p-2">
        <div className="text-muted-foreground text-xs">
          Loading account summary...
        </div>
      </div>
    );
  }

  if (!accountSnapshot || !dividends?.length) {
    return null;
  }

  return (
    <div className="space-y-6">
      <AccountSummary
        account={accountSelected}
        accountSnapshot={accountSnapshot}
        dividends={dividends}
      />
      <Separator />
      <div>
        <Tabs
          defaultValue={tabSelected}
          onValueChange={(value) => setTabSelected(value as TabValue)}
        >
          <div className="flex justify-between">
            <p className="capitalize text-2xl">{tabSelected}</p>
            <TabsList>
              <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
              <TabsTrigger value="dividends">Dividends</TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="portfolio" className="mt-5 w-full">
            <PositionsList
              account={accountSelected}
              positions={accountSnapshot.positions}
            />
          </TabsContent>
          <TabsContent value="dividends" className="mt-5 w-full">
            <DividendsList account={accountSelected} dividends={dividends} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
