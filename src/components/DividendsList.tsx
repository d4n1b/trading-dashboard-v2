import { useState, useMemo } from "react";

import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  ColumnDef,
  SortingState,
  CellContext,
  Row as TanstackRow,
  HeaderGroup,
  Header,
} from "@tanstack/react-table";
import { ChevronDown, ChevronUp } from "lucide-react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";

import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useGetAccountDividends } from "@/hooks/useApiService";
import { DividendItemV2 } from "@/types.v2";

export function DividendsList() {
  const { data = [], isLoading, error } = useGetAccountDividends();

  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);

  const columns = useMemo<ColumnDef<DividendItemV2, unknown>[]>(
    () => [
      {
        accessorKey: "companyName",
        header: () => <span>Company</span>,
        cell: (ctx: CellContext<DividendItemV2, unknown>) => {
          const row = ctx.row.original;
          return (
            <span className="font-medium truncate">
              {row.companyName}
              <span className="text-xs text-muted-foreground ml-1">
                ({row.ticker})
              </span>
            </span>
          );
        },
      },
      {
        accessorKey: "paidOn",
        header: () => <span>Date</span>,
        cell: (ctx: CellContext<DividendItemV2, unknown>) => (
          <span className="text-muted-foreground">
            {new Date(ctx.getValue() as string).toLocaleDateString()}
          </span>
        ),
      },
      {
        accessorKey: "amount",
        header: () => <span>Amount</span>,
        cell: (ctx: CellContext<DividendItemV2, unknown>) => {
          const row = ctx.row.original;
          return (
            <span className="font-semibold">
              {row.amount.toFixed(2)}
              <span className="ml-1 text-muted-foreground">{row.currency}</span>
            </span>
          );
        },
      },
    ],
    []
  );

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      globalFilter,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    globalFilterFn: (
      row: TanstackRow<DividendItemV2>,
      columnId: string,
      filterValue: string
    ) => {
      const v = String(row.getValue(columnId)).toLowerCase();
      return v.includes(filterValue.toLowerCase());
    },
  });

  if (isLoading) {
    return (
      <div className="text-xs text-muted-foreground p-2">
        Loading dividends...
      </div>
    );
  }
  if (error) {
    return (
      <div className="text-xs text-red-500 p-2">Failed to load dividends.</div>
    );
  }
  if (!data?.length) {
    return (
      <div className="text-xs text-muted-foreground p-2">
        No dividends found.
      </div>
    );
  }

  return (
    <section className="w-full mt-4">
      <div className="flex mb-2 relative print:hidden">
        <div className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 z-10 h-4 w-4">
          <MagnifyingGlassIcon />
        </div>
        <Input
          className="w-full max-w-xs border rounded pl-8 pr-2 py-1 text-sm bg-background"
          placeholder="Search..."
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
        />
      </div>
      <div className="overflow-x-auto rounded border bg-card">
        <Table>
          <TableHeader>
            {table
              .getHeaderGroups()
              .map((headerGroup: HeaderGroup<DividendItemV2>) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map(
                    (header: Header<DividendItemV2, unknown>) => (
                      <TableHead
                        key={header.id}
                        className="cursor-pointer select-none p-3"
                        onClick={
                          header.column.getCanSort()
                            ? header.column.getToggleSortingHandler()
                            : undefined
                        }
                      >
                        <span className="flex items-center">
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                          <span className="inline-flex items-center h-4 w-4">
                            {header.column.getIsSorted() === "asc" && (
                              <ChevronUp />
                            )}
                            {header.column.getIsSorted() === "desc" && (
                              <ChevronDown />
                            )}
                          </span>
                        </span>
                      </TableHead>
                    )
                  )}
                </TableRow>
              ))}
          </TableHeader>
          <TableBody>
            {table
              .getRowModel()
              .rows.map((row: TanstackRow<DividendItemV2>) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="p-3">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>
    </section>
  );
}
