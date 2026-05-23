import { prisma } from "../../lib/prisma";
import {
  publishPauseJobCommand,
  publishResumeJobCommand,
  publishCancelJobCommand,
} from "./mqtt.service";

interface CreatePrintJobInput {
  fileId: string;
  
  // Only required for SPECIFIC_PRINTER
  printerId?: string | null;

  profileId?: string | null;

  printerSelectionMode:
    | "NEXT_AVAILABLE_WITH_SPECIFIC_TAG"
    | "SPECIFIC_PRINTER";

  // Used only for NEXT_AVAILABLE_WITH_SPECIFIC_TAG
  requiredTagIds?: string[];

  estimatedTime?: number | null;

  createdAt?: string;

  [key: string]: unknown;
}

export const createPrintJob = async (data: CreatePrintJobInput) => {
  // ======================================================
  // VALIDATE PART
  // ======================================================

  const part = await prisma.part.findUnique({
    where: { id: data.fileId },
  });

  if (!part) {
    throw new Error("Part not found");
  }

  // ======================================================
  // VALIDATE PRINTER
  // ======================================================

  if (data.printerSelectionMode === "SPECIFIC_PRINTER") {
    if (!data.printerId) {
      throw new Error(
        "Printer is required in SPECIFIC_PRINTER mode"
      );
    }

    const printer = await prisma.printer.findUnique({
      where: { id: data.printerId },
    });

    if (!printer) {
      throw new Error("Printer not found");
    }
  }

  // ======================================================
  // VALIDATE TAGS
  // ======================================================

  if (
    data.printerSelectionMode ===
    "NEXT_AVAILABLE_WITH_SPECIFIC_TAG"
  ) {
    if (
      !data.requiredTagIds ||
      data.requiredTagIds.length === 0
    ) {
      throw new Error("At least one tag is required");
    }
  }

  // ======================================================
  // GENERATE QUEUE POSITION
  // ======================================================

  const lastJob = await prisma.printJob.findFirst({
    orderBy: {
      queuePosition: "desc",
    },
  });

  const nextQueuePosition = lastJob
    ? lastJob.queuePosition + 1
    : 1;

  // ======================================================
  // CREATE JOB
  // ======================================================

  return prisma.printJob.create({
    data: {
      fileId: data.fileId,

      printerId:
        data.printerSelectionMode === "SPECIFIC_PRINTER"
          ? data.printerId
          : null,

      profileId: data.profileId ?? null,

      printerSelectionMode:
        data.printerSelectionMode,

      estimatedTime: data.estimatedTime ?? null,

      createdAt: new Date(),

      queuePosition: nextQueuePosition,

      status: "QUEUED",

      progress: 0,

      startedAt: null,

      finishedAt: null,

      requiredTagIds:
        data.printerSelectionMode ===
        "NEXT_AVAILABLE_WITH_SPECIFIC_TAG"
          ? data.requiredTagIds ?? []
          : [],
    },
  });
};

export const getPrintJobs = () => {
  return prisma.printJob.findMany({
    orderBy: {
      queuePosition: "asc",
    },
    include: {
      printer: true,
      part: true,
      profile: true,
    },
  });
};

export const getPrintJobById = (id: string) => {
  return prisma.printJob.findUnique({
    where: { id },
    include: {
      printer: true,
      part: true,
      profile: true,
    },
  });
};

export const startPrintJob = async (id: string) => {
  const job = await prisma.printJob.findUnique({
    where: { id },
  });

  if (!job) {
    throw new Error("Job not found");
  }

  if (job.status !== "QUEUED") {
    throw new Error(
      "Only queued jobs can be started"
    );
  }

  if (!job.printerId) {
    throw new Error(
      "Cannot start a job without an assigned printer"
    );
  }

  await prisma.printer.update({
    where: { id: job.printerId },
    data: {
      status: "PRINTING",
    },
  });

  return prisma.printJob.update({
    where: { id },
    data: {
      status: "PRINTING",
      startedAt: new Date(),
    },
  });
};

