import { Router } from "express";
import * as ctrl from "../controllers/printJob.controller";

const router = Router();

router.post("/", ctrl.createJob);
router.get("/", ctrl.getAllJobs);
router.delete("/", ctrl.deleteManyJobs);
router.get("/:id", ctrl.getJobById);

router.post("/:id/start", ctrl.startJob);
router.patch("/:id/progress", ctrl.updateJobProgress);
router.post("/:id/pause", ctrl.pauseJob);
router.post("/:id/resume", ctrl.resumeJob);
router.post("/:id/cancel", ctrl.cancelJob);  
router.post("/:id/fail", ctrl.failJob);

router.delete("/:id", ctrl.deleteJob);
/**
 * @swagger
 * tags:
 *   name: Print Jobs
 *   description: Print job lifecycle management
 *
 * /api/print-jobs:
 *   get:
 *     summary: Get all print jobs
 *     tags: [Print Jobs]
 *     responses:
 *       200:
 *         description: List of print jobs
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/PrintJob'
 *   post:
 *     summary: Create a new print job
 *     tags: [Print Jobs]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [printerId, fileId]
 *             properties:
 *               printerId: { type: string, example: "uuid-of-printer" }
 *               fileId: { type: string, example: "uuid-of-part" }
 *               estimatedTime: { type: integer, example: 120 }
 *     responses:
 *       201:
 *         description: Print job created
 *   delete:
 *     summary: Delete multiple print jobs
 *     tags: [Print Jobs]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - ids
 *             properties:
 *               ids:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["uuid1", "uuid2", "uuid3"]
 *     responses:
 *       200:
 *         description: Print jobs deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 deletedCount:
 *                   type: number
 *       400:
 *         description: Bad request
 *
 * /api/print-jobs/{id}:
 *   get:
 *     summary: Get print job by ID
 *     tags: [Print Jobs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Print job found
 *       404:
 *         description: Print job not found
 *   delete:
 *     summary: Delete a print job
 *     tags: [Print Jobs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Print job deleted
 *
 * /api/print-jobs/{id}/start:
 *   post:
 *     summary: Start a queued print job
 *     tags: [Print Jobs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Job started
 *       400:
 *         description: Job is not queued
 *
 * /api/print-jobs/{id}/pause:
 *   post:
 *     summary: Pause a printing job
 *     tags: [Print Jobs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Job paused
 *       400:
 *         description: Job is not printing
 *
 * /api/print-jobs/{id}/resume:
 *   post:
 *     summary: Resume a paused job
 *     tags: [Print Jobs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Job resumed
 *       400:
 *         description: Job is not paused
 *
 * /api/print-jobs/{id}/cancel:
 *   post:
 *     summary: Cancel a job
 *     tags: [Print Jobs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Job cancelled
 *       400:
 *         description: Job cannot be cancelled
 *
 * /api/print-jobs/{id}/fail:
 *   post:
 *     summary: Mark a job as failed
 *     tags: [Print Jobs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Job marked as failed
 *
 * /api/print-jobs/{id}/progress:
 *   patch:
 *     summary: Update job progress
 *     tags: [Print Jobs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [progress]
 *             properties:
 *               progress: { type: integer, minimum: 0, maximum: 100, example: 50 }
 *     responses:
 *       200:
 *         description: Progress updated
 *       400:
 *         description: Invalid progress value
 */
export default router;