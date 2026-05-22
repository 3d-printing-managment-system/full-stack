import { Router } from "express";
import * as ctrl from "../controllers/cmdLogs.controller";

const router = Router({ mergeParams: true });

router.post("/", ctrl.createCommandLog);
router.get("/", ctrl.getCommandLogs);
router.delete("/", ctrl.deleteManyCommandLogs);
router.get("/:id", ctrl.getCommandLogById);
router.put("/:id", ctrl.updateCommandLog);
router.delete("/:id", ctrl.deleteCommandLog);


/**
 * @swagger
 * tags:
 *   name: Command Logs
 *   description: Command log management
 *
 * /api/command-logs:
 *   get:
 *     summary: Get all command logs
 *     tags: [Command Logs]
 *     responses:
 *       200:
 *         description: List of command logs
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/CommandLog'
 *
 *   post:
 *     summary: Create a command log
 *     tags: [Command Logs]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - printer
 *               - gcodeCommand
 *               - status
 *             properties:
 *               printer:
 *                 type: object
 *                 properties:
 *                   connect:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: "uuid-of-printer"
 *               gcodeCommand:
 *                 type: object
 *                 properties:
 *                   connect:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: "uuid-of-command"
 *               status:
 *                 type: string
 *                 enum: [SENT, SUCCESS, ERROR]
 *               response:
 *                 type: string
 *                 nullable: true
 *     responses:
 *       201:
 *         description: Command log created
 *
 *   delete:
 *     summary: Delete multiple command logs
 *     tags: [Command Logs]
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
 *         description: Command logs deleted successfully
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
 * /api/command-logs/{id}:
 *   get:
 *     summary: Get command log by ID
 *     tags: [Command Logs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Command log found
 *       404:
 *         description: Command log not found
 *
 *   put:
 *     summary: Update a command log
 *     tags: [Command Logs]
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
 *               status:
 *                 type: string
 *                 enum: [SENT, SUCCESS, ERROR]
 *               response:
 *                 type: string
 *     responses:
 *       200:
 *         description: Command log updated
 *
 *   delete:
 *     summary: Delete a command log
 *     tags: [Command Logs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Command log deleted
 *       404:
 *         description: Command log not found
 */

export default router;