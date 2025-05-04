import React from "react";

import { useGetUserAccounts } from "@/hooks/useApiService";
import { useAppStore } from "@/store";

type AccountProviderProps = React.PropsWithChildren;

export function AccountProvider({ children }: AccountProviderProps) {
  const { data: accounts, isLoading } = useGetUserAccounts();
  const { setAccountId, accountIdSelected } = useAppStore();

  React.useEffect(() => {
    if (accounts && accounts.length > 0 && !accountIdSelected) {
      setAccountId(accounts[0].id);
    }
  }, [accounts, setAccountId, accountIdSelected]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-semibold">Loading accounts...</div>
        </div>
      </div>
    );
  }

  if (!isLoading && (!accounts || accounts.length === 0)) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-semibold text-red-600">
            No accounts available
          </div>
          <p className="mt-2 text-gray-600">
            Please contact support if this is unexpected.
          </p>
        </div>
      </div>
    );
  }

  if (!accountIdSelected) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-semibold">Loading account data...</div>
        </div>
      </div>
    );
  }

  return children;
}
