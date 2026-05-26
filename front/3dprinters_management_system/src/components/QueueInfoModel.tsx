import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Info, Printer, Tag, ArrowRight, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

function QueueInfoModal() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <Info className="h-4 w-4" />
        </Button>
      </DialogTrigger>

      <DialogContent className="w-[50%] p-6">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <DialogTitle className="text-lg font-bold text-gray-800">
              How does the queue work?
            </DialogTitle>
          </div>
          <p className="text-sm text-gray-400 leading-relaxed">
            Jobs are added to the queue using one of two{" "}
            <span className="font-semibold" style={{ color: "#2B7FFF" }}>
              Printer Selection Modes
            </span>
            .
          </p>
        </DialogHeader>

        <div className="flex flex-col gap-4 pt-2">
          {/* Mode 1 */}
          <div
            className="flex gap-4 p-4 rounded-xl border"
            style={{ borderColor: "#2B7FFF30", backgroundColor: "#2B7FFF08" }}
          >
            <div
              className="p-2 rounded-lg h-fit"
              style={{ backgroundColor: "#2B7FFF15" }}
            >
              <Printer className="h-4 w-4" style={{ color: "#2B7FFF" }} />
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <p className="font-semibold text-sm text-gray-800">
                  Specific Printer
                </p>
                <span
                  className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: "#2B7FFF20", color: "#2B7FFF" }}
                >
                  MODE 1
                </span>
              </div>
              <p className="text-sm text-gray-500">
                The job is locked to one exact printer. It will only run on that
                printer regardless of what other printers are available.
              </p>
            </div>
          </div>

          {/* Mode 2 */}
          <div
            className="flex gap-4 p-6 rounded-xl border"
            style={{ borderColor: "#2B7FFF30", backgroundColor: "#2B7FFF08" }}
          >
            <div
              className="p-2 rounded-lg h-fit"
              style={{ backgroundColor: "#2B7FFF15" }}
            >
              <Tag className="h-4 w-4" style={{ color: "#2B7FFF" }} />
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <p className="font-semibold text-sm text-gray-800">
                  According to Tags
                </p>
                <span
                  className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: "#2B7FFF20", color: "#2B7FFF" }}
                >
                  MODE 2
                </span>
              </div>
              <p className="text-sm text-gray-500">
                The job is assigned to any printer matching the selected tags.
                The system picks the first available compatible printer
                automatically.
              </p>
            </div>
          </div>

          {/* Priority */}
          <div className="flex gap-4 p-4 rounded-xl border border-gray-200 bg-gray-50">
            <div className="p-2 rounded-lg h-fit bg-gray-200">
              <AlertCircle className="h-4 w-4 text-gray-600" />
            </div>
            <div className="flex flex-col gap-1">
              <p className="font-semibold text-sm text-gray-800">
                Priority Rule
              </p>
              <p className="text-sm text-gray-500">
                <span className="font-semibold" style={{ color: "#2B7FFF" }}>
                  Specific Printer
                </span>{" "}
                always takes priority over{" "}
                <span className="font-semibold text-gray-700">Tags</span>. If a
                printer belongs to a tag group but also has a job assigned
                directly to it, the specific job runs first.
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default QueueInfoModal;
