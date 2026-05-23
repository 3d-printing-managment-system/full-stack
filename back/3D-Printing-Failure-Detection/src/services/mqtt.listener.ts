import mqtt from "mqtt";
import { prisma } from "../../lib/prisma";
import { processQueue } from "./queue.service";
import { isProcessingEnabled } from "./queue.state";
import { updateCommandLog } from "./cmdLogs.service";

const brokerUrl = process.env.MQTT_BROKER_URL as string;

const client = mqtt.connect(brokerUrl, {
  username: process.env.MQTT_USERNAME,
  password: process.env.MQTT_PASSWORD,
  keepalive: 60,
  clean: true,
  clientId: `backend-${Math.random().toString(16).slice(2)}`,
});

client.on("connect", () => {
  console.log("✅ MQTT listener connected");

  client.subscribe("printers/+/printer-state");
  client.subscribe("printers/+/jobs/job-state");
  client.subscribe("printers/+/handshake");
  client.subscribe("printers/+/command-state");

  console.log("📡 Subscribed to printer topics");
});

client.on("message", async (topic, message) => {
  try {
    const data = JSON.parse(message.toString());

    console.log("📩 topic:", topic);
    console.log("📩 data:", data);

    // ======================================================
    // 1. HANDSHAKE
    // Printer just came online as IDLE → check queue
    // ======================================================
    if (topic.includes("/handshake")) {
      await prisma.printer.upsert({
        where: { id: data.printerId },
        update: {
          name: data.name,
          model: data.model,
          nozzleDiameter: data.nozzleDiameter,
          status: "IDLE",
        },
        create: {
          id: data.printerId,
          name: data.name,
          model: data.model,
          nozzleDiameter: data.nozzleDiameter,
          ipAddress: "",
          status: "IDLE",
          nozzleTemp: 0,
          bedTemp: 0,
          cameraLink: "",
          printerType: "UNKNOWN",
        },
      });

      if (isProcessingEnabled()) await processQueue();
      return;
    }

    // ======================================================
    // 2. PRINTER STATE
    // Printer reported IDLE → dispatch next job
    // ======================================================
    if (topic.includes("/printer-state")) {
      const status = data.status
        ? data.status.toUpperCase()
        : "UNKNOWN";

      await prisma.printer.update({
        where: { id: data.printerId },
        data: {
          status,
          nozzleDiameter: data.nozzleDiameter,
          nozzleTemp: data.nozzleTemp,
          bedTemp: data.bedTemp,
        },
      });

      if (status === "IDLE" && isProcessingEnabled()) {
        await processQueue();
      }

      return;
    }

    // ======================================================
    // 3. JOB STATE
    // Job hit a terminal state → trigger queue
    // Safety net in case printer-state IDLE comes late
    // ======================================================
    if (topic.includes("/jobs/job-state")) {
      const statusMap: any = {
        QUEUED: "QUEUED",
        PRINTING: "PRINTING",
        PAUSED: "PAUSED",
        DONE: "DONE",
        FAILED: "FAILED",
        CANCELLED: "CANCELLED",
        DISPATCHED: "DISPATCHED",
      };

      const rawStatus = (data.status ?? "").toUpperCase();
  const mappedStatus = statusMap[rawStatus];

  // ✅ unknown status → skip entirely, never touch the job
  if (!mappedStatus) {
    console.warn(`⚠️ Unknown job status received: "${data.status}" for job ${data.jobId} — ignored`);
    return;
  }

      await prisma.printJob.update({
        where: { id: data.jobId },
        data: {
          status: mappedStatus,
          progress:data.progress,
          startedAt: data.startedAt
            ? new Date(data.startedAt)
            : undefined,
          finishedAt: data.finishedAt
            ? new Date(data.finishedAt)
            : undefined,
        },
      });

      const terminalStates = ["DONE", "FAILED", "CANCELLED"];
      if (
        terminalStates.includes(mappedStatus) &&
        isProcessingEnabled()
      ) {
        await processQueue();
      }

      return;
    }

    // ======================================================
    // 4. COMMAND STATE
    // ======================================================
   if (topic.includes("/command-state")) {
  try {
    const commandLogId = data.commandLogId;

    if (!commandLogId) {
      console.warn("Missing commandLogId in MQTT payload");
      return;
    }

    const existing = await prisma.commandLog.findUnique({
      where: { id: commandLogId },
    });

    if (!existing) {
      console.warn("Command log not found:", commandLogId);
      return;
    }

    await prisma.commandLog.update({
      where: { id: commandLogId },
      data: {
        status: (data.status ?? "").toUpperCase(),
        response: data.response ?? null,
      },
    });

    console.log("✅ Command log updated:", commandLogId);
    return;
  } catch (err) {
    console.error("❌ command-state update failed:", err);
  }
}
  } catch (err) {
    console.error("❌ MQTT ERROR:", err);
  }
});

export default client;