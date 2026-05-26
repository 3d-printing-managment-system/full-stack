"use client";

import { Badge } from "@/components/ui/badge";
import { useProfiles } from "@/context/ProfilesContext";
import { Printer, statusStyles } from "@/lib/types";
import { formatSecondsToDurationBetter } from "@/lib/utils";
import axios from "axios";
import { Pause, Play, XCircle } from "lucide-react";
import { useState } from "react";
import { useOutletContext } from "react-router-dom";

function PrinterGeneralInfo() {
  const printer = useOutletContext<Printer>();
  const [nozzleTemp, setNozzleTemp] = useState(printer?.nozzleTemp ?? 200);
  const [loadingNozzle, setLoadingNozzle] = useState(false);
  const [loadingBed, setLoadingBed] = useState(false);
  const [bedTemp, setBedTemp] = useState(printer?.bedTemp ?? 60);
  const {
    handleCancelJob,
    handlePauseJob,
    handleResumeJob,
    refreshPrinters,
    existingTags,
  } = useProfiles();
  const tagMap = Object.fromEntries(existingTags.map((t) => [t.id, t]));
  console.log("this is the map", tagMap);

  // const currentJob =
  //   printer?.jobs?.find(
  //     (job) => job.status === "PRINTING" || job.status === "PAUSED",
  //   ) ?? null;
  // console.log("this is the current job", currentJob);
  // const hasJob = currentJob !== null;
  // const canControl =
  //   currentJob?.status === "PRINTING" || currentJob?.status === "PAUSED";

  // const isPrinting = currentJob?.status === "PRINTING";
  // const isPaused = currentJob?.status === "PAUSED";

  const currentJob =
    printer?.jobs?.find(
      (job) =>
        job.status === "PRINTING" ||
        job.status === "PAUSED" ||
        job.status === "DISPATCHED" ||
        (job.status === "QUEUED" &&
          job.printerSelectionMode === "SPECIFIC_PRINTER"), 
    ) ?? null;

  const hasJob = currentJob !== null;
  const isQueued = currentJob?.status === "QUEUED";
  const isDispatched = currentJob?.status === "DISPATCHED";
  const isPrinting = currentJob?.status === "PRINTING";
  const isPaused = currentJob?.status === "PAUSED";
  const canControl = isPrinting || isPaused;
  // const canCancel = hasJob && !isQueued; // or allow cancel on queued too — your call

  const duration = formatSecondsToDurationBetter(
    currentJob?.estimatedTime ?? 0,
  );

  const progress = currentJob?.progress ?? 0;
  const handleSetNozzleTemp = async (temp: number) => {
    setLoadingNozzle(true);
    try {
      await axios.post("http://localhost:3000/api/gcode-commands/send-raw", {
        printerId: printer.id,
        gcode: `M104 S${temp}`,
      });
      await refreshPrinters();
    } finally {
      setLoadingNozzle(false);
    }
  };

  const handleSetBedTemp = async (temp: number) => {
    setLoadingBed(true);
    try {
      await axios.post("http://localhost:3000/api/gcode-commands/send-raw", {
        printerId: printer.id,
        gcode: `M140 S${temp}`,
      });
      await refreshPrinters();
    } finally {
      setLoadingBed(false);
    }
  };

  return (
    <div className="w-full mx-auto p-6 space-y-8 font-sans text-gray-800">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {" "}
          <h1 className="text-2xl font-bold text-gray-700">
            {printer?.name ?? "Printer"}
          </h1>
          <div className="flex flex-wrap gap-2 items-center">
            {printer.tags.map((item) => (
              <Badge
                key={item.tagId}
                variant="secondary"
                className="ring-1 ring-foreground/10"
              >
                {tagMap[item.tagId]?.name ?? item.tagId}
              </Badge>
            ))}
          </div>
        </div>
        <Badge
          className={`px-4 py-3 ${
            statusStyles[printer?.status] || "bg-gray-100 text-gray-700"
          }`}
        >
          {printer?.status}
        </Badge>
      </div>

      {/* MAIN CARD */}
      {/* <div className="bg-white border border-gray-100 rounded-xl p-8 shadow-sm">
        <div className="flex justify-between items-end mb-4">
          <div>
            <p className="text-sm text-gray-500 mb-1">Currently printing:</p>

            <h2 className="text-lg font-semibold text-gray-700">
              {currentJob?.part?.title ?? "Idle - No active job"}
            </h2>
          </div>

          <span
            className={`text-4xl font-black ${canControl ? "text-blue-60" : "text-gray-40"}`}
          >
            {progress}%
          </span>
        </div>

        <div className="w-full h-8 bg-gray-100 rounded-lg overflow-hidden mb-8">
          <div
            className="h-full bg-blue-500 transition-all duration-500 ease-in-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex justify-center gap-4">
          <button
            disabled={!canControl}
            onClick={() => {
              if (!currentJob) return;

              if (isPrinting) {
                handlePauseJob(currentJob.id);
              } else if (isPaused) {
                handleResumeJob(currentJob.id);
              }
            }}
            className={`flex items-center gap-2 px-10 py-3 rounded-full font-bold transition ${
              canControl
                ? "bg-blue-100 text-blue-700 hover:bg-blue-200 cursor-pointer"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }`}
          >
            {isPrinting ? (
              <>
                <Pause size={18} />
                Pause
              </>
            ) : (
              <>
                <Play size={18} />
                Resume
              </>
            )}
          </button>

          <button
            onClick={() =>
              currentJob?.status !== "CANCELLED" &&
              handleCancelJob(currentJob?.id)
            }
            disabled={!hasJob}
            className={`flex items-center gap-2 px-10 py-3 rounded-full font-bold transition ${
              hasJob
                ? "bg-red-100 text-red-600 hover:bg-red-200 cursor-pointer"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }`}
          >
            <XCircle size={18} />
            Cancel
          </button>
        </div>
      </div> */}
      {/* MAIN CARD */}
      <div className="bg-white border border-gray-100 rounded-xl p-8 shadow-sm">
        <div className="flex justify-between items-end mb-4">
          <div>
            <p className="text-sm text-gray-500 mb-1">Currently printing:</p>
            <h2 className="text-lg font-semibold text-gray-700">
              {currentJob?.part?.title ?? "Idle - No active job"}
            </h2>

            {isQueued && (
              <div className="mt-2 flex items-center gap-2 text-sm text-blue-600 bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-lg w-fit">
                <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                Job queued for this printer — waiting to start...
              </div>
            )}

            {isDispatched && (
              <div className="mt-2 flex items-center gap-2 text-sm text-amber-600 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg w-fit">
                <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                Print job dispatched — starting soon...
              </div>
            )}
          </div>

          <span
            className={`text-4xl font-black ${canControl ? "text-blue-600" : "text-gray-400"}`}
          >
            {isPrinting || isPaused
              ? `${progress}%`
              : isDispatched
                ? "—"
                : "0%"}
          </span>
        </div>

        <div className="w-full h-8 bg-gray-100 rounded-lg overflow-hidden mb-8">
          <div className="w-full h-8 bg-gray-100 rounded-lg overflow-hidden mb-8">
            {isDispatched ? (
              <div className="h-full bg-amber-300 animate-pulse w-full" />
            ) : isQueued ? (
              <div className="h-full bg-blue-200 w-1/4 animate-pulse" />
            ) : (
              <div
                className="h-full bg-blue-500 transition-all duration-500 ease-in-out"
                style={{ width: `${progress}%` }}
              />
            )}
          </div>
        </div>

        <div className="flex justify-center gap-4">
          <button
            disabled={!canControl} // 👈 dispatched = disabled
            onClick={() => {
              if (!currentJob) return;
              if (isPrinting) handlePauseJob(currentJob.id);
              else if (isPaused) handleResumeJob(currentJob.id);
            }}
            className={`flex items-center gap-2 px-10 py-3 rounded-full font-bold transition ${
              canControl
                ? "bg-blue-100 text-blue-700 hover:bg-blue-200 cursor-pointer"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }`}
          >
            {isPrinting ? (
              <>
                <Pause size={18} /> Pause
              </>
            ) : (
              <>
                <Play size={18} /> Resume
              </>
            )}
          </button>

          <button
            disabled={!hasJob}
            onClick={() => {
              if (!currentJob) return;
              console.log("iam getting clicks");
              handleCancelJob(currentJob.id);
            }}
            className={`flex items-center gap-2 px-10 py-3 rounded-full font-bold transition ${
              hasJob
                ? "bg-red-100 text-red-600 hover:bg-red-200 cursor-pointer"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }`}
          >
            <XCircle size={18} />
            Cancel
          </button>
        </div>
      </div>

      {/* LIVESTREAM / STATS */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-gray-600">Livestream</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm min-h-[400px]">
          {/* STATS */}
          <div className="p-8 flex flex-col justify-between divide-y divide-gray-100">
            {/* UPTIME */}
            <div className="pb-8">
              <p className="text-sm text-gray-400 font-bold mb-4 uppercase tracking-wider">
                Printer Uptime
              </p>

              {hasJob ? (
                <div className="flex gap-4">
                  {Object.entries(duration).map(([label, value]) => (
                    <div key={label} className="text-center">
                      <p className="text-3xl font-light text-gray-700">
                        {String(value).padStart(2, "0")}
                      </p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase">
                        {label}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">
                  Printer is idle — no active print job
                </p>
              )}
            </div>

            {/* TEMPERATURES (ALWAYS EDITABLE) */}
            <div className="pt-8 grid grid-cols-2 gap-8">
              <div>
                <p className="text-sm text-gray-400 font-bold mb-2 uppercase">
                  Nozzle
                </p>
                <p className="text-3xl text-gray-700 mb-4">
                  {printer?.nozzleTemp}°C
                </p>

                <div className="flex gap-2">
                  <input
                    value={nozzleTemp}
                    onChange={(e) => setNozzleTemp(Number(e.target.value))}
                    type="number"
                    className="w-20 bg-gray-50 border rounded px-2 py-1 text-sm"
                    placeholder="235"
                  />
                  <button
                    disabled={loadingNozzle}
                    className="bg-orange-400 disabled:opacity-50 text-white px-4 py-1 rounded text-sm font-bold cursor-pointer"
                    onClick={() => handleSetNozzleTemp(nozzleTemp)}
                  >
                    {loadingNozzle ? "SENDING..." : "SET"}
                  </button>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-400 font-bold mb-2 uppercase">
                  Bed Temp
                </p>
                <p className="text-3xl text-gray-700 mb-4">
                  {printer?.bedTemp}°C
                </p>

                <div className="flex gap-2">
                  <input
                    value={bedTemp}
                    onChange={(e) => setBedTemp(Number(e.target.value))}
                    type="number"
                    className="w-20 bg-gray-50 border rounded px-2 py-1 text-sm"
                    placeholder="60"
                  />
                  <button
                    className="bg-orange-400 text-white px-4 py-1 rounded text-sm font-bold cursor-pointer"
                    onClick={() => handleSetBedTemp(Number(bedTemp))}
                  >
                    {loadingNozzle ? "SENDING..." : "SET"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* CAMERA */}
          <div className="relative bg-black">
            <img
              src="https://your-camera-stream-url.com/live"
              alt="Printer Live Feed"
              className="w-full h-full object-cover opacity-90"
            />

            <div className="absolute top-4 right-4 bg-red-600 text-white px-2 py-1 rounded text-[10px] font-bold flex items-center gap-1">
              <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
              LIVE
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PrinterGeneralInfo;
