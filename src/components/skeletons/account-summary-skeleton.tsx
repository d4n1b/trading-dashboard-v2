import React from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function AccountSummarySkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("w-full space-y-2", className)}>
      <div className="flex items-center gap-4">
        <Skeleton className="h-7 w-32" />
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
        <Skeleton className="h-7 min-w-24" />
        <Skeleton className="h-7 min-w-24" />
        <Skeleton className="h-7 min-w-24" />
        <Skeleton className="h-7 min-w-24" />
      </div>
      <div className="flex items-center gap-4">
        <Skeleton className="h-4 w-32" />
      </div>
    </div>
  );
}
