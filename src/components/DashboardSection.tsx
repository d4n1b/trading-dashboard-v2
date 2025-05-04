"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { AccountSummary } from "@/components/AccountSummary";
import { DividendsList } from "@/components/DividendsList";

export function DashboardSection() {
  return (
    <div className="space-y-6">
      <AccountSummary />
      <Separator />
      <div>
        <Tabs defaultValue="dividends">
          <TabsList className="flex self-end">
            <TabsTrigger value="investments">Investments</TabsTrigger>
            <TabsTrigger value="dividends">Dividends</TabsTrigger>
          </TabsList>
          <TabsContent value="investments" className="mt-4 w-full">
            <div className="rounded border p-4">
              <h2 className="text-lg font-semibold">Investments Overview</h2>
              <p className="text-sm text-muted-foreground">
                View and manage your investment portfolio
              </p>
            </div>
          </TabsContent>
          <TabsContent value="dividends" className="mt-4 w-full">
            <DividendsList />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
