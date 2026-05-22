import { Router } from "express";
import * as ctrl from "../controllers/maintenanceLog.controller";

const router = Router({ mergeParams: true });

router.post("/", ctrl.createMaintenanceLog);
router.get("/", ctrl.getMaintenanceLogs);
router.delete("/", ctrl.deleteManyMaintenanceLogs);
router.get("/:id", ctrl.getMaintenanceLogById);
router.put("/:id", ctrl.updateMaintenanceLog);
router.delete("/:id", ctrl.deleteMaintenanceLog);
/**
 * @swagger
 * tags:
 *   name: Maintenance Logs
 *   description: Maintenance log management
 *
 * /api/maintenance-logs:
 *   get:
 *     summary: Get all maintenance logs
 *     tags: [Maintenance Logs]
 *     responses:
 *       200:
 *         description: List of maintenance logs
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/MaintenanceLog'
 *   post:
 *     summary: Create a maintenance log
 *     tags: [Maintenance Logs]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [printer, type, description]
 *             properties:
 *               printer:
 *                 type: object
 *                 properties:
 *                   connect:
 *                     type: object
 *                     properties:
 *                       id: { type: string, example: "uuid-of-printer" }
 *               type: { type: string, enum: [REPAIR, ROUTINE, UPGRADE] }
 *               description: { type: string, example: "Cleaned print bed" }
 *               cost: { type: number, example: 0 }
 *     responses:
 *       201:
 *         description: Maintenance log created
 *   delete:
 *     summary: Delete multiple maintenance logs
 *     tags: [Maintenance Logs]
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
 *         description: Maintenance logs deleted successfully
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
 * /api/maintenance-logs/{id}:
 *   get:
 *     summary: Get maintenance log by ID
 *     tags: [Maintenance Logs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Maintenance log found
 *       404:
 *         description: Maintenance log not found
 *   put:
 *     summary: Update a maintenance log
 *     tags: [Maintenance Logs]
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
 *             properties:
 *               type: { type: string, enum: [REPAIR, ROUTINE, UPGRADE] }
 *               description: { type: string }
 *               cost: { type: number }
 *     responses:
 *       200:
 *         description: Maintenance log updated
 *   delete:
 *     summary: Delete a maintenance log
 *     tags: [Maintenance Logs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Maintenance log deleted
 */
export default router;