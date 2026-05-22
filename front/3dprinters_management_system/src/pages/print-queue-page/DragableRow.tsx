import { TableCell, TableRow } from "@/components/ui/table";
import { QueueFile } from "@/lib/types";
import { useSortable } from "@dnd-kit/sortable";
import { flexRender, Row } from "@tanstack/react-table";
import { CSS as DndCSS } from "@dnd-kit/utilities";
import { DragHandle } from "./DragHandle";

export function DraggableRow({ row }: { row: Row<QueueFile> }) {
  const {
    transform,
    transition,
    setNodeRef,
    isDragging,
    attributes,
    listeners,
  } = useSortable({ id: row.original.id });

  return (
    <TableRow
      ref={setNodeRef}
      data-dragging={isDragging}
      className="relative z-0 data-[dragging=true]:z-10 data-[dragging=true]:opacity-80"
      style={{ transform: DndCSS.Transform.toString(transform), transition }}
    >
      {row.getVisibleCells().map((cell) => (
        <TableCell key={cell.id} className="">
          {cell.column.id === "drag" ? (
            <DragHandle attributes={attributes} listeners={listeners} />
          ) : (
            flexRender(cell.column.columnDef.cell, cell.getContext())
          )}
        </TableCell>
      ))}
    </TableRow>
  );
}
