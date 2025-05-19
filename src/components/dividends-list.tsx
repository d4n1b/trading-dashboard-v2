import React from "react";
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
import { Search, ChevronDown, ChevronUp, ChevronsUpDown } from "lucide-react";

import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CompanyLogo } from "@/components/company-logo";
import { DividendItemUIV2, UserAccountV2 } from "@/types";
import { toCurrency, parseCurrencyCode } from "@/lib/currency";

type DividendsListProps = {
  account: UserAccountV2;
  dividends: DividendItemUIV2[];
};

export function DividendsList({ account, dividends }: DividendsListProps) {
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [sorting, setSorting] = React.useState<SortingState>([]);

  const columns = React.useMemo<ColumnDef<DividendItemUIV2, unknown>[]>(
    () => [
      {
        accessorKey: "companyName",
        header: () => <span className="font-bold">Company</span>,
        cell: (ctx: CellContext<DividendItemUIV2, unknown>) => {
          const row = ctx.row.original;
          return (
            <div className="flex min-w-0 gap-x-2">
              <CompanyLogo
                className="company-logo h-6 w-6 flex-none rounded-full bg-gray-50"
                ticker={row.ticker}
                internalTicker={row.internalTicker}
                alt={row.ticker}
              />
              <span className="flex items-center font-medium truncate">
                {row.companyName}
                <span className="text-xs text-muted-foreground ml-1">
                  ({row.ticker})
                </span>
              </span>
            </div>
          );
        },
      },
      {
        accessorKey: "paidOnDisplay",
        header: () => <span className="font-bold">Paid on</span>,
        cell: (ctx: CellContext<DividendItemUIV2, unknown>) => {
          const row = ctx.row.original;
          return <span>{row.paidOnDisplay}</span>;
        },
      },
      {
        accessorKey: "amountDisplay",
        header: () => <span className="font-bold">Amount</span>,
        cell: (ctx: CellContext<DividendItemUIV2, unknown>) => {
          const row = ctx.row.original;
          return <p className="text-right">{row.amountDisplay}</p>;
        },
      },
    ],
    []
  );

  const table = useReactTable({
    data: dividends || [],
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
      row: TanstackRow<DividendItemUIV2>,
      columnId: string,
      filterValue: string
    ) => {
      const v = String(row.getValue(columnId)).toLowerCase();
      return v.includes(filterValue.toLowerCase());
    },
  });

  // Calculate total amount for filtered rows
  const filteredTotal = React.useMemo(() => {
    const filteredRows = table.getFilteredRowModel().rows;
    const total = filteredRows.reduce(
      (sum, row) => sum + row.original.amount,
      0
    );

    if (filteredRows.length > 0) {
      const currencyCode = parseCurrencyCode(account.metadata.currencyCode);
      return toCurrency(total, currencyCode);
    }
    return "";
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account.metadata.currencyCode, globalFilter]);

  if (!dividends?.length) {
    return (
      <div className="text-xs text-muted-foreground p-2">
        No dividends found.
      </div>
    );
  }

  return (
    <section className="w-full">
      <div className="flex flex-col gap-2 mb-4 print:hidden">
        <div className="relative">
          <div className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 z-10 h-4 w-4">
            <Search className="h-4 w-4" />
          </div>
          <Input
            className="w-full max-w-xs border rounded pl-8 pr-2 py-1 text-sm bg-background"
            placeholder="Search dividend..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
          />
        </div>
        {globalFilter && filteredTotal && (
          <div className="text-sm">
            <span className="text-muted-foreground">Filtered total: </span>
            <span className="font-semibold">{filteredTotal}</span>
          </div>
        )}
      </div>
      <div className="overflow-x-auto rounded border bg-card">
        <Table>
          <TableHeader>
            {table
              .getHeaderGroups()
              .map((headerGroup: HeaderGroup<DividendItemUIV2>) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map(
                    (header: Header<DividendItemUIV2, unknown>) => (
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
                          <span className="flex h-4 w-4 items-center justify-center">
                            {header.column.getIsSorted() === "asc" && (
                              <ChevronDown className="self-start" />
                            )}
                            {header.column.getIsSorted() === "desc" && (
                              <ChevronUp className="self-end" />
                            )}
                            {!header.column.getIsSorted() && <ChevronsUpDown />}
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
              .rows.map((row: TanstackRow<DividendItemUIV2>) => (
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
