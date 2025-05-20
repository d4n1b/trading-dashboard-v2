"use client";

import { Header } from "@/components/header";
import { DashboardSection } from "@/components/dashboard-section";
import { SessionProvider } from "@/providers/SessionProvider";
import { AccountProvider } from "@/providers/AccountProvider";

export default function Home() {
  return (
    <SessionProvider>
      <div className="min-h-full bg-orange-100">
        <Header />
        <AccountProvider>
          <div className="mx-auto max-w-7xl p-8">
            <DashboardSection />
          </div>
        </AccountProvider>
      </div>
    </SessionProvider>
  );
}
