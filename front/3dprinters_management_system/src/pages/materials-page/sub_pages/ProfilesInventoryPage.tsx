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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { calculateStock, getProfileCostPerKg } from "@/lib/utils";
import { Profile } from "@/lib/types";
import { DeleteButton } from "@/components/DeleteButton";
import { useState } from "react";

// const data = ;
function ProfilesInventoryPage() {
  const { profiles, inventory, deleteProfiles } = useProfiles();
  console.log("profiles", profiles);
  console.log("inventory", inventory);

  const location = useLocation();
  const isProfilesInventory = location.pathname.endsWith("/profiles-inventory");

  const profilesWithCostandInventory = profiles.map((profile) => {
    const cost = getProfileCostPerKg(profile.id, inventory);
    return {
      ...profile,
      inventoryQuantity: calculateStock(profile.inventory),
      cost_per_kg: cost,
    };
  });
  console.log("heheheh", profilesWithCostandInventory);
  const [rowSelection, setRowSelection] = useState({});

  const navigate = useNavigate();

  const columns: ColumnDef<Profile>[] = [
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
    {
      accessorKey: "id",
      header: "Profile ID",
    },

    // filament profile field
    {
      id: "filament_profile",
      header: "Filament Profile",
      cell: ({ row }) => {
        const color = row.original.color;
        const profile = row.original.name;
        console.log(row);

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
      filterFn: (row, filterValue) => {
        const { material, name } = row.original;
        const combined = `${material} ${name}`.toLowerCase();
        return combined.includes((filterValue as string).toLowerCase());
      },
    },

    // materials field
    {
      accessorKey: "material",
      header: "Material",
    },

    // cost per kg
    {
      accessorKey: "cost_per_kg",
      header: "Cost per kg",
      cell: ({ row }) => {
        return (
          <div className="font-medium">${row.getValue("cost_per_kg")}</div>
        );
      },
    },

    // current value field
    {
      accessorKey: "current_value",
      header: "Current Value ($)",
      cell: ({ row }) => {
        const inventory = Number(row.getValue("inventoryQuantity") ?? 0);
        const cost = Number(row.getValue("cost_per_kg") ?? 0);
        // console.log(inventory);
        // console.log(cost);
        const total = inventory * cost;

        return <div className="font-medium">${total}</div>;
      },
    },

    {
      accessorKey: "roleSize",
      header: "Role Size",
      cell: ({ row }) => {
        return <div className="font-medium">{row.getValue("roleSize")} kg</div>;
      },
    },

    // inventory
    {
      accessorKey: "inventoryQuantity",
      header: "Inventory",
      cell: ({ row }) => {
        return (
          <div className="font-medium">
            {row.getValue("inventoryQuantity")} kg
          </div>
        );
      },
    },

    // action button
    {
      id: "actions",
      cell: ({ row }) => {
        const profile = row.original;

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
                      `/materials/profiles-inventory/edit/${row.original.id}`,
                    )
                  }
                >
                  Edit
                </DropdownMenuItem>
                {/* <DropdownMenuSeparator className="" /> */}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];

  const handleDelete = () => {
    const selectedIds = Object.keys(rowSelection);
    deleteProfiles(selectedIds);
    setRowSelection({});
  };

  return (
    <div className="bg-white w-full p-4 rounded-md ring-1 ring-foreground/10">
      {isProfilesInventory && (
        <DataTable
          columns={columns}
          data={profilesWithCostandInventory}
          rowSelection={rowSelection}
          onRowSelectionChange={setRowSelection}
          getRowId={(row) => row.id}
        >
          <DeleteButton onDelete={handleDelete}>
            <Button
              className=""
              disabled={Object.keys(rowSelection).length === 0}
              variant={
                Object.keys(rowSelection).length === 0
                  ? "inactive"
                  : "destructive"
              }
            >
              Delete
            </Button>
          </DeleteButton>

          <Button variant="default" className="ml-auto" asChild>
            <Link to="/materials/profiles-inventory/create">
              Create Filament Profile
            </Link>
          </Button>
        </DataTable>
      )}

      <Outlet />
    </div>
  );
}

export default ProfilesInventoryPage;
