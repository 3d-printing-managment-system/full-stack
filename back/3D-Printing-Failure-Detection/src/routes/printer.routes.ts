import { Router } from "express";
import * as controller from "../controllers/printer.controller";
import printerTagRouter from "./printerTag.routes";
import commandLogRouter from "./cmdLogs.routes";
import maintenanceLogRouter from "./maintenanceLog.routes";

const router = Router();

router.post("/", controller.createPrinter);
router.get("/", controller.getPrinters);
router.delete("/", controller.deleteManyPrinters);
router.use("/:printerId/tags", printerTagRouter);
router.use("/:printerId/command-logs", commandLogRouter); 
router.use("/:printerId/maintenance-logs", maintenanceLogRouter);

router.get("/:id", controller.getPrinterById);
router.put("/:id", controller.updatePrinter);
router.delete("/:id", controller.deletePrinter);
/**
 * @swagger
 * tags:
 *   name: Printers
 *   description: Printer management
 *
 * /api/printers:
 *   get:
 *     summary: Get all printers
 *     tags: [Printers]
 *     responses:
 *       200:
 *         description: List of printers
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Printer'
 *   post:
 *     summary: Create a new printer
 *     tags: [Printers]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, model, status, ipAddress, nozzleDiameter, bedTemp, nozzleTemp, cameraLink, printerType]
 *             properties:
 *               name: { type: string, example: "Printer Alpha" }
 *               model: { type: string, example: "Ender 3 Pro" }
 *               status: { type: string, enum: [IDLE, PRINTING, PAUSED, OFFLINE] }
 *               ipAddress: { type: string, example: "192.168.1.100" }
 *               nozzleDiameter: { type: number, example: 0.4 }
 *               bedTemp: { type: number, example: 60.0 }
 *               nozzleTemp: { type: number, example: 200.0 }
 *               cameraLink: { type: string, example: "http://192.168.1.100/stream" }
 *               printerType: { type: string, example: "FDM" }
 *     responses:
 *       201:
 *         description: Printer created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Printer'
 *   delete:
 *     summary: Delete multiple printers
 *     tags: [Printers]
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
 *         description: Printers deleted successfully
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
 * /api/printers/{id}:
 *   get:
 *     summary: Get printer by ID
 *     tags: [Printers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Printer found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Printer'
 *       404:
 *         description: Printer not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *   put:
 *     summary: Update a printer
 *     tags: [Printers]
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
 *             $ref: '#/components/schemas/Printer'
 *     responses:
 *       200:
 *         description: Printer updated
 *       404:
 *         description: Printer not found
 *   delete:
 *     summary: Delete a printer and its related jobs
 *     tags: [Printers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Printer deleted
 *       404:
 *         description: Printer not found
 *
 * /api/printers/{printerId}/tags:
 *   get:
 *     summary: Get all tags for a printer
 *     tags: [Printers]
 *     parameters:
 *       - in: path
 *         name: printerId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of tags
 *   post:
 *     summary: Assign a tag to a printer
 *     tags: [Printers]
 *     parameters:
 *       - in: path
 *         name: printerId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [tagId]
 *             properties:
 *               tagId: { type: string, example: "uuid-of-tag" }
 *     responses:
 *       201:
 *         description: Tag assigned
 *       409:
 *         description: Tag already assigned
 *
 * /api/printers/{printerId}/tags/{tagId}:
 *   delete:
 *     summary: Remove a tag from a printer
 *     tags: [Printers]
 *     parameters:
 *       - in: path
 *         name: printerId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: tagId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Tag removed
 *       404:
 *         description: Tag not assigned
 *
 * /api/printers/{printerId}/command-logs:
 *   get:
 *     summary: Get command logs for a printer
 *     tags: [Printers]
 *     parameters:
 *       - in: path
 *         name: printerId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of command logs
 *
 * /api/printers/{printerId}/maintenance-logs:
 *   get:
 *     summary: Get maintenance logs for a printer
 *     tags: [Printers]
 *     parameters:
 *       - in: path
 *         name: printerId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of maintenance logs
 */

export default router;