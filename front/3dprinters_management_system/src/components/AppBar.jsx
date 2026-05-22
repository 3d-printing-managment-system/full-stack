import {
  Bug,
  Check,
  Circle,
  HelpCircle,
  MessageSquare,
  Store,
} from "lucide-react";
import { AppBreadcrumb } from "./AppBreadCrump";
import { Button } from "./ui/button";
import { useState } from "react";
import { WelcomeModal } from "./Welcome";
import { useProfiles } from "@/context/ProfilesContext";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ResourcesModal } from "./ResourcesModal";

function AppBar() {
  const [open, setOpen] = useState(false);
  const [open2, setOpen2] = useState(false);
  const { setupCompleted } = useProfiles();
  const allDone = Object.values(setupCompleted).every(Boolean);
  return (
    <>
      {" "}
      <div className="flex justify-between p-4 border-b items-center">
        <AppBreadcrumb />
        <div className="flex items-center gap-2">
          {/* Finish Setup button */}
          <Button
            variant="outline"
            className="cursor-pointer gap-2"
            onClick={() => setOpen(true)}
          >
            {allDone ? (
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-green-500 text-white">
                <Check className="w-3.5 h-3.5 text-white" />
              </span>
            ) : (
              <span className="flex items-center justify-center w-5 h-5 rounded-full text-white">
                <Circle className="w-3.5 h-3.5 text-muted-foreground" />
              </span>
            )}
            Finish Setup
          </Button>

          {/* Icon buttons */}
          <Tooltip key="bottom1">
            <TooltipTrigger asChild>
              <Button variant="outline" size="icon" className="cursor-pointer">
                <MessageSquare className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent
              className="bg-white ring-1 ring-foreground/10 px-1.5 py-1.5"
              arrowClassName="bg-white fill-white ring-1 ring-foreground/10 "
            >
              <div className="flex flex-col gap-1">
                <Button
                  variant="ghost"
                  className="text-xs justify-start gap-2 text-black"
                >
                  <MessageSquare className="h-4 w-4" />
                  Feedback & Suggestions
                </Button>

                <Button
                  variant="ghost"
                  className="text-xs justify-start gap-2  text-black"
                >
                  <Bug className="h-4 w-4" />
                  Report a Bug
                </Button>
              </div>
            </TooltipContent>
          </Tooltip>

          <Tooltip key="bottom2">
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="cursor-pointer"
                onClick={() => setOpen2(true)}
              >
                <HelpCircle className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Resources</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip key="bottom3">
            <TooltipTrigger asChild>
              <Button variant="outline" size="icon" className="cursor-pointer">
                <Store className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Check Our store</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
      <WelcomeModal open={open} onOpenChange={setOpen} />
      <ResourcesModal open={open2} onOpenChange={setOpen2} />
    </>
  );
}
export default AppBar;
