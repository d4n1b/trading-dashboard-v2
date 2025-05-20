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

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { CompanyLogo } from "@/components/company-logo";
import { Button } from "@/components/ui/button";
import { UserAccountV2, SnapshotPositionItemUIV2 } from "@/types";
import { cn } from "@/lib/utils";

type PositionsListProps = {
  account: UserAccountV2;
  positions: SnapshotPositionItemUIV2[];
};

export function PositionsList({ positions }: PositionsListProps) {
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [sorting, setSorting] = React.useState<SortingState>([]);

  const columns = React.useState<
    ColumnDef<SnapshotPositionItemUIV2, unknown>[]
  >(() => [
    {
      accessorKey: "companyName",
      header: () => (
        <span className="text-xs font-bold uppercase">Company</span>
      ),
      cell: (ctx: CellContext<SnapshotPositionItemUIV2, unknown>) => {
        const row = ctx.row.original;
        return (
          <div className="flex min-w-0 gap-x-2">
            <CompanyLogo
              className="company-logo h-10 w-10 flex-none rounded-full bg-gray-50"
              ticker={row.ticker}
              internalTicker={row.internalTicker}
              alt={row.ticker}
            />
            <div className="font-medium">
              <div className="overflow-hidden text-ellipsis truncate max-w-64">
                {row.companyName}
              </div>
              <div className="flex-inline text-xs text-muted-foreground">
                <span>{row.ticker}</span>
                {row.type && (
                  <span>
                    {" • "}
                    {row.type}
                  </span>
                )}
                {row.countryOfOrigin && (
                  <span>
                    {" • "}
                    {row.countryOfOrigin}
                  </span>
                )}
              </div>
              <div className="flex-inline text-xs text-muted-foreground">
                {row.finvizLink && (
                  <Button asChild variant="link" size="xs" className="pl-0">
                    <a target="_blank" rel="noreferrer" href={row.finvizLink}>
                      finviz
                    </a>
                  </Button>
                )}
                {row.yahooLink && (
                  <Button asChild variant="link" size="xs" className="pl-0">
                    <a target="_blank" rel="noreferrer" href={row.yahooLink}>
                      yahoo
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "quantityDisplay",
      header: () => <span className="text-xs font-bold uppercase">QTY</span>,
      cell: (ctx: CellContext<SnapshotPositionItemUIV2, unknown>) => {
        const row = ctx.row.original;
        return <p className="text-right">{row.quantityDisplay}</p>;
      },
    },
    {
      accessorKey: "averageWithCurrentPriceDisplay",
      header: () => (
        <span className="text-xs font-bold uppercase">Avg/Mkt Price</span>
      ),
      cell: (ctx: CellContext<SnapshotPositionItemUIV2, unknown>) => {
        const row = ctx.row.original;
        return (
          <p className="text-right">{row.averageWithCurrentPriceDisplay}</p>
        );
      },
    },
    {
      accessorKey: "invested",
      header: () => (
        <span className="text-xs font-bold uppercase">Invested</span>
      ),
      cell: (ctx: CellContext<SnapshotPositionItemUIV2, unknown>) => {
        const row = ctx.row.original;
        return <p className="text-right">{row.investedDisplay}</p>;
      },
    },
    {
      accessorKey: "investedPercentage",
      header: () => (
        <span className="text-xs font-bold uppercase">Portfolio %</span>
      ),
      cell: (ctx: CellContext<SnapshotPositionItemUIV2, unknown>) => {
        const row = ctx.row.original;
        return <p className="text-right">{row.investedPercentageDisplay}</p>;
      },
    },
    {
      accessorKey: "dividendsDisplay",
      header: () => (
        <span className="text-xs font-bold uppercase">Dividends</span>
      ),
      cell: (ctx: CellContext<SnapshotPositionItemUIV2, unknown>) => {
        const row = ctx.row.original;
        return <p className="text-right">{row.dividendsDisplay}</p>;
      },
    },
    {
      accessorKey: "result",
      header: () => <span className="text-xs font-bold uppercase">Result</span>,
      cell: (ctx: CellContext<SnapshotPositionItemUIV2, unknown>) => {
        const row = ctx.row.original;
        return (
          <p
            className={cn(
              "text-right"
              // row.result >= 0 ? "text-green-600" : "text-red-600"
            )}
          >
            {row.resultDisplay}
          </p>
        );
      },
    },
  ])[0];

  const table = useReactTable({
    data: positions,
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
      row: TanstackRow<SnapshotPositionItemUIV2>,
      columnId: string,
      filterValue: string
    ) => {
      const v = String(row.getValue(columnId)).toLowerCase();
      return v.includes(filterValue.toLowerCase());
    },
  });

  if (!positions?.length) {
    return (
      <div className="text-xs text-muted-foreground p-2">
        No positions found.
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
            placeholder="Search position..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
          />
        </div>
      </div>
      <div className="overflow-x-auto rounded border">
        <Table>
          <TableHeader>
            {table
              .getHeaderGroups()
              .map((headerGroup: HeaderGroup<SnapshotPositionItemUIV2>) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map(
                    (header: Header<SnapshotPositionItemUIV2, unknown>) => (
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
              .rows.map((row: TanstackRow<SnapshotPositionItemUIV2>) => (
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
