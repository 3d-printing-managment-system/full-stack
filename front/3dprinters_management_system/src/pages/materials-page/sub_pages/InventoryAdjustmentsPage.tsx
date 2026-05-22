import { DataTable } from "@/components/data table component/DataTable";
import { Button } from "@/components/ui/button";
import { useProfiles } from "@/context/ProfilesContext";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { formatToDMY, getProfileCostPerKgReduction, transformInventoryToAdjustments } from "@/lib/utils";
import { Adjustment } from "@/lib/types";
import { DeleteButton } from "@/components/DeleteButton";
import { useState } from "react";

function InventoryAdjustmentsPage() {
  const { profiles, inventory, deleteInventoryItems } = useProfiles();
  const [rowSelection, setRowSelection] = useState({});

  // console.log(inventory);

  // joining between profiles and inventory
 const invData = transformInventoryToAdjustments(inventory, profiles);

  const columns: ColumnDef<Adjustment>[] = [
    // select field
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          className=""
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          className=""
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },

    // filament profile field
    {
      id: "filament_profile",
      header: "Material",
      cell: ({ row }) => {
        const color = row.original.material_profile.color;
        const name = row.original.material_profile.name;
        const material = row.original.material_profile.material;
        const roleSize = row.original.material_profile.roleSize;
        // console.log(row);

        return (
          <div className="flex items-center gap-2 ">
            <div
              className="w-6 h-6 rounded-md border"
              style={{ backgroundColor: color }}
            />
            <div className="flex flex-col">
              <div className="font-medium">{name}</div>
              <div className="flex gap-1  text-gray-400">
                <div>{material}</div>
                <Separator className="" orientation="vertical" />
                <div>{roleSize}kg</div>
              </div>
            </div>
          </div>
        );
      },
      filterFn: (row, id, filterValue) => {
        const { color, name, material, roleSize } =
          row.original.material_profile;
        const combined =
          `${color} ${name} ${material} ${roleSize}`.toLowerCase();
        return combined.includes((filterValue as string).toLowerCase());
      },
    },

    // order number
    {
      accessorKey: "orderNumber",
      header: "Order Number",
    },
    // order number
    {
      accessorKey: "updateType",
      header: "Update Type",
    },
    //total cost
    {
      accessorKey: "totalCost",
      header: "Total Cost ($)",
      cell: ({ row }) => {
        const type = row.original.updateType;
        let total = Number(row.original.totalCost);
        if (type == "REDUCTION") {
          const name = row.original.material_profile.name;
          const cost = getProfileCostPerKgReduction(name, invData);
          const qty = Number(row.original.quantity);
          total = cost * qty;
        }

        return <div className="font-medium">${total}</div>;
      },
    },

    // cost per kilo
    {
      accessorKey: "cost_per_kg",
      header: "Cost ($)/kg",
      cell: ({ row }) => {
        let cost = row.original.cost_per_kg;
        const type = row.original.updateType;
        if (type == "REDUCTION") {
          const name = row.original.material_profile.name;
          cost = getProfileCostPerKgReduction(name, invData);
        }

        return <div className="font-medium">${cost}</div>;
      },
    },

    //quantity
    {
      accessorKey: "quantity",
      header: "Quantity (kg)",
      cell: ({ row }) => {
        return <div className="font-medium">{row.getValue("quantity")} kg</div>;
      },
    },

    // date
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ row }) => {
        const date = row.getValue("date") as string;
        return <div className="font-medium">{formatToDMY(date)}</div>;
      },
    },

    // action button
    {
      id: "actions",
      cell: ({ row }) => {
        const payment = row.original;

        return (
          <div className="flex justify-end">
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
                  inset={false}
                  onClick={() =>
                    navigate(
                      `/materials/inventory-adjustments/edit/${row.original.orderNumber}`,
                    )
                  }
                >
                  Edit
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];

  const navigate = useNavigate();

  const location = useLocation();
  const isInventoryAdjustement = location.pathname.endsWith(
    "/inventory-adjustments",
  );
  console.log(rowSelection);
  const handleDelete = () => {
    const selectedIds = Object.keys(rowSelection);
    deleteInventoryItems(selectedIds);
    setRowSelection({});
  };

  return (
    <div className="bg-white w-full p-4 rounded-md ring-1 ring-foreground/10 ring-1 ring-foreground/10">
      {isInventoryAdjustement && (
        <DataTable
          columns={columns}
          data={invData}
          rowSelection={rowSelection}
          onRowSelectionChange={setRowSelection}
          getRowId={(row) => row.orderNumber}
        >
          <DeleteButton onDelete={handleDelete}>
            <Button
              className=""
              variant={
                Object.keys(rowSelection).length === 0
                  ? "inactive"
                  : "destructive"
              }
            >
              Delete
            </Button>
          </DeleteButton>

          <Button variant="default" className="ml-auto">
            <Link to="/materials/inventory-adjustments/update-stock">
              Update Filament Stock
            </Link>
          </Button>
        </DataTable>
      )}

      <Outlet />
    </div>
  );
}

export default InventoryAdjustmentsPage;
