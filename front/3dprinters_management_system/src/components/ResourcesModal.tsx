import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "./ui/button";
import {
  Book,
  Play,
  Headset,
  Router,
  PlugZap,
  Keyboard,
  ExternalLink,
  X,
} from "lucide-react";

const resources = [
  {
    icon: Book,
    color: "text-blue-500",
    title: "Setup guides",
    desc: "Learn how to set up your first device and start printing",
    link: "View guides",
  },
  {
    icon: Play,
    color: "text-red-500",
    title: "Setup videos",
    desc: "Complete video walkthroughs for setting up NovaForma",
    link: "Watch tutorials",
  },
  {
    icon: Headset,
    color: "text-emerald-600",
    title: "Customer support",
    desc: "Have a question? Contact our support team for help",
    link: "Contact support",
  },
  {
    icon: Router,
    color: "text-violet-500",
    title: "Get tunnels",
    desc: "Tunnels are required to connect your 3D printers remotely",
    link: "Shop tunnels",
  },
  {
    icon: PlugZap,
    color: "text-emerald-600",
    title: "Integrations",
    desc: "Integrate NovaForma with 8,000+ apps using no-code tools or our API",
    link: "Learn more",
  },
  {
    icon: Keyboard,
    color: "text-amber-600",
    title: "Keyboard shortcuts",
    desc: "View all available keyboard shortcuts to speed up your workflow",
    link: "View shortcuts",
  },
];

export function ResourcesModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  // console.log("clicked");
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="min-w-[620px] p-7">
        <div className="mb-5">
          <h2 className="text-lg font-medium mb-1">NovaForma resources</h2>
          <p className="text-sm text-muted-foreground">
            Access helpful guides and documentation to get the most out of
            NovaForma.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-5">
          {resources.map(({ icon: Icon, color, title, desc, link }) => (
            <div key={title} className="border rounded-xl p-4 flex flex-col">
              <Icon className={`w-5 h-5 ${color} mb-3`} />
              <p className="text-sm font-medium mb-1">{title}</p>
              <p className="text-xs text-muted-foreground flex-1 mb-3 leading-relaxed">
                {desc}
              </p>
              <a
                href="#"
                className="text-xs text-blue-500 flex items-center gap-1 hover:underline"
              >
                {link} <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" className="gap-1.5 text-sm">
            Request features <ExternalLink className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="outline"
            className="text-sm"
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
