"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import img1 from "@/assets/images/img1.jpg";
import { Camera, Pause, Play, Settings, Square } from "lucide-react";
import { Skeleton } from "./ui/skeleton";
import { AddPrinter } from "./AddPrinter";
import { useNavigate } from "react-router-dom";
import { Printer, statusStyles } from "@/lib/types";
import axios from "axios";
import { useProfiles } from "@/context/ProfilesContext";
import { useEffect, useState } from "react";
import CardPrinterCamera from "./CardPrinterCamera";

interface PrinterCardProps {
  printer: Printer | null;
  isSkeleton: boolean;
}

export function PrinterCard({ isSkeleton, printer }: PrinterCardProps) {
  const navigate = useNavigate();
  const { handleResumeJob, handlePauseJob } = useProfiles();

  const activeJob = printer?.jobs.find(
    (job) => job.status === "PRINTING" || job.status === "PAUSED",
  );
  const hasActiveJob = !!activeJob;
  const isPrinting = activeJob?.status === "PRINTING";
  const isPaused = activeJob?.status === "PAUSED";

  const image = img1;

  const job = printer?.jobs?.[0]; // ✅ safe extraction

  const progress = job?.progress ?? 0;

  const timeLeft = job
    ? Math.round(((job.estimatedTime ?? 0) * (100 - (job.progress ?? 0))) / 100)
    : 0;

  return isSkeleton ? (
    <Card className="w-full sm:w-[49%] md:w-[32%] lg:w-[24%] rounded-2xl">
      <CardHeader className="flex justify-between items-center">
        <CardTitle className="w-full">
          <Skeleton className="h-5 w-1/2" />
        </CardTitle>
        <Skeleton className="h-8 w-8 rounded-md" />
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        <div className="w-full aspect-[16/12] rounded-xl border-2 border-dashed flex items-center justify-center relative overflow-hidden">
          <div className="h-full w-[50%] flex justify-center items-center flex-col gap-2">
            <p className="text-center">
              Nothing to see here! Add a device to get started...
            </p>
            <AddPrinter className="w-full" />
          </div>
        </div>

        <Skeleton className="h-4 w-2/3" />

        <div className="flex justify-between items-center min-h-[40px]">
          <div className="space-y-2">
            <Skeleton className="h-3 w-25" />
            <Skeleton className="h-3 w-30" />
          </div>

          <div className="flex gap-2">
            <Skeleton className="h-8 w-8 rounded-md" />
            <Skeleton className="h-8 w-8 rounded-md" />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-10" />
          </div>

          <Skeleton className="h-2 w-full" />

          <div className="flex justify-end">
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
      </CardContent>
    </Card>
  ) : (
    <Card className="w-full sm:w-[49%] md:w-[32%] lg:w-[24%] rounded-2xl">
      <CardHeader className="flex justify-between items-center">
        <CardTitle className="text-lg font-semibold">
          {printer?.printerType} {printer?.model}
        </CardTitle>

        <button
          className="p-2 border-2 rounded-md hover:bg-gray-500 hover:cursor-pointer"
          onClick={() =>
            navigate(`/home/printers/${printer?.id}/general`, {
              state: printer?.id,
            })
          }
        >
          <Settings className="h-3 w-3 text-gray-700" />
        </button>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        <CardPrinterCamera path={printer?.cameraLink} />

        {/* Job title */}
        <h3 className="font-semibold text-sm">
          {job?.part?.title ?? "No active job"}
        </h3>

        <div className="flex justify-between">
          <div className="text-xs text-gray-600">
            <p>Bed: {printer?.bedTemp}°C</p>
            <p>Nozzle: {printer?.nozzleTemp}°C</p>
          </div>

          <div className="flex gap-2">
            <button
              disabled={!hasActiveJob}
              onClick={() => {
                if (!activeJob) return;

                if (isPrinting) {
                  handlePauseJob(activeJob.id);
                } else if (isPaused) {
                  handleResumeJob(activeJob.id);
                }
              }}
              className={`p-2 border-2 rounded-md ${
                hasActiveJob ? "hover:bg-yellow-200 hover:cursor-pointer" : ""
              } disabled:opacity-50`}
            >
              {isPrinting ? (
                <Pause className="h-3 w-3" />
              ) : (
                <Play className="h-3 w-3" />
              )}
            </button>
          </div>
        </div>

        <div className="flex justify-between text-xs">
          <Badge
            className={
              statusStyles[printer?.status] || "bg-gray-100 text-gray-700"
            }
          >
            {printer?.status}
          </Badge>

          <span>{progress}%</span>
        </div>

        <Progress value={progress} className="h-1.5" />

        <div className="text-xs text-gray-500 text-right">
          {job ? `${timeLeft} min left` : "No job running"}
        </div>
      </CardContent>
    </Card>
  );
}
