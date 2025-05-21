import React from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type TableSkeletonProps = {
  className?: string;
  rowCount?: number;
  showSearch?: boolean;
};

export function TableSkeleton({
  className,
  rowCount = 5,
  showSearch = true,
}: TableSkeletonProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {showSearch && (
        <div className="relative">
          <Skeleton className="w-full h-8 max-w-64" />
        </div>
      )}

      <div className="rounded-md border">
        <div className="grid grid-cols-6 gap-4 border-b bg-muted/50 p-4">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-20" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-28" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-12" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-20" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-24" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-20" />
          </div>
        </div>

        <div className="divide-y">
          {Array.from({ length: rowCount }).map((_, i) => (
            <div key={i} className="grid grid-cols-6 gap-4 p-4">
              <div className="flex items-center gap-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="space-y-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
              <div className="flex items-center">
                <Skeleton className="h-4 w-24" />
              </div>
              <div className="flex items-center">
                <Skeleton className="h-4 w-16" />
              </div>
              <div className="flex items-center">
                <Skeleton className="h-4 w-24" />
              </div>
              <div className="flex items-center">
                <Skeleton className="h-4 w-16" />
              </div>
              <div className="flex items-center">
                <Skeleton className="h-4 w-20" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
