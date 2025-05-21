import React from "react";
import { TableSkeleton } from "./table-skeleton";

export function DividendsListSkeleton({ className }: { className?: string }) {
  return <TableSkeleton className={className} rowCount={5} showSearch={true} />;
}
