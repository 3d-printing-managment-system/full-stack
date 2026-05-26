import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  Send,
  Trash2,
  Power,
  Home,
  Ban,
  ArrowUp,
  ArrowDown,
  Move,
  Loader2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useProfiles } from "@/context/ProfilesContext";
import { useOutletContext } from "react-router-dom";
import { Printer } from "@/lib/types";

type Log = {
  type: "sent" | "received";
  msg: string;
  time: string;
};

const GcodeConsolePrinter = () => {
  const printer = useOutletContext<Printer>();
  console.log(printer);
  const { commands, refreshCommands } = useProfiles();
  const [isWaiting, setIsWaiting] = useState(false);
  const [command, setCommand] = useState("");
  const [templateMode, setTemplateMode] = useState(false);
  const [stepSize, setStepSize] = useState("10");
  const [logs, setLogs] = useState<Log[]>([]);

  const loadRecentLogs = async () => {
    try {
      const { data } = await axios.get(
        `http://localhost:3000/api/command-logs/printer/${printer.id}?limit=5`,
      );

      const formattedLogs: Log[] = data.flatMap((log: any) => {
        const entries: Log[] = [
          {
            type: "sent",
            msg: log.rawCommand,
            time: new Date(log.createdAt).toLocaleTimeString(),
          },
        ];

        entries.push({
          type: "received",
          msg: log.response
            ? `status: ${log.status}, response: ${log.response}`
            : "Timeout — no response received",
          time: new Date(log.updatedAt ?? log.createdAt).toLocaleTimeString(),
        });
        return entries;
      });

      setLogs(formattedLogs);
    } catch (error) {
      console.error("Failed to load logs", error);
    }
  };

  useEffect(() => {
    if (printer?.id) {
      loadRecentLogs();
    }
  }, [printer?.id]);

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  // ================= LOG HELPER =================
  const addLog = (type: "sent" | "received", msg: string) => {
    setLogs((prev) => [
      ...prev,
      {
        type,
        msg,
        time: new Date().toLocaleTimeString(),
      },
    ]);
  };

  const pollForResponse = async (printerId: string) => {
    const maxAttempts = 20;
    const interval = 1000;

    for (let i = 0; i < maxAttempts; i++) {
      await new Promise((res) => setTimeout(res, interval));

      try {
        const { data } = await axios.get(
          `http://localhost:3000/api/command-logs/printer/${printerId}/last`,
        );
        console.log("the last", data);
        console.log("checking", data.updatedAt > data.createdAt);

        if (new Date(data.updatedAt) > new Date(data.createdAt)) {
          addLog(
            "received",
            `status: ${data.status}, response: ${data.response ? data.response : "no response yet"}`,
          );
          return;
        }
      } catch {}
    }

    addLog("received", "Timeout — no response received");
  };

  // ================= MAIN SEND =================
  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();

    if (!command.trim()) return;

    // ================= TEMPLATE MODE =================
    if (templateMode) {
      if (!command.includes(":")) {
        addLog("received", "Template format required → {NAME} : {COMMAND}");
        return;
      }

      const [name, rawCommand] = command.split(":").map((s) => s.trim());

      if (!name || !rawCommand) {
        addLog(
          "received",
          "Invalid template. Example: Preheat PLA : M104 S200",
        );
        return;
      }

      const existingCommand = commands.find(
        (cmd) => cmd.name.toLowerCase() === name.toLowerCase(),
      );

      if (existingCommand) {
        addLog(
          "received",
          `Template "${name}" already exists. Choose another name.`,
        );
        return;
      }

      try {
        // ================= SAVE NEW TEMPLATE =================
        await axios.post("http://localhost:3000/api/gcode-commands", {
          name,
          command: rawCommand,
        });

        refreshCommands();

        addLog("sent", command);
        addLog("received", `Template "${name}" saved successfully`);

        setTemplateMode(false);
        setCommand("");
      } catch (err) {
        addLog("received", "Failed to save template");
      }

      return;
    }

    // ================= NORMAL MODE =================
    const matchedCommand = commands.find(
      (cmd) =>
        cmd.command.trim().toUpperCase() === command.trim().toUpperCase(),
    );

    // If found → use its id
    // If not → commandId = null
    try {
      // Actually send to printer
      if (matchedCommand) {
        await axios.post(
          `http://localhost:3000/api/gcode-commands/${matchedCommand.id}/send?printerId=${printer.id}`,
        );
      } else {
        await axios.post("http://localhost:3000/api/gcode-commands/send-raw", {
          printerId: printer.id,
          gcode: command,
        });
      }

      addLog("sent", command);
      // addLog("received", "Command sent successfully");
      await pollForResponse(printer.id);
    } catch (err) {
      addLog("received", "Failed to send command");
    }

    setCommand("");
  };

  // ================= MOVEMENT =================
  const sendMovement = (axis: string, value: number) => {
    const cmd = `G1 ${axis}${value}`;
    // sendPrinterCommand(cmd);
    setCommand(cmd);
  };

  // ================= QUICK COMMANDS =================
  const quickCommands = [
    { label: "Motors Off", icon: <Power size={14} />, cmd: "M84" },
    { label: "Home All", icon: <Home size={14} />, cmd: "G28" },
    { label: "E-Stop", icon: <Ban size={14} />, cmd: "M112" },
  ];

  return (
    <div className="flex w-full gap-6">
      {/* ================= LEFT COLUMN ================= */}
      <div className="flex-1 space-y-6">
        {/* MOVEMENT */}
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Move size={16} /> Movement
            </CardTitle>
          </CardHeader>

          <CardContent className="">
            <div className="flex flex-col items-center gap-4">
              {/* XY PAD */}
              <div className="grid grid-cols-3 gap-2">
                <div />

                <Button
                  className=""
                  variant="outline"
                  size="icon"
                  onClick={() => sendMovement("Y", Number(stepSize))}
                >
                  <ArrowUp size={20} />
                </Button>

                <div />

                <Button
                  className=""
                  variant="outline"
                  size="icon"
                  onClick={() => sendMovement("X", -Number(stepSize))}
                >
                  <ArrowDown className="rotate-90" size={20} />
                </Button>

                <Button
                  className=""
                  variant="secondary"
                  size="icon"
                  // onClick={() => sendPrinterCommand("G28")}
                  onClick={() => setCommand("G28")}
                >
                  <Home size={20} />
                </Button>

                <Button
                  className=""
                  variant="outline"
                  size="icon"
                  onClick={() => sendMovement("X", Number(stepSize))}
                >
                  <ArrowUp className="rotate-90" size={20} />
                </Button>

                <div />

                <Button
                  className=""
                  variant="outline"
                  size="icon"
                  onClick={() => sendMovement("Y", -Number(stepSize))}
                >
                  <ArrowDown size={20} />
                </Button>

                <div />
              </div>

              <Separator className="" />

              {/* STEP SIZE */}
              <div className="flex bg-slate-100 p-1 rounded-lg gap-1">
                {["0.1", "1", "10", "100"].map((dist) => (
                  <Button
                    key={dist}
                    variant={stepSize === dist ? "default" : "ghost"}
                    size="sm"
                    className="h-7 text-[10px] px-3"
                    onClick={() => setStepSize(dist)}
                  >
                    {dist}mm
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* QUICK COMMANDS */}
        <Card className="shadow-sm">
          <CardHeader className="">
            <CardTitle className="text-sm font-medium">
              Quick Commands
            </CardTitle>
          </CardHeader>

          <CardContent className="grid grid-cols-2 gap-2">
            {quickCommands.map((item) => (
              <Button
                key={item.label}
                variant="outline"
                className="justify-start gap-2"
                size="sm"
                // onClick={() => sendPrinterCommand(item.cmd)}
                onClick={() => setCommand(item.cmd)}
              >
                {item.icon}
                {item.label}
              </Button>
            ))}
          </CardContent>
        </Card>

        {/* SAVED COMMANDS */}
        <Card className="">
          <CardHeader className="">
            <CardTitle className="text-sm">Saved Templates</CardTitle>
          </CardHeader>

          <CardContent className="">
            <Select
              onValueChange={(value) => {
                const selected = commands.find((cmd) => cmd.id === value);

                if (selected) {
                  setCommand(selected.command);
                  addLog("received", `Loaded template: ${selected.name}`);
                }
              }}
            >
              <SelectTrigger className="">
                <SelectValue placeholder="Choose saved command" />
              </SelectTrigger>

              <SelectContent className="">
                {commands.map((cmd) => (
                  <SelectItem key={cmd.id} value={cmd.id} className="">
                    {cmd.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      </div>

      {/* ================= RIGHT COLUMN ================= */}
      <Card className="flex-[4] flex flex-col h-[700px] border-none shadow-xl bg-slate-950">
        {/* HEADER */}
        <CardHeader className="flex flex-row items-center justify-between border-b border-slate-800 py-3 px-6">
          <div className="flex items-center gap-4">
            <CardTitle className="text-slate-200 text-sm font-mono">
              Terminal Output
            </CardTitle>

            <div className="flex items-center gap-2">
              <Switch id="autoscroll" defaultChecked className="" />
              <Label
                htmlFor="autoscroll"
                className="text-[10px] text-slate-400 uppercase tracking-widest"
              >
                Autoscroll
              </Label>
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="text-slate-400 hover:text-white"
            onClick={() => setLogs([])}
          >
            <Trash2 size={16} />
          </Button>
        </CardHeader>

        {/* TERMINAL */}
        <CardContent className="flex-1 overflow-hidden p-0">
          <div
            ref={scrollRef}
            className="h-full overflow-y-auto p-6 font-mono text-xs leading-relaxed"
          >
            {logs.map((log, i) => (
              <div
                key={i}
                className={`mb-1 flex gap-4 ${
                  log.type === "sent" ? "text-blue-400" : "text-slate-300"
                }`}
              >
                <span className="text-slate-600 min-w-[70px]">
                  [{log.time}]
                </span>

                <span className="text-slate-500">
                  {log.type === "sent" ? ">>" : "<<"}
                </span>

                <span className="break-all">{log.msg}</span>
              </div>
            ))}
          </div>
        </CardContent>

        {/* INPUT */}
        <div className="p-4 bg-slate-900 border-t border-slate-800">
          <form onSubmit={handleSend} className="flex gap-2">
            <Input
              type=""
              value={command}
              disabled={isWaiting}
              onChange={(e) => setCommand(e.target.value)}
              className="bg-slate-950 border-slate-700 text-slate-200 font-mono"
              placeholder={
                isWaiting
                  ? "⏳ Waiting for response..."
                  : templateMode
                    ? "Template mode → NAME : COMMAND"
                    : "Enter G-Code (e.g. M104 S200)"
              }
            />

            <Button
              disabled={isWaiting}
              type="submit"
              className="bg-blue-600 hover:bg-blue-500 px-6"
            >
              {/* <Send size={18} /> */}
              {isWaiting ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Send size={18} />
              )}
            </Button>

            <Button
              disabled={isWaiting}
              type="button"
              variant="outline"
              className="text-white bg-transparent"
              onClick={() => {
                setTemplateMode(true);
                addLog(
                  "received",
                  "Template Mode → Use format: NAME : COMMAND",
                );

                addLog("received", "Example → Preheat PLA : M104 S200");
              }}
            >
              Save As Template
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
};

export default GcodeConsolePrinter;
