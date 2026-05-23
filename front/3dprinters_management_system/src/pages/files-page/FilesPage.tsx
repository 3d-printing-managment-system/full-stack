import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { PrintModelFile } from "@/lib/types";
import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/data table component/DataTable";

import { useProfiles } from "@/context/ProfilesContext";
import { DeleteButton } from "@/components/DeleteButton";
import { useState } from "react";
import { formatSecondsToDuration } from "@/lib/utils";
import axios from "axios";
import { toast } from "sonner";

function FilesPage() {
  const location = useLocation();
  const { files, refreshParts } = useProfiles();

  const navigate = useNavigate();

  const columns: ColumnDef<PrintModelFile>[] = [
    {
      id: "select",
      header: ({ table }) => (
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
      ),
      cell: ({ row }) => (
        <Checkbox
          className=""
          checked={row.getIsSelected()}
          onCheckedChange={(value: boolean) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },

    // 🖼 Image
    {
      accessorKey: "image",
      header: "Image",
      cell: ({ row }) => {
        const image = row.original.image; // URL or base64

        return (
          <img
            src={`http://localhost:3000${image}`}
            alt="model"
            className="w-24 h-24 object-cover rounded-md border"
          />
        );
      },
    },

    // 🏷 Title
    {
      accessorKey: "title",
      header: "Title",
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("title")}</div>
      ),
    },

    // ⏱ Duration
    {
      accessorKey: "duration",
      header: "Duration",
      cell: ({ row }) => {
        const duration = Number(row.getValue("duration")); // e.g. in minutes

        return (
          <div className="font-medium">{formatSecondsToDuration(duration)}</div>
        );
      },
    },
    {
      accessorKey: "filamentUsed",
      header: "Filament Used",
      cell: ({ row }) => {
        const filament_used = Number(row.getValue("filamentUsed")); // e.g. in minutes

        return <div className="font-medium">{filament_used} g</div>;
      },
    },

    // 🔩 Nozzle Diameter
    {
      accessorKey: "nozzleDiameter",
      header: "Nozzle (mm)",
      cell: ({ row }) => {
        const nozzle = Number(row.getValue("nozzleDiameter"));

        return <div className="font-medium">{nozzle} mm</div>;
      },
    },

    // 📅 Date of Addition
    {
      accessorKey: "createdAt",
      header: "Date Added",
      cell: ({ row }) => {
        const date = row.getValue("createdAt") as string;

        return (
          <div className="font-medium">
            {new Date(date).toLocaleDateString()}
          </div>
        );
      },
    },

    // ⚙️ Actions (kept)
    {
      id: "actions",
      header: () => <div className="text-center">Actions</div>,
      cell: ({ row }) => {
        return (
          <div className="flex justify-center">
            <Button
              className=""
              variant="outline"
              onClick={() => {
                navigate("/files/printing-settings", {
                  state: { data: row.original },
                });

                console.log(row.original);
              }}
            >
              Add To Queue
            </Button>
          </div>
        );
      },
    },
  ];

  const [rowSelection, setRowSelection] = useState({});
  console.log(rowSelection);
  const handleDelete = async () => {
    const selectedIds = Object.keys(rowSelection);

    if (selectedIds.length === 0) return;

    try {
      const selectedTitles = files
        .filter((file) => selectedIds.includes(file.id))
        .map((file) => file.title);

      await axios.delete("http://localhost:3000/api/parts", {
        data: {
          ids: selectedIds,
        },
      });

      refreshParts();

      setRowSelection({});

      toast.success("Files deleted successfully");
    } catch (error: any) {
      console.error(error);

      toast.error("Failed to delete files", {
        description:
          error?.response?.data?.message ?? "An unexpected error occurred.",
      });
    }
  };

  return (
    <div className="container mx-auto mt-6 flex justify-center bg-white w-full p-4 rounded-md ring-1 ring-foreground/10 ring-1 ring-foreground/10 ">
      {location.pathname === "/files" && (
        <DataTable
          columns={columns}
          data={files}
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
            <Link to="/files/adding-part">Add New Part</Link>
          </Button>
        </DataTable>
      )}
      <Outlet />
    </div>
  );
}

export default FilesPage;
