"use client";

import { Header } from "@/components/Header";
import { DashboardSection } from "@/components/DashboardSection";
import { SessionProvider } from "@/providers/SessionProvider";
import { AccountProvider } from "@/providers/AccountProvider";

export default function Home() {
  return (
    <SessionProvider>
      <AccountProvider>
        <div className="min-h-full">
          <Header />
          <div className="mx-auto max-w-7xl p-8">
            <DashboardSection />
          </div>
        </div>
      </AccountProvider>
    </SessionProvider>
  );
}
