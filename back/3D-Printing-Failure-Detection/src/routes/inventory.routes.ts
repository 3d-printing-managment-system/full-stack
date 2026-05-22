import { Router } from "express";
import * as ctrl from "../controllers/inventory.controller";

const router = Router({ mergeParams: true });

router.post("/", ctrl.createInventory);
router.get("/", ctrl.getInventories);
router.delete("/", ctrl.deleteManyInventories);
router.get("/:id", ctrl.getInventoryById);
router.put("/:id", ctrl.updateInventory);
router.delete("/:id", ctrl.deleteInventory);
/**
 * @swagger
 * tags:
 *   name: Inventory
 *   description: Inventory management
 *
 * /api/inventory:
 *   get:
 *     summary: Get all inventory entries
 *     tags: [Inventory]
 *     responses:
 *       200:
 *         description: List of inventory entries
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Inventory'
 *   post:
 *     summary: Create an inventory entry
 *     tags: [Inventory]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [profile, orderNumber, updateType, quantity, date]
 *             properties:
 *               profile:
 *                 type: object
 *                 properties:
 *                   connect:
 *                     type: object
 *                     properties:
 *                       id: { type: string, example: "uuid-of-profile" }
 *               orderNumber: { type: string, example: "ORD-2024-001" }
 *               updateType: { type: string, enum: [ORDER, REDUCTION] }
 *               quantity: { type: integer, example: 3 }
 *               totalCost: { type: number, example: 45.99 }
 *               date: { type: string, format: date-time, example: "2024-01-15T10:00:00.000Z" }
 *     responses:
 *       201:
 *         description: Inventory entry created
 *   delete:
 *     summary: Delete multiple inventory entries
 *     tags: [Inventory]
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
 *         description: Inventory entries deleted successfully
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
 * /api/inventory/{id}:
 *   get:
 *     summary: Get inventory entry by ID
 *     tags: [Inventory]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Inventory entry found
 *       404:
 *         description: Inventory entry not found
 *   put:
 *     summary: Update an inventory entry
 *     tags: [Inventory]
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
 *               orderNumber: { type: string }
 *               updateType: { type: string, enum: [ORDER, REDUCTION] }
 *               quantity: { type: integer }
 *               totalCost: { type: number }
 *               date: { type: string, format: date-time }
 *     responses:
 *       200:
 *         description: Inventory entry updated
 *   delete:
 *     summary: Delete an inventory entry
 *     tags: [Inventory]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Inventory entry deleted
 *       404:
 *         description: Inventory entry not found
 */
export default router;