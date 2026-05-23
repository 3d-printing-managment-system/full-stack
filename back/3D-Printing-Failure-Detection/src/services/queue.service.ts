import { prisma } from "../../lib/prisma";
import { publishStartJob } from "./mqtt.service";

export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

let isProcessing = false;

export const processQueue = async () => {
  if (isProcessing) {
    console.log("⏳ Queue already processing, skipping...");
    return;
  }

  isProcessing = true;

  try {
    // ====================================================
    // GUARD — stop if any job is already running
    // ====================================================

    const runningJob = await prisma.printJob.findFirst({
      where: {
        status: { in: ["DISPATCHED", "PRINTING", "PAUSED"] },
      },
    });

    if (runningJob) {
      console.log("🖨️ A job is already running, waiting...");
      return;
    }

    // ====================================================
    // GET FIRST QUEUED JOB ONLY
    // ====================================================

    const job = await prisma.printJob.findFirst({
      where: { status: "QUEUED" },
      orderBy: { queuePosition: "asc" },
      include: { part: true },
    });

    if (!job) {
      console.log("📭 No queued jobs");
      return;
    }

    // ====================================================
    // CHECK THE PRINTER SPECIFIC TO THIS JOB
    // ====================================================

    let printer = null;

    if (job.printerSelectionMode === "SPECIFIC_PRINTER") {
      if (!job.printerId) return;

      const found = await prisma.printer.findUnique({
        where: { id: job.printerId },
        include: { tags: true },
      });

      if (found?.status === "IDLE") printer = found;

    } else if (
      job.printerSelectionMode === "NEXT_AVAILABLE_WITH_SPECIFIC_TAG"
    ) {
      const requiredTags = job.requiredTagIds || [];

      const idlePrinters = await prisma.printer.findMany({
        where: { status: "IDLE" },
        include: { tags: true },
      });

      printer =
        idlePrinters.find((p) =>
          p.tags.some((tag: any) => requiredTags.includes(tag.tagId))
        ) ?? null;
    }

    if (!printer) {
      console.log("🖨️ Printer not idle yet, waiting...");
      return;
    }

    await assignJobToPrinter(job, printer);

  } finally {
    isProcessing = false;
  }

  return "Queue processed successfully";
};

const assignJobToPrinter = async (job: any, printer: any) => {
  await prisma.$transaction([
    prisma.printer.update({
      where: { id: printer.id },
      data: { status: "RESERVED" },
    }),

    prisma.printJob.update({
      where: { id: job.id },
      data: {
        printerId: printer.id,
        status: "DISPATCHED",
      },
    }),
  ]);

  await publishStartJob({
    printerId: printer.id,
    jobId: job.id,
    fileUrl: job.part.fileUrl!,
  });

  await prisma.printerEvent.create({
    data: {
      printerId: printer.id,
      jobId: job.id,
      type: "JOB_DISPATCHED",
      payload: {
        fileUrl: job.part.fileUrl,
      },
    },
  });
};