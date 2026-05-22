import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
type AddPrinterProps = {
  className?: string;
};

export function AddPrinter({ className }: AddPrinterProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="default" className={`bg-blue-500 ${className}`}>
          Add Printer
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md p-6" showCloseButton={false}>
        <DialogHeader className="mb-2">
          <DialogTitle className="text-xl">Add Printer</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-2 text-center items-center border-2 rounded-md border-dashed p-6">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
            role="img"
            className="mb-3 iconify iconify--mdi"
            width="3em"
            height="3em"
            viewBox="0 0 24 24"
          >
            <path
              fill="currentColor"
              d="M4 1c-1.11 0-2 .89-2 2v4c0 1.11.89 2 2 2H1v2h12V9h-3c1.11 0 2-.89 2-2V3c0-1.11-.89-2-2-2zm0 2h6v4H4zM3 13v7h7v-2H5v-5zm11 0c-1.11 0-2 .89-2 2v4c0 1.11.89 2 2 2h-3v2h12v-2h-3c1.11 0 2-.89 2-2v-4c0-1.11-.89-2-2-2zm0 2h6v4h-6z"
            ></path>
          </svg>
          <p className="text-lg font-semibold">Lan Connection</p>
          <p>
            Full control with real-time status and camera streaming. Simply
            connect your printer using the ESP32, and it will be automatically
            detected by the system.
          </p>
        </div>
        <DialogFooter className="sm:justify-end p-0">
          <DialogClose asChild>
            <Button type="button" className="bg-blue-500 min-w-[150px]">
              Okey
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
