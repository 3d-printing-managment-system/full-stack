import { Router } from "express";
import * as ctrl from "../controllers/part.controller";

const router = Router();

router.post("/", ctrl.create);
router.get("/", ctrl.getAll);
router.delete("/", ctrl.deleteMany);
router.get("/:id", ctrl.getById);
router.put("/:id", ctrl.update);
router.delete("/:id", ctrl.remove);
/**
 * @swagger
 * tags:
 *   name: Parts
 *   description: Part/file management
 *
 * /api/parts:
 *   get:
 *     summary: Get all parts
 *     tags: [Parts]
 *     responses:
 *       200:
 *         description: List of parts
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Part'
 *   post:
 *     summary: Create a new part
 *     tags: [Parts]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [image, title, duration, nozzleDiameter, fileUrl, filamentUsed]
 *             properties:
 *               image: { type: string, example: "https://example.com/bracket.png" }
 *               title: { type: string, example: "Bracket v1" }
 *               duration: { type: integer, example: 120 }
 *               nozzleDiameter: { type: number, example: 0.4 }
 *               fileUrl: { type: string, example: "https://example.com/bracket.stl" }
 *               filamentUsed: { type: number, example: 15.5 }
 *     responses:
 *       201:
 *         description: Part created
 *   delete:
 *     summary: Delete multiple parts
 *     tags: [Parts]
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
 *         description: Parts deleted successfully
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
 * /api/parts/{id}:
 *   get:
 *     summary: Get part by ID
 *     tags: [Parts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Part found
 *       404:
 *         description: Part not found
 *   put:
 *     summary: Update a part
 *     tags: [Parts]
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
 *             $ref: '#/components/schemas/Part'
 *     responses:
 *       200:
 *         description: Part updated
 *   delete:
 *     summary: Delete a part and its related jobs
 *     tags: [Parts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Part deleted
 *       404:
 *         description: Part not found
 */
export default router;