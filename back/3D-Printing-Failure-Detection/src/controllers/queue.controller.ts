import { RequestHandler } from "express";
import * as queueService from "../services/queue.service";
import {
  enableProcessing,
  disableProcessing,
  isProcessingEnabled,
} from "../services/queue.state";

const handleError = (res: any, error: unknown) => {
  const message =
    error instanceof Error ? error.message : "Internal server error";

  const status =
    message.includes("not found") ? 404 :
    message.includes("required") || message.includes("must") ? 400 :
    500;

  return res.status(status).json({ error: message });
};

// ======================================================
// GET /queue/status
// Frontend checks this on load to sync button state
// ======================================================
export const getQueueStatusController: RequestHandler = (
  _req,
  res
) => {
  return res.status(200).json({
    enabled: isProcessingEnabled(),
  });
};

// ======================================================
// POST /queue/start
// One click — enables auto-processing + kicks first run
// ======================================================
export const startQueueController: RequestHandler = async (
  _req,
  res
) => {
  try {
    if (isProcessingEnabled()) {
      return res.status(200).json({
        success: true,
        message: "Queue processing already running",
      });
    }

    enableProcessing();
    const result = await queueService.processQueue();

    return res.status(200).json({
      success: true,
      message: result,
    });
  } catch (error) {
    handleError(res, error);
  }
};

// ======================================================
// POST /queue/stop
// Disables auto-processing — current jobs keep running
// ======================================================
export const stopQueueController: RequestHandler = (
  _req,
  res
) => {
  disableProcessing();

  return res.status(200).json({
    success: true,
    message: "Queue processing stopped",
  });
};