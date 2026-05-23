"use client";

import * as React from "react";
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type UniqueIdentifier,
} from "@dnd-kit/core";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { IconChevronDown } from "@tabler/icons-react";
import {
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
} from "@tanstack/react-table";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MoreHorizontal } from "lucide-react";
import { DraggableRow } from "@/pages/print-queue-page/DragableRow";
import { QueueFile } from "@/lib/types";
import { DataTablePagination } from "./data-table-pagination";
import { Input } from "../ui/input";
import { FilterButtons } from "../FilterButtons";
import { formatSecondsToDuration } from "@/lib/utils";
import axios from "axios";
import { useProfiles } from "@/context/ProfilesContext";
import { Separator } from "../ui/separator";

export function DataTableDragable({
  data: initialData,
}: {
  data: QueueFile[];
}) {
  const [data, setData] = React.useState<QueueFile[]>([]);
  const { handleCancelJob, printers } = useProfiles();

  const printerMap = Object.fromEntries(
    printers.map((printer) => [printer.id, printer]),
  );
  const originalData = React.useRef<QueueFile[]>([]);
  console.log("the data fo teh print queu", data);

  React.useEffect(() => {
    setData(initialData);
    originalData.current = initialData;
  }, [initialData]);
  const [filterKey, setFilterKey] = React.useState<string | null>(null);
  // console.log("here is the data", data);
  React.useEffect(() => {
    if (!filterKey) {
      setData(originalData.current);
    } else {
      setData(originalData.current.filter((job) => job.status === filterKey));
    }
  }, [filterKey]);
  React.useState<QueueFile[]>(initialData);

  const columns: ColumnDef<QueueFile>[] = [
    {
      id: "drag",
      header: () => null,
      cell: () => null, // DraggableRow renders the handle directly
    },
    {
      id: "select",
      header: ({ table }) => (
        <div className="flex items-center justify-center">
          <Checkbox
            className=""
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value: boolean) =>
              table.toggleAllPageRowsSelected(!!value)
            }
            aria-label="Select all"
          />
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex items-center justify-center">
          <Checkbox
            className=""
            checked={row.getIsSelected()}
            onCheckedChange={(value: boolean) => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
    },

    {
      accessorKey: "image",
      header: "Image",
      cell: ({ row }) => (
        <img
          src={`http://localhost:3000${row.original.part.image}`}
          alt="model"
          className="w-24 h-24 object-cover rounded-md border"
        />
      ),
    },

    {
      accessorKey: "title",
      header: "Title",
      cell: ({ row }) => (
        <div className="font-medium">{row.original.part.title}</div>
      ),
    },
    {
      accessorKey: "printerSelectionMode",
      header: "Printer Selection Mode",
      cell: ({ row }) => (
        <div className="font-medium">{row.original.printerSelectionMode}</div>
      ),
    },
    {
      accessorKey: "profile",
      header: "Filament Profile",
      cell: ({ row }) => {
        const color = row.original.profile.color;
        const profile = row.original.profile.name;
        // console.log(row);

        return (
          <div className="flex items-center gap-2 ">
            <div
              className="w-6 h-6 rounded-md border"
              style={{ backgroundColor: color }}
            />
            <div className="text-right font-medium">{profile}</div>
          </div>
        );
      },
    },

    {
      accessorKey: "matched_printer",
      header: "Matched Printer",
      cell: ({ row }) => {
        const printer = row.original.printerId
          ? printerMap[row.original.printerId]
          : null;

        if (!printer) {
          return <div className="text-muted-foreground">Not yet</div>;
        }

        return (
          <div className="flex flex-col">
            <div className="font-medium">{printer.name}</div>

            <div className="flex gap-1 text-gray-400 text-sm">
              <div>{printer.printerType}</div>

              <Separator orientation="vertical" className="" />

              <div>{printer.model}</div>

              <Separator orientation="vertical" className="" />

              <div>{printer.nozzleDiameter}mm</div>
            </div>
          </div>
        );
      },
    },

    {
      accessorKey: "estimatedTime",
      header: "Estimated Time",
      cell: ({ row }) => (
        <div className="font-medium">
          {formatSecondsToDuration(row.original.estimatedTime)}
        </div>
      ),
    },
    {
      accessorKey: "progress",
      header: "Progress",
      cell: ({ row }) => (
        <div className="font-medium">{row.original.progress}%</div>
      ),
    },
    {
      accessorKey: "state",
      header: "State",
      cell: ({ row }) => {
        const colors: Record<QueueFile["status"], string> = {
          QUEUED: "bg-blue-100 text-blue-700",
          PRINTING: "bg-yellow-100 text-yellow-700",
          PAUSED: "bg-orange-100 text-orange-700",
          DONE: "bg-green-100 text-green-700",
          FAILED: "bg-red-100 text-red-700",
          CANCELLED: "bg-gray-100 text-gray-600",
        };
        const state = row.original.status;
        return (
          <Badge
            variant="outline"
            className={`p-4 text-muted-foreground ${colors[state]}`}
          >
            {state}
          </Badge>
        );
      },
    },

    {
      accessorKey: "createdAt",
      header: "Date Added",
      cell: ({ row }) => (
        <div className="text-gray-600">
          {new Date(row.getValue("createdAt")).toLocaleDateString()}
        </div>
      ),
    },

    {
      id: "actions",
      header: () => <div className="text-center">Actions</div>,
      cell: ({ row }) => (
        <div className="flex justify-center ">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="">
              <DropdownMenuLabel className="" inset={false}>
                Actions
              </DropdownMenuLabel>
              <DropdownMenuItem
                className=""
                inset=""
                onClick={() =>
                  row.original.status !== "CANCELLED" &&
                  handleCancelJob(row.original.id)
                }
              >
                Cancel
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 5,
  });
  const sortableId = React.useId();
  // console.log("theses are the sortable ids", sortableId);
  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {}),
  );

  const dataIds = React.useMemo<UniqueIdentifier[]>(
    () => data?.map(({ id }) => id) || [],
    [data],
  );

  const table = useReactTable<QueueFile>({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      pagination,
    },
    getRowId: (row) => row.id,
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (active && over && active.id !== over.id) {
      setData((data) => {
        const oldIndex = dataIds.indexOf(active.id);
        const newIndex = dataIds.indexOf(over.id);

        const newData = arrayMove(data, oldIndex, newIndex);

        console.log(
          "New order:",
          newData.map((item) => item.id),
        );

        return newData;
      });
    }
  }
  const handleStartProcessing = async () => {
    try {
      const response = await axios.post(
        "http://localhost:3000/api/queue/process",
      );

      console.log(response.data);
    } catch (error) {
      console.error("Failed to start processing:", error);
    }
  };

  return (
    <div>
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2 justify-between ">
          <div className="flex items-center gap-4">
            <Input
              type="text"
              placeholder="Filter filament profiles..."
              className="max-w-sm"
            />
            <FilterButtons
              selectedKey={filterKey}
              filterKeys={[
                "QUEUED",
                "PRINTING",
                "PAUSED",
                "DONE",
                "FAILED",
                "CANCELLED",
              ]}
              onFilterChange={setFilterKey}
            />
          </div>

          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="">
                  <span className="hidden lg:inline">Customize Columns</span>
                  <span className="lg:hidden">Columns</span>
                  <IconChevronDown />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {table
                  .getAllColumns()
                  .filter(
                    (column) =>
                      typeof column.accessorFn !== "undefined" &&
                      column.getCanHide(),
                  )
                  .map((column) => {
                    return (
                      <DropdownMenuCheckboxItem
                        inset=""
                        key={column.id}
                        className="capitalize"
                        checked={column.getIsVisible()}
                        onCheckedChange={(value: boolean) =>
                          column.toggleVisibility(!!value)
                        }
                      >
                        {column.id}
                      </DropdownMenuCheckboxItem>
                    );
                  })}
              </DropdownMenuContent>
            </DropdownMenu>
            <Button className="" onClick={handleStartProcessing}>
              Start Processing
            </Button>
          </div>
        </div>
        <div className="overflow-hidden rounded-lg border">
          <DndContext
            collisionDetection={closestCenter}
            modifiers={[restrictToVerticalAxis]}
            onDragEnd={handleDragEnd}
            sensors={sensors}
            id={sortableId}
          >
            <Table className="">
              <TableHeader className="sticky top-0 z-10 bg-muted">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id} className="">
                    {headerGroup.headers.map((header) => {
                      return (
                        <TableHead
                          key={header.id}
                          colSpan={header.colSpan}
                          className=""
                        >
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext(),
                              )}
                        </TableHead>
                      );
                    })}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody className="**:data-[slot=table-cell]:first:w-8">
                {table.getRowModel().rows?.length ? (
                  <SortableContext
                    items={dataIds}
                    strategy={verticalListSortingStrategy}
                  >
                    {table.getRowModel().rows.map((row) => (
                      <DraggableRow key={row.id} row={row} />
                    ))}
                  </SortableContext>
                ) : (
                  <TableRow className="">
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center"
                    >
                      No results.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </DndContext>
        </div>
      </div>

      <DataTablePagination table={table} />
    </div>
  );
}
