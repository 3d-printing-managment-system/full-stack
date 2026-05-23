import { Router } from "express";
import {
  getQueueStatusController,
  startQueueController,
  stopQueueController,
} from "../controllers/queue.controller";

const router = Router();

// GET  /queue/status  — current enabled state
router.get("/status", getQueueStatusController);

// POST /queue/start   — enable + first kick
router.post("/start", startQueueController);

// POST /queue/stop    — disable auto-dispatch
router.post("/stop", stopQueueController);

export default router;