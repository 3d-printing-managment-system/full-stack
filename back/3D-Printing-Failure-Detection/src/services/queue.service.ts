import { prisma } from "../../lib/prisma";
import { publishStartJob } from "./mqtt.service";

/**
 * =========================================================
 * QUEUE PROCESSOR
 * =========================================================
 * Called when:
 * - manually triggered via POST /queue/start
 * - a printer becomes IDLE (MQTT)
 * - a job finishes/fails/cancels (MQTT)
 *
 * Runs a drain loop: keeps dispatching jobs until no more
 * matches can be made (no idle printers or no queued jobs).
 * =========================================================
 */

export const processQueue = async () => {
  let matched = true;

  while (matched) {
    matched = false;

    // ====================================================
    // REFRESH STATE
    // Re-fetch from DB every iteration so we always work
    // with accurate printer statuses and job statuses
    // ====================================================

    const printers = await prisma.printer.findMany({
      include: {
        tags: true,
      },
    });

    const idlePrinters = printers.filter(
      (printer) => printer.status === "IDLE"
    );

    if (idlePrinters.length === 0) break;

    const jobs = await prisma.printJob.findMany({
      where: {
        status: "QUEUED",
      },
      orderBy: {
        queuePosition: "asc",
      },
      include: {
        part: true,
      },
    });

    if (jobs.length === 0) break;

    // ====================================================
    // PRIORITY SPLIT
    // ====================================================

    const specificPrinterJobs = jobs.filter(
      (job) => job.printerSelectionMode === "SPECIFIC_PRINTER"
    );

    const tagBasedJobs = jobs.filter(
      (job) =>
        job.printerSelectionMode ===
        "NEXT_AVAILABLE_WITH_SPECIFIC_TAG"
    );

    // ====================================================
    // STEP 1
    // SPECIFIC PRINTER JOBS (highest priority)
    // Break after first dispatch so we re-fetch fresh state
    // ====================================================

    for (const job of specificPrinterJobs) {
      if (!job.printerId) continue;

      const printer = idlePrinters.find(
        (p) => p.id === job.printerId
      );

      if (!printer) continue;

      await assignJobToPrinter(job, printer);

      matched = true;
      break;
    }

    // Re-fetch before handling tag-based jobs
    if (matched) continue;

    // ====================================================
    // STEP 2
    // TAG-BASED JOBS
    // Break after first dispatch so we re-fetch fresh state
    // ====================================================

    for (const job of tagBasedJobs) {
      const requiredTags = job.requiredTagIds || [];

      const printer = idlePrinters.find((printer) =>
        printer.tags.some((tag: any) =>
          requiredTags.includes(tag.tagId)
        )
      );

      if (!printer) continue;

      await assignJobToPrinter(job, printer);

      matched = true;
      break;
    }
  }

  return "Queue processed successfully";
};

/**
 * =========================================================
 * ASSIGN JOB TO PRINTER
 * =========================================================
 * FLOW:
 * 1. reserve printer
 * 2. mark job as DISPATCHED
 * 3. send MQTT message to PI
 * 4. log printer event
 * =========================================================
 */

const assignJobToPrinter = async (job: any, printer: any) => {
  // ======================================================
  // DB TRANSACTION
  // prevents race conditions
  // ======================================================

  await prisma.$transaction([
    prisma.printer.update({
      where: {
        id: printer.id,
      },
      data: {
        status: "RESERVED",
      },
    }),

    prisma.printJob.update({
      where: {
        id: job.id,
      },
      data: {
        printerId: printer.id,
        status: "DISPATCHED",
      },
    }),
  ]);

  // ======================================================
  // MQTT DISPATCH
  // ======================================================

  await publishStartJob({
    printerId: printer.id,
    jobId: job.id,
    fileUrl: job.part.fileUrl!,
  });

  // ======================================================
  // EVENT LOGGING
  // ====================================================== 

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