export const updateProgress = async (
  id: string,
  progress: number
) => {
  if (progress < 0 || progress > 100) {
    throw new Error(
      "Progress must be between 0 and 100"
    );
  }

  const job = await prisma.printJob.findUnique({
    where: { id },
  });

  if (!job) {
    throw new Error("Job not found");
  }

  if (job.status !== "PRINTING") {
    throw new Error(
      "Job is not currently printing"
    );
  }

  if (!job.printerId) {
    throw new Error(
      "Cannot update a job without an assigned printer"
    );
  }

  const isDone = progress === 100;

  if (isDone) {
    await prisma.printer.update({
      where: { id: job.printerId },
      data: {
        status: "IDLE",
      },
    });
  }

  return prisma.printJob.update({
    where: { id },
    data: {
      progress,
      status: isDone ? "DONE" : "PRINTING",
      finishedAt: isDone
        ? new Date()
        : undefined,
    },
  });
};

export const pauseJob = async (id: string) => {
  const job = await prisma.printJob.findUnique({
    where: { id },
  });

  if (!job) {
    throw new Error("Job not found");
  }

  if (job.status !== "PRINTING") {
    throw new Error(
      "Only printing jobs can be paused"
    );
  }

  if (!job.printerId) {
    throw new Error(
      "No printer assigned to this job"
    );
  }

  publishPauseJobCommand({
    printerId: job.printerId,
    jobId: job.id,
  });

  return {
    message: "Pause command sent successfully",
  };
};

export const resumeJob = async (id: string) => {
  const job = await prisma.printJob.findUnique({
    where: { id },
  });

  if (!job) {
    throw new Error("Job not found");
  }

  if (job.status !== "PAUSED") {
    throw new Error(
      "Only paused jobs can be resumed"
    );
  }

  if (!job.printerId) {
    throw new Error(
      "No printer assigned to this job"
    );
  }

  publishResumeJobCommand({
    printerId: job.printerId,
    jobId: job.id,
  });

  return {
    message: "Resume command sent successfully",
  };
};

export const cancelJob = async (id: string) => {
  const job = await prisma.printJob.findUnique({
    where: { id },
  });

  if (!job) {
    throw new Error("Job not found");
  }

  const cancellableStatuses = [
    "QUEUED",
    "PRINTING",
    "PAUSED",
  ];

  if (!cancellableStatuses.includes(job.status)) {
    throw new Error("Job cannot be cancelled");
  }
   if (job.status === "QUEUED") {
    return prisma.printJob.update({
      where: { id },
      data: {
        status: "CANCELLED",
        finishedAt: new Date(),
      },
    });
  }

  if (!job.printerId) {
    throw new Error(
      "No printer assigned to this job"
    );
  }

  publishCancelJobCommand({
    printerId: job.printerId,
    jobId: job.id,
  });

  return {
    message: "Cancel command sent successfully",
  };
};

export const failJob = async (id: string) => {
  const job = await prisma.printJob.findUnique({
    where: { id },
  });

  if (!job) {
    throw new Error("Job not found");
  }

  if (!job.printerId) {
    throw new Error(
      "Cannot fail a job without an assigned printer"
    );
  }

  await prisma.printer.update({
    where: { id: job.printerId },
    data: {
      status: "IDLE",
    },
  });

  return prisma.printJob.update({
    where: { id },
    data: {
      status: "FAILED",
      finishedAt: new Date(),
    },
  });
};

export const deletePrintJob = (id: string) => {
  return prisma.printJob.delete({
    where: { id },
  });
};

export const deleteManyPrintJobsService = async (
  ids: string[]
) => {
  if (!ids || ids.length === 0) {
    throw new Error("No IDs provided");
  }

  return prisma.printJob.deleteMany({
    where: {
      id: {
        in: ids,
      },
    },
  });
};