import { AddPrinter } from "@/components/AddPrinter";
import { PrinterCard } from "@/components/PrinterCard";
import { Input } from "@/components/ui/input";
import { useProfiles } from "@/context/ProfilesContext";
import { useEffect } from "react";

function Printers() {
  const { printers, markSetupDone } = useProfiles();
  console.log("the printers", printers);
  useEffect(() => {
    if (printers.length !== 0) {
      markSetupDone("printer");
    }
  }, [printers, markSetupDone]);
  return (
    <div className="flex flex-col w-full gap-4">
      <div className="bg-white w-full p-4 rounded-md ring-1 ring-foreground/10 flex justify-between">
        <Input
          type="text"
          placeholder="Filter printers by device name..."
          className="max-w-sm"
        />
        <AddPrinter />
      </div>

      <div className="flex flex-wrap gap-4">
        {printers.length == 0 ? (
          <PrinterCard printer={null} isSkeleton={true} />
        ) : (
          printers.map((printer) => (
            <PrinterCard
              key={printer.id}
              printer={printer}
              isSkeleton={false}
            />
          ))
        )}
      </div>
    </div>
  );
}

export default Printers;
