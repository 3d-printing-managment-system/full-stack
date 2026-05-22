import {
  Layers,
  ClipboardList,
  Upload,
  Printer,
  Play,
  Bookmark,
  ArrowRight,
  Check,
  CircleDashed,
} from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "./ui/button";
import { useProfiles } from "@/context/ProfilesContext";
import { StepKey } from "@/lib/types";

export function WelcomeModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { setupCompleted } = useProfiles(); // 👈 from your context

  const steps: { key: StepKey; icon: React.ElementType; label: string }[] = [
    { key: "filament", icon: Layers, label: "Add your first filament profile" },
    {
      key: "inventory",
      icon: ClipboardList,
      label: "Add your inventory adjustments related to that filament profile",
    },
    { key: "printFile", icon: Upload, label: "Add your print file" },
    { key: "printer", icon: Printer, label: "Add your printer" },
    { key: "firstPrint", icon: Play, label: "Start your first print" },
  ];
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className=" min-w-[700px] p-16">
        <div className="text-center mb-6">
          <h2 className="text-xl font-medium mb-1">
            Welcome to NovaForma —{" "}
            <span className="text-blue-500">let's get you set up.</span>
          </h2>
          <p className="text-sm text-muted-foreground">
            You're just a few minutes away from sending your first print from
            NovaForma.
          </p>
        </div>

        <div className="flex flex-col gap-3 mb-5">
          {steps.map(({ key, icon: Icon, label }, i) => {
            const done = setupCompleted[key];
            return (
              <div
                key={key}
                className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${done ? "bg-green-50" : ""}`}
              >
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${done ? "bg-green-100" : "bg-blue-50"}`}
                >
                  <Icon
                    className={`w-4 h-4 ${done ? "text-green-600" : "text-blue-500"}`}
                  />
                </div>

                <span
                  className={`text-sm flex-1 ${done ? "text-muted-foreground line-through" : ""}`}
                >
                  {i + 1}. {label}
                </span>

                {/* ✅ done/not done indicator */}
                {done ? (
                  <Check className="w-4 h-4 text-green-600 shrink-0" />
                ) : (
                  <CircleDashed className="w-4 h-4 text-muted-foreground shrink-0" />
                )}
              </div>
            );
          })}
        </div>

        <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 mb-5 flex gap-3">
          <Bookmark className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-medium text-blue-700 mb-1">
              Tip: Bookmark FlowQ
            </p>
            <p className="text-xs text-blue-600">
              Press{" "}
              <kbd className="bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded text-xs">
                Ctrl+D
              </kbd>{" "}
              to bookmark FlowQ in your browser.
            </p>
          </div>
        </div>

        <Button className="w-full bg-blue-500 hover:bg-blue-600">
          Get Started <ArrowRight className="w-4 h-4 ml-1" />
        </Button>
        <p className="text-center text-xs text-muted-foreground mt-2 cursor-pointer">
          Don't open setup automatically
        </p>
      </DialogContent>
    </Dialog>
  );
}
