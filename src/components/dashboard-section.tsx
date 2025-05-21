import React from "react";
import invariant from "tiny-invariant";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { AccountSummary } from "@/components/account-summary";
import { DividendsList } from "@/components/dividends-list";
import { PositionsList } from "@/components/positions-list";
import { SnapshotCalendar } from "@/components/snapshot-calendar";
import {
  AccountSummarySkeleton,
  PositionsListSkeleton,
  DividendsListSkeleton,
} from "@/components/skeletons";
import { useAccountStore } from "@/store";
import {
  useGetAccountDividends,
  useGetAccountSnapshot,
  useGetAccountSnapshots,
} from "@/hooks/useApiService";

type TabValue = "portfolio" | "dividends";

export function DashboardSection() {
  const { accountSelected } = useAccountStore();
  invariant(accountSelected, "Missing accountSelected");

  const [selectedDate, setSelectedDate] = React.useState<Date>();
  const { data: availableSnapshots } = useGetAccountSnapshots();

  const { data: dividends, isLoading: isDividendsLoading } =
    useGetAccountDividends();
  const { data: accountSnapshot, isLoading: isSnapshotLoading } =
    useGetAccountSnapshot({
      dividends,
      syncedOn: selectedDate?.toISOString(),
    });

  const [tabSelected, setTabSelected] = React.useState<TabValue>("portfolio");
  const isLoading = isDividendsLoading || isSnapshotLoading;

  // Set the initial date to the latest snapshot
  React.useEffect(() => {
    if (availableSnapshots?.length && !selectedDate) {
      setSelectedDate(availableSnapshots[0]);
    }
  }, [availableSnapshots, selectedDate]);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        {isLoading ? (
          <AccountSummarySkeleton />
        ) : (
          accountSnapshot &&
          dividends && (
            <AccountSummary
              account={accountSelected}
              accountSnapshot={accountSnapshot}
              dividends={dividends}
            />
          )
        )}
        <SnapshotCalendar
          selectedDate={selectedDate}
          onDateSelect={setSelectedDate}
        />
      </div>
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
          <TabsContent value="portfolio" className="mt-2 w-full">
            {isLoading ? (
              <PositionsListSkeleton className="mt-2" />
            ) : (
              accountSnapshot && (
                <PositionsList
                  account={accountSelected}
                  positions={accountSnapshot.positions}
                />
              )
            )}
          </TabsContent>
          <TabsContent value="dividends" className="mt-2 w-full">
            {isLoading ? (
              <DividendsListSkeleton className="mt-2" />
            ) : (
              dividends && (
                <DividendsList
                  account={accountSelected}
                  dividends={dividends}
                />
              )
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
