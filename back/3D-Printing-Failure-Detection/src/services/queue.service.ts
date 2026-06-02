import { prisma } from "../../lib/prisma";
import { publishStartJob } from "./mqtt.service";

let isProcessing = false;

export const processQueue = async () => {
  if (isProcessing) {
    console.log("⏳ Queue already processing...");
    return;
  }

  isProcessing = true;

  try {
    while (true) {
      // ============================================
      // 1. GET ALL AVAILABLE PRINTERS (IDLE ONLY)
      // ============================================
      const printers = await prisma.printer.findMany({
        where: { status: "IDLE" },
        include: { tags: true },
      });

      if (printers.length === 0) {
        console.log("🖨️ No idle printers available");
        break;
      }

      // ============================================
      // 2. GET QUEUED JOBS
      // ============================================
      const jobs = await prisma.printJob.findMany({
        where: { status: "QUEUED" },
        orderBy: { queuePosition: "asc" },
        include: { part: true },
      });

      if (jobs.length === 0) {
        console.log("📭 No queued jobs");
        break;
      }

      let matched = false;

      // ============================================
      // 3. TRY ASSIGN JOBS TO ANY AVAILABLE PRINTER
      // ============================================

      for (const job of jobs) {
        let printer = null;

        // -------------------------------
        // SPECIFIC PRINTER MODE
        // -------------------------------
        if (job.printerSelectionMode === "SPECIFIC_PRINTER") {
          printer = printers.find((p) => p.id === job.printerId);
        }

        // -------------------------------
        // TAG-BASED MODE
        // -------------------------------
        else if (
          job.printerSelectionMode === "NEXT_AVAILABLE_WITH_SPECIFIC_TAG"
        ) {
          const requiredTags = job.requiredTagIds || [];

          printer =
            printers.find((p) =>
              p.tags.some((tag: any) =>
                requiredTags.includes(tag.tagId)
              )
            ) ?? null;
        }

        // ============================================
        // IF MATCH FOUND → ASSIGN
        // ============================================
        if (printer) {
          await assignJobToPrinter(job, printer);

          // remove printer locally (so it is not reused in same loop)
          const index = printers.findIndex((p) => p.id === printer.id);
          if (index !== -1) printers.splice(index, 1);

          matched = true;
          break; // re-fetch fresh state next loop iteration
        }
      }

      // ============================================
      // 4. STOP IF NOTHING WAS MATCHED
      // ============================================
      if (!matched) {
        console.log("⏳ No matching printer-job pair found");
        break;
      }
    }
  } finally {
    isProcessing = false;
  }

  return "Queue processed successfully";
};

// ============================================
// SAFE ASSIGNMENT (NO LOGIC CHANGE)
// ============================================
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